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
        
        is_horizontal = abs(shoulder_y - ankle_y) < 0.2 # Rough check
        
        if is_horizontal:
            # Likely Pushup
            return "pushup"
        
        # Vertical exercises
        
        # 2. Check for Pullup (Hands above head)
        hands_above_head = (left_wrist.y < nose.y) and (right_wrist.y < nose.y)
        if hands_above_head:
            return "pullup"
            
        # 3. Check for Jumping Jack (Hands moving up/out wide)
        hands_wide = abs(left_wrist.x - right_wrist.x) > abs(left_shoulder.x - right_shoulder.x) * 1.5
        if hands_wide or hands_above_head: # Jumping jacks often have hands above head too
             return "jumping_jack"

        # 4. Squat vs Lunge
        # Lunge has significant x-difference between feet (if side view) or y-difference (if front view and stepping)
        # For simplicity, default to Squat if feet are roughly aligned, Lunge if split
        feet_split_y = abs(left_ankle.y - right_ankle.y) > 0.1
        if feet_split_y:
            return "lunge"
            
        return "squat"

    def analyze_pose(self, landmarks):
        # Auto-detect exercise if not locked in (or just always detect for now)
        detected = self.detect_exercise(landmarks)
        
        # Simple hysteresis/smoothing could be added here
        self.current_exercise = detected
        
        if detected == "squat":
            return self.analyze_squat(landmarks)
        elif detected == "pushup":
            return self.analyze_pushup(landmarks)
        elif detected == "lunge":
            return self.analyze_lunge(landmarks)
        elif detected == "jumping_jack":
            return self.analyze_jumping_jack(landmarks)
        elif detected == "pullup":
            return self.analyze_pullup(landmarks)
        
        return {"feedback": ["Unknown exercise"], "accuracy": 0, "is_correct": False}

    def analyze_squat(self, landmarks):
        hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
        knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
        ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
        
        angle = self.calculate_angle(hip, knee, ankle)
        
        feedback = []
        is_correct = True
        accuracy = 0
        
        # Rep counting
        if angle > 160 and self.stage == "down":
            self.stage = "up"
            self.reps += 1
            feedback.append("Good rep!")

        # Accuracy logic
        if angle > 160: # Standing
            accuracy = 100
            self.stage = "up"
        if angle < 100: # Deep squat
            self.stage = "down"
            accuracy = 100
            
        # Form feedback
        if angle < 70:
            feedback.append("Too deep!")
            is_correct = False
            accuracy = 50
        elif angle < 140 and angle > 100 and self.stage == "down":
             feedback.append("Go lower!")
             is_correct = False
             accuracy = 60
             
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
        
        if angle > 160 and self.stage == "down":
            self.stage = "up"
            self.reps += 1
            feedback.append("Pushup completed!")

        if angle > 160:
            self.stage = "up"
            accuracy = 100
        if angle < 90:
            self.stage = "down"
            accuracy = 100
            
        if angle < 160 and angle > 90 and self.stage == "down":
            feedback.append("Go lower!")
            is_correct = False
            accuracy = 50
            
        return {
            "exercise": "pushup", 
            "feedback": feedback, 
            "accuracy": accuracy, 
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
        
        if angle > 160 and self.stage == "down":
            self.stage = "up"
            self.reps += 1
            feedback.append("Lunge completed!")

        if angle > 160:
            self.stage = "up"
            accuracy = 100
        if angle < 100:
            self.stage = "down"
            accuracy = 100
            
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
            
        if self.stage == "down" and l_wrist[1] < l_shoulder[1]: # Transition to up
             pass
        
        if self.stage == "up" and l_wrist[1] > l_hip[1]: # Completed cycle
            self.stage = "down"
            self.reps += 1
            feedback.append("Jumping Jack!")
            
        return {"exercise": "jumping_jack", "feedback": feedback, "accuracy": accuracy, "is_correct": is_correct, "reps": self.reps}

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
            
        return {"exercise": "pullup", "feedback": feedback, "accuracy": accuracy, "is_correct": is_correct, "reps": self.reps}

    def check_bad_form(self, accuracy):
        self.accuracy_history.append(accuracy)
        avg_accuracy = sum(self.accuracy_history) / len(self.accuracy_history) if self.accuracy_history else 100
        
        if len(self.accuracy_history) >= 20 and avg_accuracy < 60:
            self.bad_form_counter += 1
        else:
            self.bad_form_counter = 0
            
        if self.bad_form_counter > 30: # ~3 seconds of consistent bad form
            self.bad_form_counter = 0 # Reset
            return self.exercises.get(self.current_exercise, {}).get("url")
        return None

# Global analyzer instance (for single user prototype)
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
        results = pose.process(frame_rgb)
        
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
                
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"Connection error: {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

