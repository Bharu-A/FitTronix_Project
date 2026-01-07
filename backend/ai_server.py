import cv2
import mediapipe as mp
import numpy as np
import base64

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import json
import uvicorn
import time
from collections import deque
import shutil
import os
import tempfile

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5,
    model_complexity=1
)

class PoseAnalyzer:
    def __init__(self):
        self.current_exercise = "Detecting..."
        self.reps = 0
        self.stage = None
        self.accuracy_history = deque(maxlen=30) # Store last 30 frames of accuracy
        self.last_feedback_time = 0
        self.bad_form_counter = 0
        self.prev_landmarks = None # For smoothing
        
        # Exercise specific thresholds
        self.exercises = {
            "squat": {"url": "https://www.youtube.com/watch?v=YaXPRqUwItQ"},
            "pushup": {"url": "https://www.youtube.com/watch?v=IODxDxX7oi4"},
            "lunge": {"url": "https://www.youtube.com/watch?v=QOVaHwm-Q6U"},
            "jumping_jack": {"url": "https://www.youtube.com/watch?v=2W4ZNSwoW_4"},
            "pullup": {"url": "https://www.youtube.com/watch?v=eGo4IYlbE5g"}
        }

    def calculate_angle(self, a, b, c):
        """Calculate the angle between three points (a, b, c)."""
        a = np.array(a)
        b = np.array(b)
        c = np.array(c)
        
        radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
        angle = np.abs(radians*180.0/np.pi)
        
        if angle > 180.0:
            angle = 360-angle
        return angle

    def smooth_landmarks(self, landmarks):
        """Apply Exponential Moving Average smoothing to landmarks."""
        if self.prev_landmarks is None:
            self.prev_landmarks = landmarks
            return landmarks
        
        smoothed = []
        alpha = 0.7 # Smoothing factor (lower = smoother but more lag)
        
        for i, lm in enumerate(landmarks):
            prev = self.prev_landmarks[i]
            # Smooth x, y, z
            sx = alpha * lm.x + (1 - alpha) * prev.x
            sy = alpha * lm.y + (1 - alpha) * prev.y
            sz = alpha * lm.z + (1 - alpha) * prev.z
            vis = lm.visibility # Don't smooth visibility
            
            # Create a localized object similar to the original landmark
            class Landmark:
                pass
            s_lm = Landmark()
            s_lm.x, s_lm.y, s_lm.z, s_lm.visibility = sx, sy, sz, vis
            smoothed.append(s_lm)
            
        self.prev_landmarks = smoothed
        return smoothed

    def detect_exercise(self, landmarks):
        """Heuristic to detect exercise based on pose."""
        # Get key landmarks
        nose = landmarks[mp_pose.PoseLandmark.NOSE.value]
        left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
        right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
        left_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
        right_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value]
        left_wrist = landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value]
        right_wrist = landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value]
        left_ankle = landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value]
        right_ankle = landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value]

        # 1. Check body orientation (Horizontal vs Vertical)
        shoulder_y = (left_shoulder.y + right_shoulder.y) / 2
        hip_y = (left_hip.y + right_hip.y) / 2
        ankle_y = (left_ankle.y + right_ankle.y) / 2
        
        # In video coordinates, y increases downwards.
        is_horizontal = abs(shoulder_y - ankle_y) < 0.25 
        
        if is_horizontal:
            return "pushup"
        
        # Vertical exercises
        
        # 2. Check for Pullup (Hands above head)
        hands_above_head = (left_wrist.y < nose.y) and (right_wrist.y < nose.y)
        if hands_above_head:
            # Differentiate from Jumping Jack: Jumping jack hands move continuously
            # Pullup users hang. This is tricky without temporal analysis.
            # Defaulting to pullup if purely static hands up, but let's favor jumping jack if wide.
            return "pullup"
            
        # 3. Check for Jumping Jack (Hands wide)
        hands_wide = abs(left_wrist.x - right_wrist.x) > abs(left_shoulder.x - right_shoulder.x) * 2.0
        if hands_wide:
             return "jumping_jack"

        # 4. Squat vs Lunge
        feet_split_y = abs(left_ankle.y - right_ankle.y) > 0.15
        if feet_split_y:
            return "lunge"
            
        return "squat"

    def analyze_pose(self, landmarks):
        # Apply smoothing
        smoothed_landmarks = self.smooth_landmarks(landmarks)
        
        # Auto-detect exercise 
        detected = self.detect_exercise(smoothed_landmarks)
        
        # Simple hysteresis could be added here to prevent rapid switching
        if self.current_exercise == "Detecting..." or self.current_exercise != detected:
             # Add a counter here for robustness (not implemented for brevity)
             self.current_exercise = detected
        
        if self.current_exercise == "squat":
            return self.analyze_squat(smoothed_landmarks)
        elif self.current_exercise == "pushup":
            return self.analyze_pushup(smoothed_landmarks)
        elif self.current_exercise == "lunge":
            return self.analyze_lunge(smoothed_landmarks)
        elif self.current_exercise == "jumping_jack":
            return self.analyze_jumping_jack(smoothed_landmarks)
        elif self.current_exercise == "pullup":
            return self.analyze_pullup(smoothed_landmarks)
        
        return {"feedback": ["Unknown exercise"], "accuracy": 0, "is_correct": False}

    def analyze_squat(self, landmarks):
        hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
        knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
        ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
        
        angle = self.calculate_angle(hip, knee, ankle)
        
        feedback = []
        is_correct = True
        accuracy = 0
        
        # Standing state (Loosened to 155 from 165)
        if angle > 155:
            self.stage = "up"
            accuracy = 100
            
        # Rep counting logic
        if angle > 155 and self.stage == "down":
            self.stage = "up"
            self.reps += 1
            feedback.append("Good rep!")

        # Descent logic
        if angle < 140:
            if self.stage == "up":
                self.stage = "down_progress"
            
            # Depth check (Loosened to 110 from 95)
            if angle < 110: # Good depth (approx parallel)
                self.stage = "down"
                accuracy = 100
                is_correct = True
            elif angle < 125: # Getting there
                 accuracy = 80
                 feedback.append("Go a bit lower")
            else: # Too high
                accuracy = 50
                if self.stage == "down_progress": 
                    feedback.append("Go lower!")
        
        # Form faults
        if angle < 65: # Too deep
            feedback.append("Too deep!")
            accuracy = 80 
            
        return {
            "exercise": "squat", 
            "feedback": feedback, 
            "accuracy": accuracy, 
            "is_correct": is_correct, 
            "reps": self.reps,
            "current_angle": int(angle),
            "stage": self.stage
        }

    def analyze_pushup(self, landmarks):
        shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
        elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
        wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x, landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
        
        angle = self.calculate_angle(shoulder, elbow, wrist)
        
        feedback = []
        is_correct = True
        accuracy = 0
        
        # Up state (Loosened to 150)
        if angle > 150:
            self.stage = "up"
            accuracy = 100
            
        if angle > 150 and self.stage == "down":
            self.stage = "up"
            self.reps += 1
            feedback.append("Pushup completed!")

        # Down state
        if angle < 150:
            if angle < 100: # Good depth (90 degrees + margin)
                self.stage = "down"
                accuracy = 100
            elif angle < 120:
                self.stage = "down" # Allow shallow reps to count but penalize score
                accuracy = 80
            else:
                 accuracy = 60
                 feedback.append("Lower your chest")
                 
        # Body alignment check
        hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
        ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
        shoulder_hip_angle = self.calculate_angle(shoulder, hip, ankle)
        
        if shoulder_hip_angle < 150: # Loosened align check
             feedback.append("Keep body straight!")
             is_correct = False
             accuracy -= 20
            
        return {
            "exercise": "pushup", 
            "feedback": feedback, 
            "accuracy": max(0, accuracy), 
            "is_correct": is_correct, 
            "reps": self.reps,
            "current_angle": int(angle),
            "stage": self.stage
        }

    def analyze_lunge(self, landmarks):
        # Simplified lunge analysis
        l_hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
        l_knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
        l_ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
        
        angle = self.calculate_angle(l_hip, l_knee, l_ankle)
        
        feedback = []
        is_correct = True
        accuracy = 0
        
        if angle > 155 and self.stage == "down":
            self.stage = "up"
            self.reps += 1
            feedback.append("Lunge completed!")

        if angle > 155:
            self.stage = "up"
            accuracy = 100
        elif angle < 110:
            self.stage = "down"
            accuracy = 100
        else:
             accuracy = 70
             feedback.append("Go deeper")
            
        return {
            "exercise": "lunge", 
            "feedback": feedback, 
            "accuracy": accuracy, 
            "is_correct": is_correct, 
            "reps": self.reps,
            "current_angle": int(angle),
            "stage": self.stage
        }

    def analyze_jumping_jack(self, landmarks):
        l_shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
        l_wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x, landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
        l_hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
        
        # Angle of arm relative to body
        # Simplified: check wrist y vs shoulder y
        
        feedback = []
        is_correct = True
        accuracy = 0
        
        if l_wrist[1] < l_shoulder[1]: # Hands up
            self.stage = "up"
            accuracy = 100
        elif l_wrist[1] > l_hip[1]: # Hands down
            self.stage = "down"
            accuracy = 100
            
        if self.stage == "up" and l_wrist[1] > l_hip[1]: # Completed cycle
            self.stage = "down"
            self.reps += 1
            feedback.append("Jumping Jack!")
            
        return {"exercise": "jumping_jack", "feedback": feedback, "accuracy": accuracy, "is_correct": is_correct, "reps": self.reps, "current_angle": 0, "stage": self.stage}

    def analyze_pullup(self, landmarks):
        l_shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
        l_elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
        l_wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x, landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
        
        angle = self.calculate_angle(l_shoulder, l_elbow, l_wrist)
        
        feedback = []
        is_correct = True
        accuracy = 0
        
        if self.stage == "up" and angle > 160:
            self.stage = "down"
            self.reps += 1
            feedback.append("Pullup completed!")

        if angle > 160: # Arms straight (down)
            self.stage = "down"
            accuracy = 100
        if angle < 70: # Arms bent (up)
            self.stage = "up"
            accuracy = 100
            
        return {"exercise": "pullup", "feedback": feedback, "accuracy": accuracy, "is_correct": is_correct, "reps": self.reps, "current_angle": int(angle), "stage": self.stage}

    def check_bad_form(self, accuracy):
        self.accuracy_history.append(accuracy)
        avg_accuracy = sum(self.accuracy_history) / len(self.accuracy_history) if self.accuracy_history else 100
        
        if len(self.accuracy_history) >= 20 and avg_accuracy < 60:
            self.bad_form_counter += 1
        else:
            self.bad_form_counter = 0
            
        if self.bad_form_counter > 30: # ~3 seconds of consistent bad form
            self.bad_form_counter = 0 # Reset
            # Return tutorial URL
            return self.exercises.get(self.current_exercise, {}).get("url")
        return None

