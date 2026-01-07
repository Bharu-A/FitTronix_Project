import math
import numpy as np
from collections import deque

# --- Mocking the Classes from ai_server.py for standalone testing ---

class MockLandmark:
    def __init__(self, x, y, z=0, visibility=0.9):
        self.x = x
        self.y = y
        self.z = z
        self.visibility = visibility

class MockPoseLandmark:
    # MediaPipe indices
    NOSE = 0
    LEFT_SHOULDER = 11
    RIGHT_SHOULDER = 12
    LEFT_ELBOW = 13
    RIGHT_ELBOW = 14
    LEFT_WRIST = 15
    RIGHT_WRIST = 16
    LEFT_HIP = 23
    RIGHT_HIP = 24
    LEFT_KNEE = 25
    RIGHT_KNEE = 26
    LEFT_ANKLE = 27
    RIGHT_ANKLE = 28

# Mocking mp structure
class MockMP:
    class solutions:
        class pose:
            PoseLandmark = MockPoseLandmark

mp_pose = MockMP.solutions.pose

# --- Copying the logic from ai_server.py (simplified for demo) ---

class PoseAnalyzer:
    def __init__(self):
        self.current_exercise = "squat" # Force squat for demo
        self.reps = 0
        self.stage = "up"
        self.prev_landmarks = None

    def calculate_angle(self, a, b, c):
        a = np.array(a)
        b = np.array(b)
        c = np.array(c)
        radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
        angle = np.abs(radians*180.0/np.pi)
        if angle > 180.0: angle = 360-angle
        return angle

    def analyze_squat(self, landmarks):
        # Extract coordinates
        hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP].y]
        knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE].x, landmarks[mp_pose.PoseLandmark.LEFT_KNEE].y]
        ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].x, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].y]
        
        # Calculate Angle
        angle = self.calculate_angle(hip, knee, ankle)
        
        feedback = []
        status = "HOLD"
        
        # Logic
        if angle > 165:
            self.stage = "up"
            status = "STANDING"
            
        if angle > 165 and self.prev_stage == "down": # Just came up
            self.reps += 1
            feedback.append("Good rep!")
            
        if angle < 140:
            if self.stage == "up": self.stage = "down_progress"
            status = "DESCENDING"
            
            if angle < 95:
                self.stage = "down"
                status = "DEEP SQUAT (Perfect)"
            elif angle < 110:
                status = "SQUAT (Go lower)"
                feedback.append("Go a bit lower")
            
        self.prev_stage = self.stage
        
        return {
            "angle": int(angle),
            "stage": self.stage,
            "status": status,
            "reps": self.reps,
            "feedback": feedback
        }

# --- Simulation ---

def run_simulation():
    analyzer = PoseAnalyzer()
    analyzer.prev_stage = "up"
    
    print("--- STARTING SQUAT ANALYSIS SIMULATION ---")
    print(f"{'FRAME':<6} | {'HIP-KNEE-ANKLE ANGLE':<20} | {'STATUS':<20} | {'REPS':<5} | {'FEEDBACK'}")
    print("-" * 80)

    # Simulate a squat motion: Standing(180) -> Squatting(90) -> Standing(180)
    # We vary the Y coordinate of the Hip to simulate going down
    
    frames = []
    # 1. Standing
    for i in range(5): frames.append(175) 
    # 2. Descending
    for i in range(175, 85, -15): frames.append(i)
    # 3. Holding bottom
    for i in range(3): frames.append(90)
    # 4. Ascending
    for i in range(90, 180, 15): frames.append(i)
    
    # Create landmarks for each frame
    # Vertical line leg: Hip(0, 0), Knee(0, 1), Ankle(0, 2) -> Angle 180
    # Squat 90 deg: Hip(-1, 0), Knee(0, 0), Ankle(0.1, 1) ... simplified: just directly setting angle logic
    # Actually, let's just reverse-engineer landmarks from angle for realism implementation? 
    # Whatever, for this demo we directly use the simulated angle in the print loop to show logic response.
    # Wait, I need to pass landmarks to `analyze_squat` for it to calculate the angle.
    
    # Let's simple-math it: 
    # Knee at (0,0). Ankle at (0, 1). Hip moves to create angle.
    # If angle is A. Ankle vector is (0,1). Hip vector needs to be angle A relative to (0,-1)?
    # Let's just mock the 'calculate_angle' to return our desired frame angle for simplicity of the DEMO.
    # This proves the logic flow works.
    
    original_calc = analyzer.calculate_angle
    
    frame_count = 0
    for target_angle in frames:
        frame_count += 1
        
        # Monkey patch for simulation
        analyzer.calculate_angle = lambda a,b,c: target_angle
        
        # Dummy landmarks (content doesn't matter since we patched calc)
        dummy_lms = {
            mp_pose.PoseLandmark.LEFT_HIP: MockLandmark(0,0),
            mp_pose.PoseLandmark.LEFT_KNEE: MockLandmark(0,0),
            mp_pose.PoseLandmark.LEFT_ANKLE: MockLandmark(0,0)
        }
        
        result = analyzer.analyze_squat(dummy_lms)
        
        fb_str = ", ".join(result['feedback']) if result['feedback'] else ""
        print(f"{frame_count:<6} | {result['angle']:<20} | {result['status']:<20} | {result['reps']:<5} | {fb_str}")
        
    print("-" * 80)
    print("--- SIMULATION COMPLETE ---")

if __name__ == "__main__":
    run_simulation()
