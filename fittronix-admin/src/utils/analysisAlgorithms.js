import { calculateJointAngles, calculateCorrectness, generateGuidance } from './poseUtils';

export const processFrame = (pose, exerciseType, sessionData) => {
  const keypoints = pose.keypoints;
  const angles = calculateJointAngles(keypoints);
  
  // Detect rep phase and count reps
  const repResult = detectRep(angles, exerciseType, sessionData);
  
  // Calculate correctness for current frame
  const correctness = calculateCorrectness(angles, exerciseType, repResult.phase);
  
  // Generate guidance messages
  const targetAngles = getTargetAngles(exerciseType, repResult.phase);
  const guidanceMessages = generateGuidance(angles, targetAngles, exerciseType);
  
  // Update weak areas
  const weakAreas = identifyWeakAreas(angles, targetAngles);
  
  return {
    accuracy: calculateOverallAccuracy([...sessionData.currentRepAccuracy, correctness]),
    reps: repResult.reps,
    currentRepAccuracy: [...sessionData.currentRepAccuracy, correctness],
    guidanceMessages,
    weakAreas: [...new Set([...sessionData.weakAreas, ...weakAreas])],
    phase: repResult.phase
  };
};

const detectRep = (angles, exerciseType, sessionData) => {
  let { reps, phase, inRep } = sessionData.repState || { reps: 0, phase: 'start', inRep: false };
  
  switch (exerciseType) {
    case 'pushup':
      return detectPushupRep(angles, reps, phase, inRep);
    case 'squat':
      return detectSquatRep(angles, reps, phase, inRep);
    default:
      return { reps, phase, inRep };
  }
};

const detectPushupRep = (angles, reps, phase, inRep) => {
  const elbowAngle = (angles.leftElbow + angles.rightElbow) / 2;
  
  if (!inRep && elbowAngle < 120) {
    // Starting descent
    inRep = true;
    phase = 'mid';
  } else if (inRep && elbowAngle > 160) {
    // Completed ascent
    reps++;
    inRep = false;
    phase = 'start';
  } else if (inRep && elbowAngle < 90) {
    // Bottom position
    phase = 'bottom';
  }
  
  return { reps, phase, inRep };
};

const detectSquatRep = (angles, reps, phase, inRep) => {
  const kneeAngle = (angles.leftKnee + angles.rightKnee) / 2;
  
  if (!inRep && kneeAngle < 140) {
    // Starting descent
    inRep = true;
    phase = 'mid';
  } else if (inRep && kneeAngle > 160) {
    // Completed ascent
    reps++;
    inRep = false;
    phase = 'start';
  } else if (inRep && kneeAngle < 100) {
    // Bottom position
    phase = 'bottom';
  }
  
  return { reps, phase, inRep };
};

const calculateOverallAccuracy = (accuracyArray) => {
  if (accuracyArray.length === 0) return 100;
  const sum = accuracyArray.reduce((a, b) => a + b, 0);
  return Math.round(sum / accuracyArray.length);
};

const identifyWeakAreas = (currentAngles, targetAngles) => {
  const weakAreas = [];
  const threshold = 20;
  
  Object.keys(currentAngles).forEach(joint => {
    if (Math.abs(currentAngles[joint] - targetAngles[joint]) > threshold) {
      weakAreas.push(joint);
    }
  });
  
  return weakAreas;
};

const getTargetAngles = (exerciseType, phase) => {
  const targets = {
    pushup: {
      start: { elbow: 170, shoulder: 45 },
      mid: { elbow: 120, shoulder: 75 },
      bottom: { elbow: 90, shoulder: 90 },
      end: { elbow: 170, shoulder: 45 }
    },
    squat: {
      start: { knee: 170, hip: 170 },
      mid: { knee: 120, hip: 120 },
      bottom: { knee: 90, hip: 90 },
      end: { knee: 170, hip: 170 }
    }
  };
  
  return targets[exerciseType]?.[phase] || targets[exerciseType]?.mid || {};
};