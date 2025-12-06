import cv2
import mediapipe as mp
import numpy as np
import sys
import os

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.ai_server import PoseAnalyzer

def test_video_analysis(input_path, output_path):
    print(f"Processing {input_path} -> {output_path}")
    
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        print("Error opening video file")
        return

    # Video properties
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    
    # Output writer
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    # Initialize MediaPipe
    mp_pose = mp.solutions.pose
    pose = mp_pose.Pose(
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
        model_complexity=1
    )
    mp_drawing = mp.solutions.drawing_utils
    
    # Initialize Analyzer
    analyzer = PoseAnalyzer()
    
    frame_count = 0
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        frame_count += 1
        
        # Convert to RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(frame_rgb)
        
        # Draw skeleton
        if results.pose_landmarks:
            # Analyze
            analysis = analyzer.analyze_pose(results.pose_landmarks.landmark)
            
            # Log Rep Counting Logic
            current_angle = analysis.get('current_angle', 0)
            current_stage = analysis.get('stage', '-')
            current_reps = analysis.get('reps', 0)
            
            # Print only interesting events to avoid spam
            if frame_count % 10 == 0 or current_stage != analyzer.stage or (current_reps > 0 and current_reps != analyzer.reps - 1): 
                 print(f"Frame {frame_count}: Angle={current_angle}, Stage={current_stage}, Reps={current_reps}")

            # Draw landmarks
            mp_drawing.draw_landmarks(
                frame,
                results.pose_landmarks,
                mp_pose.POSE_CONNECTIONS,
                mp_drawing.DrawingSpec(color=(0, 255, 0) if analysis.get("is_correct", False) else (0, 0, 255), thickness=2, circle_radius=2),
                mp_drawing.DrawingSpec(color=(255, 255, 255), thickness=2, circle_radius=2)
            )
            
            # Overlay Text
            cv2.putText(frame, f"Exercise: {analysis.get('exercise', 'Detecting...')}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
            cv2.putText(frame, f"Reps: {analysis.get('reps', 0)}", (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
            cv2.putText(frame, f"Angle: {analysis.get('current_angle', 0)}", (10, 110), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
            cv2.putText(frame, f"Stage: {analysis.get('stage', '-')}", (10, 150), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
            
            feedback = analysis.get("feedback", [])
            if feedback:
                cv2.putText(frame, f"Feedback: {feedback[0]}", (10, height - 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        
        out.write(frame)
        
        # Save key frames
        if frame_count % 50 == 0:
            cv2.imwrite(f"tests/frame_{frame_count}.jpg", frame)
            
    cap.release()
    out.release()
    print("Done!")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="tests/test_video.mp4", help="Path to input video")
    parser.add_argument("--output", default="tests/output_video.mp4", help="Path to output video")
    args = parser.parse_args()
    
    test_video_analysis(args.input, args.output)
