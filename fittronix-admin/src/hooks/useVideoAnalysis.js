// src/hooks/useVideoAnalysis.js
import { useState, useEffect, useRef, useCallback } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as mpPose from '@mediapipe/pose';
import { calculateJointAngles, calculateCorrectness, generateGuidance } from '../utils/poseUtils';
import { processFrame } from '../utils/analysisAlgorithms';
import { drawPose } from '../utils/poseRenderer'; // Correct import path

export const useVideoAnalysis = (exerciseType, userId) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detector, setDetector] = useState(null);
  const [sessionData, setSessionData] = useState({
    accuracy: 0,
    reps: 0,
    sets: 1,
    calories: 0,
    duration: 0,
    currentRepAccuracy: [],
    guidanceMessages: [],
    weakAreas: [],
    repState: { reps: 0, phase: 'start', inRep: false }
  });

  // Initialize pose detector
  useEffect(() => {
    const initializeDetector = async () => {
      try {
        const detectorConfig = {
          runtime: 'mediapipe',
          modelType: 'heavy',
          solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${mpPose.VERSION}`
        };
        
        const poseDetector = await poseDetection.createDetector(
          poseDetection.SupportedModels.BlazePose,
          detectorConfig
        );
        
        setDetector(poseDetector);
        console.log('✅ Pose detector initialized');
      } catch (error) {
        console.error('Error initializing pose detector:', error);
      }
    };

    initializeDetector();
  }, []);

  // Start video stream
  const startVideoStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 }, 
          frameRate: { ideal: 30 } 
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      return true;
    } catch (error) {
      console.error('Error accessing camera:', error);
      return false;
    }
  }, []);

  // Analyze frames in real-time
  const analyzeFrame = useCallback(async () => {
    if (!detector || !videoRef.current || !canvasRef.current || videoRef.current.readyState !== 4) {
      if (isAnalyzing) {
        animationRef.current = requestAnimationFrame(analyzeFrame);
      }
      return;
    }

    try {
      const poses = await detector.estimatePoses(videoRef.current);
      
      if (poses.length > 0 && poses[0].keypoints) {
        const pose = poses[0];
        const analysisResult = processFrame(pose, exerciseType, sessionData);
        
        setSessionData(prev => ({
          ...prev,
          accuracy: analysisResult.accuracy,
          reps: analysisResult.reps,
          currentRepAccuracy: analysisResult.currentRepAccuracy,
          guidanceMessages: analysisResult.guidanceMessages,
          weakAreas: analysisResult.weakAreas,
          calories: calculateCalories(prev.duration, exerciseType),
          duration: prev.duration + (1/30),
          repState: analysisResult.repState || prev.repState
        }));

        // Draw pose on canvas - FIXED: Now properly imported
        drawPose(canvasRef.current, pose.keypoints, exerciseType);
      }
    } catch (error) {
      console.error('Error analyzing frame:', error);
    }

    if (isAnalyzing) {
      animationRef.current = requestAnimationFrame(analyzeFrame);
    }
  }, [detector, exerciseType, isAnalyzing, sessionData]);

  // Start/stop analysis
  const startAnalysis = useCallback(async () => {
    const streamStarted = await startVideoStream();
    if (streamStarted && detector) {
      setIsAnalyzing(true);
      
      await new Promise(resolve => {
        if (videoRef.current.readyState >= 3) {
          resolve();
        } else {
          videoRef.current.onloadeddata = resolve;
        }
      });
      
      analyzeFrame();
      return true;
    }
    return false;
  }, [startVideoStream, detector, analyzeFrame]);

  const stopAnalysis = useCallback(() => {
    setIsAnalyzing(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  }, []);

  // Calculate calories based on duration and exercise type
  const calculateCalories = (duration, exercise) => {
    const caloriesPerMinute = {
      pushup: 8,
      squat: 7,
      lunge: 6,
      plank: 3,
      jumpingjack: 10
    };
    
    return Math.round((caloriesPerMinute[exercise] || 5) * (duration / 60));
  };

  return {
    videoRef,
    canvasRef,
    isAnalyzing,
    sessionData,
    startAnalysis,
    stopAnalysis,
    detector
  };
};