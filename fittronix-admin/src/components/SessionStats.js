import React from 'react';
import { motion } from 'framer-motion';

const SessionStats = ({ stats = {} }) => {
  const { reps = 0, accuracy = 0, calories = 0, duration = 0 } = stats;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const statCards = [
    {
      label: 'Reps',
      value: reps,
      icon: '💪',
      color: 'from-cyan-500 to-blue-500',
      unit: ''
    },
    {
      label: 'Accuracy',
      value: accuracy,
      icon: '🎯',
      color: 'from-green-500 to-emerald-500',
      unit: '%'
    },
    {
      label: 'Calories',
      value: calories,
      icon: '🔥',
      color: 'from-orange-500 to-red-500',
      unit: ''
    },
    {
      label: 'Duration',
      value: formatTime(duration),
      icon: '⏱️',
      color: 'from-purple-500 to-pink-500',
      unit: ''
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`bg-gradient-to-br ${stat.color} rounded-xl p-4 text-white shadow-lg`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{stat.icon}</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
              {stat.label}
            </span>
          </div>
          <div className="text-2xl font-bold">
            {stat.value}
            <span className="text-sm opacity-80">{stat.unit}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SessionStats;