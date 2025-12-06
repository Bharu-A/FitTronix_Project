import { useRef, useCallback } from 'react';

// Keypoint indices for MoveNet (17 keypoints)
const KEYPOINTS = {
  NOSE: 0,
  LEFT_EYE: 1,
  RIGHT_EYE: 2,
  LEFT_EAR: 3,
  RIGHT_EAR: 4,
  LEFT_SHOULDER: 5,
  RIGHT_SHOULDER: 6,
  LEFT_ELBOW: 7,
  RIGHT_ELBOW: 8,
  LEFT_WRIST: 9,
  RIGHT_WRIST: 10,
  LEFT_HIP: 11,
  RIGHT_HIP: 12,
  LEFT_KNEE: 13,
  RIGHT_KNEE: 14,
  LEFT_ANKLE: 15,
  RIGHT_ANKLE: 16
};

export const useRepCounter = (exerciseType = 'pushup') => {
  const stateRef = useRef({
    reps: 0,
    position: 'up', // 'up' | 'down'
    lastAngle: 0,
    confidence: 0,
    formFeedback: [],
    weakAreas: []
  });

  // Calculate angle between three points
  const calculateAngle = (a, b, c) => {
    if (!a || !b || !c || a.score < 0.3 || b.score < 0.3 || c.score < 0.3) {
      return null;
    }

    const ab = [b.x - a.x, b.y - a.y];
    const bc = [c.x - b.x, c.y - b.y];
    
    const dotProduct = ab[0] * bc[0] + ab[1] * bc[1];
    const magAB = Math.sqrt(ab[0] * ab[0] + ab[1] * ab[1]);
    const magBC = Math.sqrt(bc[0] * bc[0] + bc[1] * bc[1]);
    
    if (magAB === 0 || magBC === 0) return null;
    
    const cosine = dotProduct / (magAB * magBC);
    const angle = Math.acos(Math.max(-1, Math.min(1, cosine))) * (180 / Math.PI);
    return angle;
  };

  // Calculate distance between two points
  const calculateDistance = (a, b) => {
    if (!a || !b || a.score < 0.3 || b.score < 0.3) {
      return null;
    }
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
  };

  // Analyze pushup form
  const analyzePushup = useCallback((keypoints) => {
    const feedback = [];
    const weakAreas = [];
    let overallScore = 100;

    // Get keypoints
    const leftShoulder = keypoints[KEYPOINTS.LEFT_SHOULDER];
    const rightShoulder = keypoints[KEYPOINTS.RIGHT_SHOULDER];
    const leftElbow = keypoints[KEYPOINTS.LEFT_ELBOW];
    const rightElbow = keypoints[KEYPOINTS.RIGHT_ELBOW];
    const leftWrist = keypoints[KEYPOINTS.LEFT_WRIST];
    const rightWrist = keypoints[KEYPOINTS.RIGHT_WRIST];
    const leftHip = keypoints[KEYPOINTS.LEFT_HIP];
    const rightHip = keypoints[KEYPOINTS.RIGHT_HIP];
    const leftKnee = keypoints[KEYPOINTS.LEFT_KNEE];
    const rightKnee = keypoints[KEYPOINTS.RIGHT_KNEE];

    // Check back straightness (hip-shoulder alignment)
    if (leftShoulder && leftHip && leftKnee) {
      const backAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
      if (backAngle && backAngle < 160) {
        feedback.push("Keep your back straight - don't sag your hips");
        weakAreas.push('core');
        overallScore -= 20;
      }
    }

    // Check elbow position
    if (leftShoulder && leftElbow && leftWrist) {
      const elbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
      if (elbowAngle && elbowAngle > 90) {
        feedback.push("Keep elbows closer to your body");
        weakAreas.push('arms');
        overallScore -= 15;
      }
    }

    // Check depth (shoulder-elbow distance)
    if (leftShoulder && leftElbow) {
      const shoulderElbowDistance = Math.abs(leftShoulder.y - leftElbow.y);
      if (shoulderElbowDistance < 0.15) {
        feedback.push("Go deeper for full range of motion");
        weakAreas.push('depth');
        overallScore -= 10;
      }
    }

    // Check symmetry
    if (leftShoulder && rightShoulder && leftElbow && rightElbow) {
      const leftArmAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
      const rightArmAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
      
      if (leftArmAngle && rightArmAngle && Math.abs(leftArmAngle - rightArmAngle) > 15) {
        feedback.push("Maintain symmetry between both arms");
        weakAreas.push('symmetry');
        overallScore -= 10;
      }
    }

    return {
      feedback,
      weakAreas: [...new Set(weakAreas)], // Remove duplicates
      score: Math.max(0, overallScore)
    };
  }, []);

  // Analyze squat form
  const analyzeSquat = useCallback((keypoints) => {
    const feedback = [];
    const weakAreas = [];
    let overallScore = 100;

    const leftHip = keypoints[KEYPOINTS.LEFT_HIP];
    const rightHip = keypoints[KEYPOINTS.RIGHT_HIP];
    const leftKnee = keypoints[KEYPOINTS.LEFT_KNEE];
    const rightKnee = keypoints[KEYPOINTS.RIGHT_KNEE];
    const leftAnkle = keypoints[KEYPOINTS.LEFT_ANKLE];
    const rightAnkle = keypoints[KEYPOINTS.RIGHT_ANKLE];
    const leftShoulder = keypoints[KEYPOINTS.LEFT_SHOULDER];

    // Check knee alignment
    if (leftKnee && leftAnkle) {
      const kneeOverToe = Math.abs(leftKnee.x - leftAnkle.x);
      if (kneeOverToe > 0.1) {
        feedback.push("Keep knees aligned with toes");
        weakAreas.push('knees');
        overallScore -= 25;
      }
    }

    // Check depth
    if (leftHip && leftKnee && leftAnkle) {
      const hipKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
      if (hipKneeAngle && hipKneeAngle > 80) {
        feedback.push("Go deeper - aim for thighs parallel to ground");
        weakAreas.push('depth');
        overallScore -= 15;
      }
    }

    // Check back straightness
    if (leftShoulder && leftHip) {
      const backAngle = Math.abs(leftShoulder.x - leftHip.x);
      if (backAngle > 0.05) {
        feedback.push("Keep chest up and back straight");
        weakAreas.push('back');
        overallScore -= 20;
      }
    }

    // Check hip symmetry
    if (leftHip && rightHip) {
      const hipHeightDifference = Math.abs(leftHip.y - rightHip.y);
      if (hipHeightDifference > 0.05) {
        feedback.push("Keep hips level during movement");
        weakAreas.push('balance');
        overallScore -= 10;
      }
    }

    return {
      feedback,
      weakAreas: [...new Set(weakAreas)],
      score: Math.max(0, overallScore)
    };
  }, []);

  // Analyze lunge form
  const analyzeLunge = useCallback((keypoints) => {
    const feedback = [];
    const weakAreas = [];
    let overallScore = 100;

    const leftHip = keypoints[KEYPOINTS.LEFT_HIP];
    const rightHip = keypoints[KEYPOINTS.RIGHT_HIP];
    const leftKnee = keypoints[KEYPOINTS.LEFT_KNEE];
    const rightKnee = keypoints[KEYPOINTS.RIGHT_KNEE];
    const leftAnkle = keypoints[KEYPOINTS.LEFT_ANKLE];
    const rightAnkle = keypoints[KEYPOINTS.RIGHT_ANKLE];
    const leftShoulder = keypoints[KEYPOINTS.LEFT_SHOULDER];

    // Check front knee alignment
    if (leftKnee && leftAnkle) {
      const kneeOverToe = Math.abs(leftKnee.x - leftAnkle.x);
      if (kneeOverToe > 0.08) {
        feedback.push("Keep front knee behind toes");
        weakAreas.push('knees');
        overallScore -= 20;
      }
    }

    // Check depth
    if (leftHip && leftKnee) {
      const hipKneeDistance = calculateDistance(leftHip, leftKnee);
      if (hipKneeDistance && hipKneeDistance < 0.2) {
        feedback.push("Go deeper for better range");
        weakAreas.push('depth');
        overallScore -= 15;
      }
    }

    // Check torso alignment
    if (leftShoulder && leftHip) {
      const torsoAngle = Math.abs(leftShoulder.x - leftHip.x);
      if (torsoAngle > 0.03) {
        feedback.push("Keep torso upright");
        weakAreas.push('posture');
        overallScore -= 15;
      }
    }

    return {
      feedback,
      weakAreas: [...new Set(weakAreas)],
      score: Math.max(0, overallScore)
    };
  }, []);

  // Analyze plank form
  const analyzePlank = useCallback((keypoints) => {
    const feedback = [];
    const weakAreas = [];
    let overallScore = 100;

    const leftShoulder = keypoints[KEYPOINTS.LEFT_SHOULDER];
    const rightShoulder = keypoints[KEYPOINTS.RIGHT_SHOULDER];
    const leftHip = keypoints[KEYPOINTS.LEFT_HIP];
    const rightHip = keypoints[KEYPOINTS.RIGHT_HIP];
    const leftKnee = keypoints[KEYPOINTS.LEFT_KNEE];
    const rightKnee = keypoints[KEYPOINTS.RIGHT_KNEE];

    // Check back alignment
    if (leftShoulder && leftHip && leftKnee) {
      const backAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
      if (backAngle && (backAngle < 160 || backAngle > 190)) {
        feedback.push("Keep your body in a straight line");
        weakAreas.push('core');
        overallScore -= 25;
      }
    }

    // Check hip height
    if (leftShoulder && leftHip) {
      const shoulderHipHeight = Math.abs(leftShoulder.y - leftHip.y);
      if (shoulderHipHeight > 0.1) {
        feedback.push("Don't let hips sag or rise too high");
        weakAreas.push('hips');
        overallScore -= 20;
      }
    }

    // Check shoulder stability
    if (leftShoulder && rightShoulder) {
      const shoulderHeightDiff = Math.abs(leftShoulder.y - rightShoulder.y);
      if (shoulderHeightDiff > 0.05) {
        feedback.push("Keep shoulders level and stable");
        weakAreas.push('shoulders');
        overallScore -= 15;
      }
    }

    return {
      feedback,
      weakAreas: [...new Set(weakAreas)],
      score: Math.max(0, overallScore)
    };
  }, []);

  // Count reps based on exercise type
  const countRep = useCallback((keypoints) => {
    if (!keypoints || keypoints.length < 17) {
      return stateRef.current;
    }

    let angle = null;
    let analysis = { feedback: [], weakAreas: [], score: 100 };

    switch (exerciseType) {
      case 'pushup':
        analysis = analyzePushup(keypoints);
        // Use elbow angle for pushup rep counting
        const leftShoulder = keypoints[KEYPOINTS.LEFT_SHOULDER];
        const leftElbow = keypoints[KEYPOINTS.LEFT_ELBOW];
        const leftWrist = keypoints[KEYPOINTS.LEFT_WRIST];
        angle = calculateAngle(leftShoulder, leftElbow, leftWrist);
        break;

      case 'squat':
        analysis = analyzeSquat(keypoints);
        // Use hip-knee angle for squat rep counting
        const leftHip = keypoints[KEYPOINTS.LEFT_HIP];
        const leftKnee = keypoints[KEYPOINTS.LEFT_KNEE];
        const leftAnkle = keypoints[KEYPOINTS.LEFT_ANKLE];
        angle = calculateAngle(leftHip, leftKnee, leftAnkle);
        break;

      case 'lunge':
        analysis = analyzeLunge(keypoints);
        // Use hip-knee angle for lunge rep counting
        const lungeHip = keypoints[KEYPOINTS.LEFT_HIP];
        const lungeKnee = keypoints[KEYPOINTS.LEFT_KNEE];
        const lungeAnkle = keypoints[KEYPOINTS.LEFT_ANKLE];
        angle = calculateAngle(lungeHip, lungeKnee, lungeAnkle);
        break;

      case 'plank':
        analysis = analyzePlank(keypoints);
        // For plank, we don't count reps but monitor form over time
        angle = 90; // Default angle for plank (no rep counting)
        break;

      default:
        angle = 0;
    }

    if (angle !== null && exerciseType !== 'plank') {
      const state = stateRef.current;
      const downThreshold = exerciseType === 'pushup' ? 80 : 70;
      const upThreshold = exerciseType === 'pushup' ? 160 : 170;

      if (state.position === 'up' && angle < downThreshold) {
        state.position = 'down';
      } else if (state.position === 'down' && angle > upThreshold) {
        state.position = 'up';
        state.reps += 1;
      }

      state.lastAngle = angle;
      state.confidence = Math.min(100, analysis.score);
      state.formFeedback = analysis.feedback;
      state.weakAreas = analysis.weakAreas;
    } else if (exerciseType === 'plank') {
      // For plank, just update form analysis without rep counting
      const state = stateRef.current;
      state.confidence = Math.min(100, analysis.score);
      state.formFeedback = analysis.feedback;
      state.weakAreas = analysis.weakAreas;
    }

    return { ...stateRef.current };
  }, [exerciseType, analyzePushup, analyzeSquat, analyzeLunge, analyzePlank]);

  const resetCounter = useCallback(() => {
    stateRef.current = {
      reps: 0,
      position: 'up',
      lastAngle: 0,
      confidence: 0,
      formFeedback: [],
      weakAreas: []
    };
  }, []);

  return {
    countRep,
    resetCounter,
    getCurrentState: () => ({ ...stateRef.current })
  };
};