// src/utils/poseRenderer.js
import { JOINT_INDICES, calculateJointAngles, generateGuidance } from './poseUtils';

export const drawPose = (canvas, keypoints, exerciseType) => {
  if (!canvas || !keypoints) return;

  const ctx = canvas.getContext('2d');
  
  // Set canvas size to match video
  if (canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Filter out low-confidence keypoints
  const validKeypoints = keypoints.filter(kp => kp.score > 0.3);
  
  if (validKeypoints.length === 0) return;

  const angles = calculateJointAngles(validKeypoints);
  const targetAngles = getTargetAngles(exerciseType, 'mid');
  const guidanceMessages = generateGuidance(angles, targetAngles, exerciseType);

  const weakJoints = guidanceMessages.map(msg => {
    if (msg.includes('elbow')) return ['leftElbow', 'rightElbow'];
    if (msg.includes('knee')) return ['leftKnee', 'rightKnee'];
    if (msg.includes('shoulder')) return ['leftShoulder', 'rightShoulder'];
    if (msg.includes('hip')) return ['leftHip', 'rightHip'];
    return [];
  }).flat();

  // Draw keypoints
  validKeypoints.forEach((kp) => {
    if (kp.score > 0.3) {
      const jointName = Object.keys(JOINT_INDICES).find(name => JOINT_INDICES[name] === kp.name || JOINT_INDICES[name] === kp.index);
      const isWeak = weakJoints.includes(jointName?.toLowerCase());
      
      ctx.beginPath();
      ctx.arc(kp.x * canvas.width, kp.y * canvas.height, 6, 0, 2 * Math.PI);
      ctx.fillStyle = isWeak ? '#ff4444' : '#00ff00';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });

  // Define connections for skeleton
  const connections = [
    ['LEFT_SHOULDER', 'RIGHT_SHOULDER'],
    ['LEFT_SHOULDER', 'LEFT_ELBOW'],
    ['LEFT_ELBOW', 'LEFT_WRIST'],
    ['RIGHT_SHOULDER', 'RIGHT_ELBOW'],
    ['RIGHT_ELBOW', 'RIGHT_WRIST'],
    ['LEFT_SHOULDER', 'LEFT_HIP'],
    ['RIGHT_SHOULDER', 'RIGHT_HIP'],
    ['LEFT_HIP', 'RIGHT_HIP'],
    ['LEFT_HIP', 'LEFT_KNEE'],
    ['LEFT_KNEE', 'LEFT_ANKLE'],
    ['RIGHT_HIP', 'RIGHT_KNEE'],
    ['RIGHT_KNEE', 'RIGHT_ANKLE']
  ];

  // Draw skeleton
  connections.forEach(([partA, partB]) => {
    const kpAIndex = JOINT_INDICES[partA];
    const kpBIndex = JOINT_INDICES[partB];
    
    const kpA = validKeypoints.find(kp => 
      kp.index === kpAIndex || kp.name === partA.toLowerCase().replace('_', '')
    );
    const kpB = validKeypoints.find(kp => 
      kp.index === kpBIndex || kp.name === partB.toLowerCase().replace('_', '')
    );

    if (kpA && kpB && kpA.score > 0.3 && kpB.score > 0.3) {
      const isWeak = weakJoints.includes(partA.toLowerCase()) || weakJoints.includes(partB.toLowerCase());

      ctx.beginPath();
      ctx.moveTo(kpA.x * canvas.width, kpA.y * canvas.height);
      ctx.lineTo(kpB.x * canvas.width, kpB.y * canvas.height);
      ctx.strokeStyle = isWeak ? '#ff4444' : '#00ff00';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  });

  // Draw guidance text
  if (guidanceMessages.length > 0) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    
    guidanceMessages.forEach((message, index) => {
      ctx.fillText(`💡 ${message}`, 10, 30 + (index * 25));
    });
  }
};

// Helper function to get target angles for different exercises
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
    },
    lunge: {
      start: { knee: 170, hip: 170 },
      mid: { frontKnee: 90, backKnee: 90 },
      bottom: { frontKnee: 90, backKnee: 90 },
      end: { knee: 170, hip: 170 }
    },
    plank: {
      start: { elbow: 90, shoulder: 90, hip: 180 },
      mid: { elbow: 90, shoulder: 90, hip: 180 },
      end: { elbow: 90, shoulder: 90, hip: 180 }
    }
  };
  
  return targets[exerciseType]?.[phase] || targets[exerciseType]?.mid || {};
};

// Additional drawing utility for specific exercise feedback
export const drawExerciseFeedback = (canvas, keypoints, exerciseType, feedback) => {
  if (!canvas || !keypoints) return;

  const ctx = canvas.getContext('2d');
  
  // Draw the pose first
  drawPose(canvas, keypoints, exerciseType);
  
  // Add specific feedback highlights
  if (feedback && feedback.weakAreas) {
    feedback.weakAreas.forEach(area => {
      const jointIndex = JOINT_INDICES[area.toUpperCase()];
      const kp = keypoints.find(kp => kp.index === jointIndex);
      
      if (kp && kp.score > 0.3) {
        // Draw a pulsing circle around weak joints
        ctx.beginPath();
        ctx.arc(kp.x * canvas.width, kp.y * canvas.height, 15, 0, 2 * Math.PI);
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  }
};