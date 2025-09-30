import React from 'react';

const SessionStats = ({ accuracy, reps, sets, calories, duration }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="session-stats">
      <h3>Session Statistics</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{accuracy}%</div>
          <div className="stat-label">Accuracy</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-value">{reps}</div>
          <div className="stat-label">Reps</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-value">{sets}</div>
          <div className="stat-label">Sets</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-value">{calories}</div>
          <div className="stat-label">Calories</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-value">{formatTime(duration)}</div>
          <div className="stat-label">Duration</div>
        </div>
      </div>
    </div>
  );
};

export default SessionStats;