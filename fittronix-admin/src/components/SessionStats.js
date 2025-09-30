// src/components/SessionStats.js
import React from 'react';

const SessionStats = ({ stats }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-cyan-300">Session Stats</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Reps:</span>
          <span className="text-2xl font-bold text-green-400">{stats.reps}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Sets:</span>
          <span className="text-2xl font-bold text-blue-400">{stats.sets}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Calories:</span>
          <span className="text-2xl font-bold text-orange-400">{stats.calories}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Duration:</span>
          <span className="text-2xl font-bold text-purple-400">
            {Math.floor(stats.duration / 60)}:{(stats.duration % 60).toString().padStart(2, '0')}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Form Score:</span>
          <span className="text-2xl font-bold text-yellow-400">{stats.correctness}%</span>
        </div>
      </div>
    </div>
  );
};

export default SessionStats;