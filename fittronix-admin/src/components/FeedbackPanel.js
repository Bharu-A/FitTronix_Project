import React from 'react';

const FeedbackPanel = ({ guidanceMessages = [], weakAreas = [], accuracy = 0 }) => {
  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 90) return 'green';
    if (accuracy >= 70) return 'orange';
    return 'red';
  };

  return (
    <div className="feedback-panel">
      <div className="accuracy-display">
        <h3>
          Accuracy: 
          <span style={{ color: getAccuracyColor(accuracy) }}>
            {accuracy}%
          </span>
        </h3>
      </div>
      
      <div className="guidance-messages">
        <h4>Real-time Guidance</h4>
        {guidanceMessages.length > 0 ? (
          <ul>
            {guidanceMessages.map((message, index) => (
              <li key={index} className="guidance-message">
                {message}
              </li>
            ))}
          </ul>
        ) : (
          <p>Great form! Keep it up!</p>
        )}
      </div>
      
      {weakAreas.length > 0 && (
        <div className="weak-areas">
          <h4>Areas to Improve</h4>
          <ul>
            {weakAreas.map((area, index) => (
              <li key={index}>{formatWeakArea(area)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const formatWeakArea = (area) => {
  const areaMap = {
    leftElbow: 'Left elbow alignment',
    rightElbow: 'Right elbow alignment',
    leftKnee: 'Left knee positioning',
    rightKnee: 'Right knee positioning',
    leftShoulder: 'Left shoulder form',
    rightShoulder: 'Right shoulder form',
  };
  
  return areaMap[area] || area;
};

export default FeedbackPanel;