# Global analyzer instance (for single user prototype)
# In a real multi-user app, this would be a dictionary of analyzers by session_id
analyzer = PoseAnalyzer()

@app.post("/analyze_video")
async def analyze_video(file: UploadFile = File(...)):
    # Save temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
        shutil.copyfileobj(file.file, temp_video)
        temp_video_path = temp_video.name
        
    print(f"Processing video: {temp_video_path}")
    
    cap = cv2.VideoCapture(temp_video_path)
    if not cap.isOpened():
        return {"error": "Could not open video file"}
        
    video_analyzer = PoseAnalyzer()
    
    # Use a fresh Pose instance for each video to reset tracking state
    with mp_pose.Pose(
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
        model_complexity=1
    ) as local_pose:
        
        total_frames = 0
        detected_exercises = {}
        all_feedback = []
        total_accuracy = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            total_frames += 1
            
            # Skip frames for speed (process every 3rd frame)
            if total_frames % 3 != 0:
                continue
                
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = local_pose.process(frame_rgb)
            
            if results.pose_landmarks:
                analysis = video_analyzer.analyze_pose(results.pose_landmarks.landmark)
                
                ex = analysis.get("exercise", "unknown")
                detected_exercises[ex] = detected_exercises.get(ex, 0) + 1
                
                if analysis.get("feedback"):
                    all_feedback.extend(analysis["feedback"])
                    
                total_accuracy += analysis.get("accuracy", 0)
            
    cap.release()
    os.unlink(temp_video_path) # Clean up
    
    # Determine dominant exercise
    dominant_exercise = max(detected_exercises, key=detected_exercises.get) if detected_exercises else "Unknown"
    
    # Unique feedback
    unique_feedback = list(set(all_feedback))
    
    avg_accuracy = int(total_accuracy / (total_frames / 3)) if total_frames > 0 else 0
    
    return {
        "exercise": dominant_exercise,
        "reps": video_analyzer.reps,
        "accuracy": avg_accuracy,
        "feedback": unique_feedback,
        "frames_processed": total_frames
    }

