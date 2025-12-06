import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePoseDetection } from '../hooks/usePoseDetection';
import { useRepCounter } from '../hooks/useRepCounter';

const CameraFeed = ({ 
  exerciseType = 'pushup', 
  onPoseDetected, 
  onRepUpdate,
  isActive = true 
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState('');

  const { 
    isReady, 
    isLoading, 
    error: poseError, 
    startPoseEstimation, 
    stopPoseEstimation 
  } = usePoseDetection(videoRef, exerciseType);

  const { countRep, resetCounter } = useRepCounter(exerciseType);

  // Start camera
  const startCamera = async () => {
    try {
      setCameraError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        }
      });
      
      videoRef.current.srcObject = stream;
      setIsCameraOn(true);
      
      // Reset rep counter when starting new session
      resetCounter();
      
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError(
        err.name === 'NotAllowedError' 
          ? 'Camera permission denied. Please allow camera access.'
          : `Camera error: ${err.message}`
      );
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
    stopPoseEstimation();
  };

  // Draw pose skeleton on canvas
  const drawPose = (pose, ctx, width, height) => {
    if (!pose || !pose.keypoints) return;

    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00ff88';
    ctx.fillStyle = '#00ff88';

    // Draw keypoints
    pose.keypoints.forEach((keypoint) => {
      if (keypoint.score > 0.3) {
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // Draw skeleton connections
    const connections = [
      [0, 1], [0, 2], [1, 3], [2, 4], // Face
      [5, 6], [5, 7], [7, 9], [6, 8], [8, 10], // Upper body
      [5, 11], [6, 12], [11, 12], // Torso
      [11, 13], [13, 15], [12, 14], [14, 16] // Lower body
    ];

    connections.forEach(([i, j]) => {
      const kp1 = pose.keypoints[i];
      const kp2 = pose.keypoints[j];
      
      if (kp1.score > 0.3 && kp2.score > 0.3) {
        ctx.beginPath();
        ctx.moveTo(kp1.x, kp1.y);
        ctx.lineTo(kp2.x, kp2.y);
        ctx.stroke();
      }
    });
  };

  // Start pose estimation when camera and detector are ready
  useEffect(() => {
    if (isReady && isCameraOn && isActive) {
      startPoseEstimation((pose) => {
        if (pose) {
          // Draw pose on canvas
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          const width = canvas.width;
          const height = canvas.height;
          drawPose(pose, ctx, width, height);

          // Count reps and analyze form
          const repData = countRep(pose.keypoints);
          
          // Call callbacks
          onPoseDetected?.(pose);
          onRepUpdate?.(repData);
        }
      });
    }

    return () => {
      stopPoseEstimation();
    };
  }, [isReady, isCameraOn, isActive, startPoseEstimation, onPoseDetected, onRepUpdate, countRep]);

  // Toggle camera on/off when active prop changes
  useEffect(() => {
    if (isActive && !isCameraOn) {
      startCamera();
    } else if (!isActive && isCameraOn) {
      stopCamera();
    }
  }, [isActive]);

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }} // Mirror for user comfort
      />
      
      {/* Pose Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
        width={640}
        height={480}
      />

      {/* Camera Controls */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isCameraOn ? stopCamera : startCamera}
            className={`px-4 py-2 rounded-lg font-semibold ${
              isCameraOn 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isCameraOn ? '🛑 Stop Camera' : '📷 Start Camera'}
          </motion.button>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3 text-sm">
          {isLoading && (
            <div className="flex items-center text-yellow-400">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-400 mr-2"></div>
              Loading AI...
            </div>
          )}
          {isReady && (
            <div className="text-green-400 flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              AI Ready
            </div>
          )}
          {poseError && (
            <div className="text-red-400 flex items-center">
              <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
              AI Error
            </div>
          )}
        </div>
      </div>

      {/* Error Messages */}
      {cameraError && (
        <div className="absolute top-4 left-4 right-4 bg-red-900/90 border border-red-500 rounded-lg p-3">
          <p className="text-red-200 text-sm">{cameraError}</p>
        </div>
      )}

      {poseError && (
        <div className="absolute top-4 left-4 right-4 bg-yellow-900/90 border border-yellow-500 rounded-lg p-3">
          <p className="text-yellow-200 text-sm">
            Pose detection limited: {poseError}. Rep counting may be affected.
          </p>
        </div>
      )}

      {/* Camera Off Overlay */}
      {!isCameraOn && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-gray-300 mb-2">Camera is off</p>
            <p className="text-gray-400 text-sm">
              Click "Start Camera" to begin AI analysis
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraFeed;