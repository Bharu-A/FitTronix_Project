// src/components/FeedbackPanel.js - Updated version
import React from 'react';

const FeedbackPanel = ({ feedback }) => {
  const currentFeedback = feedback[0];

  if (!currentFeedback) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-cyan-300">Real-time Feedback</h3>
        <p className="text-gray-400">Start your workout to see feedback here</p>
      </div>
    );
  }

  const getExerciseDisplayName = (exerciseType) => {
    const names = {
      pushup: 'Push-up',
      squat: 'Squat',
      lunge: 'Lunge',
      plank: 'Plank'
    };
    return names[exerciseType] || exerciseType;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-cyan-300">Real-time Feedback</h3>
        <span className="px-3 py-1 bg-purple-600 rounded-full text-sm font-medium">
          {getExerciseDisplayName(currentFeedback.exerciseType)}
        </span>
      </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              currentFeedback.correctnessScore > 0.8 ? 'bg-green-500' :
              currentFeedback.correctnessScore > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${currentFeedback.correctnessScore * 100}%` }}
          ></div>
        </div>
      

      {/* Feedback Messages */}
      <div className="space-y-2">
        <h4 className="font-semibold text-gray-300">Improvements:</h4>
        {currentFeedback.feedback && currentFeedback.feedback.length > 0 ? (
          currentFeedback.feedback.map((msg, index) => (
            <div 
              key={index}
              className="flex items-start space-x-2 p-2 bg-gray-700 rounded"
            >
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-sm">{msg}</span>
            </div>
          ))
        ) : (
          <p className="text-green-400 text-sm">Great form! Keep it up!</p>
        )}
      </div>

      {/* Risk Level */}
      {currentFeedback.riskLevel !== 'low' && (
        <div className={`mt-4 p-3 rounded ${
          currentFeedback.riskLevel === 'high' ? 'bg-red-900 text-red-200' : 'bg-yellow-900 text-yellow-200'
        }`}>
          <strong>Risk Alert:</strong> {currentFeedback.riskLevel.toUpperCase()} risk of injury detected
        </div>
      )}

      {/* Fatigue Level */}
      {currentFeedback.fatigueLevel > 0.5 && (
        <div className="mt-4 p-3 bg-orange-900 text-orange-200 rounded">
          <strong>Fatigue Detected:</strong> Your form is deteriorating. Consider taking a break.
        </div>
      )}
    </div>
  );
};

export default FeedbackPanel;