@app.websocket("/ws/analyze")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Client connected")
    
    # Reset analyzer on new connection
    global analyzer
    analyzer = PoseAnalyzer()
    
    try:
        while True:
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                image_data = message.get("image")
                
                if not image_data:
                    continue
                    
                encoded_data = image_data.split(',')[1]
                nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                # Check if frame is valid
                if frame is None:
                     continue

                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                results = pose.process(frame_rgb)
                
                response = {
                    "processed": True,
                    "feedback": [],
                    "is_correct": False,
                    "exercise": "Detecting...",
                    "reps": 0,
                    "accuracy": 0
                }
                
                if results.pose_landmarks:
                    landmarks = results.pose_landmarks.landmark
                    
                    # Analyze
                    analysis = analyzer.analyze_pose(landmarks)
                    response.update(analysis)
                    
                    # Check for bad form redirect
                    redirect_url = analyzer.check_bad_form(analysis["accuracy"])
                    if redirect_url:
                        response["redirect_url"] = redirect_url
                        response["feedback"].append("⚠️ BAD FORM DETECTED! Redirecting to tutorial...")
                    
                    response["landmarks"] = [
                        {"x": lm.x, "y": lm.y, "z": lm.z, "visibility": lm.visibility}
                        for lm in landmarks
                    ]
                
                await websocket.send_json(response)
                
            except json.JSONDecodeError:
                print("Invalid JSON received")
            except Exception as e:
                print(f"Error processing frame: {e}")
                traceback.print_exc()
                
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"Connection error: {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

