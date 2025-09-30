
export const JOINT_INDICES = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32
};

export const calculateJointAngles = (keypoints) => {
  const angles = {};

  // Helper to get keypoint by name or index
  const getKeypoint = (name) => {
    return keypoints.find(kp => 
      kp.name === name.toLowerCase().replace('_', '') || 
      kp.index === JOINT_INDICES[name]
    );
  };

  // Calculate elbow angles
  const leftShoulder = getKeypoint('LEFT_SHOULDER');
  const leftElbow = getKeypoint('LEFT_ELBOW');
  const leftWrist = getKeypoint('LEFT_WRIST');
  
  const rightShoulder = getKeypoint('RIGHT_SHOULDER');
  const rightElbow = getKeypoint('RIGHT_ELBOW');
  const rightWrist = getKeypoint('RIGHT_WRIST');

  if (leftShoulder && leftElbow && leftWrist) {
    angles.leftElbow = calculateAngle(leftShoulder, leftElbow, leftWrist);
  }
  
  if (rightShoulder && rightElbow && rightWrist) {
    angles.rightElbow = calculateAngle(rightShoulder, rightElbow, rightWrist);
  }

  // Calculate knee angles
  const leftHip = getKeypoint('LEFT_HIP');
  const leftKnee = getKeypoint('LEFT_KNEE');
  const leftAnkle = getKeypoint('LEFT_ANKLE');
  
  const rightHip = getKeypoint('RIGHT_HIP');
  const rightKnee = getKeypoint('RIGHT_KNEE');
  const rightAnkle = getKeypoint('RIGHT_ANKLE');

  if (leftHip && leftKnee && leftAnkle) {
    angles.leftKnee = calculateAngle(leftHip, leftKnee, leftAnkle);
  }
  
  if (rightHip && rightKnee && rightAnkle) {
    angles.rightKnee = calculateAngle(rightHip, rightKnee, rightAnkle);
  }

  // Calculate shoulder angles
  if (leftElbow && leftShoulder && leftHip) {
    angles.leftShoulder = calculateAngle(leftElbow, leftShoulder, leftHip);
  }
  
  if (rightElbow && rightShoulder && rightHip) {
    angles.rightShoulder = calculateAngle(rightElbow, rightShoulder, rightHip);
  }

  // Calculate hip angles for posture
  if (leftShoulder && leftHip && leftKnee) {
    angles.leftHip = calculateAngle(leftShoulder, leftHip, leftKnee);
  }
  
  if (rightShoulder && rightHip && rightKnee) {
    angles.rightHip = calculateAngle(rightShoulder, rightHip, rightKnee);
  }

  return angles;
};

export const calculateAngle = (pointA, pointB, pointC) => {
  if (!pointA || !pointB || !pointC) return 0;
  
  const vectorBA = {
    x: pointA.x - pointB.x,
    y: pointA.y - pointB.y
  };
  
  const vectorBC = {
    x: pointC.x - pointB.x,
    y: pointC.y - pointB.y
  };
  
  const dotProduct = vectorBA.x * vectorBC.x + vectorBA.y * vectorBC.y;
  const magnitudeBA = Math.sqrt(vectorBA.x ** 2 + vectorBA.y ** 2);
  const magnitudeBC = Math.sqrt(vectorBC.x ** 2 + vectorBC.y ** 2);
  
  if (magnitudeBA === 0 || magnitudeBC === 0) return 0;
  
  const cosine = dotProduct / (magnitudeBA * magnitudeBC);
  const angle = Math.acos(Math.max(-1, Math.min(1, cosine)));
  
  return Math.round(angle * (180 / Math.PI));
};


export const calculateCorrectness = (currentAngles, exerciseType, repPhase) => {
  const exerciseStandards = {
    pushup: {
      start: { elbow: 170, shoulder: 45 },
      mid: { elbow: 90, shoulder: 90 },
      end: { elbow: 170, shoulder: 45 }
    },
    squat: {
      start: { knee: 170, hip: 170 },
      mid: { knee: 90, hip: 90 },
      end: { knee: 170, hip: 170 }
    }
  };

  const standards = exerciseStandards[exerciseType];
  if (!standards) return 100;

  const phase = repPhase || 'mid';
  const targetAngles = standards[phase];
  let totalScore = 0;
  let angleCount = 0;

  Object.keys(targetAngles).forEach(joint => {
    const currentAngle = currentAngles[`${joint}Angle`];
    if (currentAngle !== undefined) {
      const diff = Math.abs(currentAngle - targetAngles[joint]);
      const jointScore = Math.max(0, 100 - (diff * 2)); // 2 points per degree off
      totalScore += jointScore;
      angleCount++;
    }
  });

  return angleCount > 0 ? Math.round(totalScore / angleCount) : 100;
};

export const generateGuidance = (currentAngles, targetAngles, exerciseType) => {
  const messages = [];
  const thresholds = {
    elbow: 15,
    knee: 15,
    shoulder: 20
  };

  // Check each joint against target angles
  Object.keys(currentAngles).forEach(joint => {
    const currentAngle = currentAngles[joint];
    const targetAngle = targetAngles[joint];
    
    if (targetAngle && Math.abs(currentAngle - targetAngle) > thresholds[joint]) {
      if (currentAngle > targetAngle) {
        messages.push(`Bend your ${joint.replace('left', 'left ').replace('right', 'right ')} more`);
      } else {
        messages.push(`Straighten your ${joint.replace('left', 'left ').replace('right', 'right ')}`);
      }
    }
  });

  // Exercise-specific guidance
  if (exerciseType === 'pushup' && currentAngles.hip) {
    if (currentAngles.hip < 160) {
      messages.push('Keep your back straight - don\'t sag your hips');
    }
  }

  if (exerciseType === 'squat' && currentAngles.knee) {
    if (currentAngles.knee > 100 && currentAngles.hip > 100) {
      messages.push('Go deeper into your squat');
    }
  }

  return messages.slice(0, 3); // Limit to 3 messages
};