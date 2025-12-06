import * as tf from '@tensorflow/tfjs';
import * as posedetection from '@tensorflow-models/pose-detection';
import { useRef, useEffect, useState, useCallback } from 'react';

export const usePoseDetection = (videoRef, exerciseType = 'pushup') => {
  const detectorRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const frameIdRef = useRef(null);

  // Initialize TensorFlow.js and MoveNet detector
  useEffect(() => {
    let mounted = true;
    
    const initializeDetector = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Wait for TensorFlow.js to be ready
        await tf.ready();
        console.log('✅ TensorFlow.js loaded');

        // Create MoveNet detector (lightning-fast version)
        const detectorConfig = {
          modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true,
          minPoseScore: 0.25
        };

        const detector = await posedetection.createDetector(
          posedetection.SupportedModels.MoveNet,
          detectorConfig
        );

        if (mounted) {
          detectorRef.current = detector;
          setIsReady(true);
          console.log('✅ MoveNet detector initialized');
        }
      } catch (err) {
        console.error('❌ Error initializing pose detector:', err);
        if (mounted) {
          setError(`Failed to initialize AI: ${err.message}`);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeDetector();

    return () => {
      mounted = false;
      // Cleanup
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      if (detectorRef.current) {
        detectorRef.current.dispose();
      }
    };
  }, []);

  // Estimate poses from current video frame
  const estimatePoses = useCallback(async () => {
    if (!detectorRef.current || !videoRef.current || videoRef.current.readyState < 2) {
      return null;
    }

    try {
      const poses = await detectorRef.current.estimatePoses(videoRef.current, {
        maxPoses: 1,
        flipHorizontal: false
      });
      
      return poses.length > 0 ? poses[0] : null;
    } catch (err) {
      console.error('Error estimating poses:', err);
      return null;
    }
  }, [videoRef]);

  // Continuous pose estimation
  const startPoseEstimation = useCallback((callback) => {
    if (!isReady || !videoRef.current) return;

    const estimateLoop = async () => {
      const pose = await estimatePoses();
      if (pose) {
        callback(pose);
      }
      frameIdRef.current = requestAnimationFrame(estimateLoop);
    };

    frameIdRef.current = requestAnimationFrame(estimateLoop);
  }, [isReady, estimatePoses, videoRef]);

  const stopPoseEstimation = useCallback(() => {
    if (frameIdRef.current) {
      cancelAnimationFrame(frameIdRef.current);
      frameIdRef.current = null;
    }
  }, []);

  return {
    detector: detectorRef.current,
    isReady,
    isLoading,
    error,
    estimatePoses,
    startPoseEstimation,
    stopPoseEstimation
  };
};