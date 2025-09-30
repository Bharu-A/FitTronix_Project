import React, { useRef, useEffect } from 'react';

const PoseCanvas = ({ videoRef, feedback, isVisible }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isVisible || !feedback || !feedback.pose) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;

    if (!video) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw pose landmarks and connections
    drawPose(ctx, feedback.pose, canvas.width, canvas.height);

    // Draw feedback indicators
    drawFeedback(ctx, feedback, canvas.width, canvas.height);

  }, [feedback, isVisible, videoRef]);

  const drawPose = (ctx, pose, width, height) => {
    if (!pose.keypoints) return;

    // Define connections between keypoints
    const connections = [
      ['left_shoulder', 'right_shoulder'],
      ['left_shoulder', 'left_elbow'],
      ['left_elbow', 'left_wrist'],
      ['right_shoulder', 'right_elbow'],
      ['right_elbow', 'right_wrist'],
      ['left_shoulder', 'left_hip'],
      ['right_shoulder', 'right_hip'],
      ['left_hip', 'right_hip'],
      ['left_hip', 'left_knee'],
      ['left_knee', 'left_ankle'],
      ['right_hip', 'right_knee'],
      ['right_knee', 'right_ankle']
    ];

    // Draw connections
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;

    connections.forEach(([start, end]) => {
      const startPoint = pose.keypoints.find(kp => kp.name === start);
      const endPoint = pose.keypoints.find(kp => kp.name === end);

      if (startPoint && endPoint && startPoint.score > 0.3 && endPoint.score > 0.3) {
        ctx.beginPath();
        ctx.moveTo(startPoint.x * width, startPoint.y * height);
        ctx.lineTo(endPoint.x * width, endPoint.y * height);
        ctx.stroke();
      }
    });

    // Draw keypoints
    pose.keypoints.forEach(keypoint => {
      if (keypoint.score > 0.3) {
        ctx.fillStyle = keypoint.score > 0.6 ? '#00ff00' : '#ffff00';
        ctx.beginPath();
        ctx.arc(keypoint.x * width, keypoint.y * height, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };

  const drawFeedback = (ctx, feedback, width, height) => {
    if (!feedback.feedback || feedback.feedback.length === 0) return;

    // Draw correctness score
    ctx.fillStyle = feedback.correctnessScore > 0.8 ? '#00ff00' : 
                   feedback.correctnessScore > 0.6 ? '#ffff00' : '#ff0000';
    ctx.font = '20px Arial';
    ctx.fillText(`Form: ${Math.round(feedback.correctnessScore * 100)}%`, 10, 30);

    // Draw risk level indicator
    if (feedback.riskLevel === 'high') {
      ctx.fillStyle = '#ff0000';
      ctx.fillText('HIGH RISK - ADJUST FORM', 10, 60);
    }

    // Draw rep count
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Reps: ${feedback.sessionStats?.totalReps || 0}`, width - 100, 30);
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ display: isVisible ? 'block' : 'none' }}
    />
  );
};

export default PoseCanvas;