import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FeedbackPanel = ({ 
  feedback = [], 
  weakAreas = [], 
  accuracy = 0,
  reps = 0,
  className = '' 
}) => {
  const getAccuracyColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getAccuracyBg = (score) => {
    if (score >= 90) return 'bg-green-500/20 border-green-500/50';
    if (score >= 70) return 'bg-yellow-500/20 border-yellow-500/50';
    return 'bg-red-500/20 border-red-500/50';
  };

  return (
    <div className={`bg-gray-800/80 backdrop-blur-md rounded-xl p-6 border border-cyan-500/30 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-cyan-300">🤖 AI Coach</h3>
        <div className={`px-3 py-1 rounded-full border ${getAccuracyBg(accuracy)}`}>
          <span className={`text-sm font-semibold ${getAccuracyColor(accuracy)}`}>
            {accuracy}% Accuracy
          </span>
        </div>
      </div>

      {/* Rep Counter */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300">Reps Completed</span>
          <span className="text-2xl font-bold text-cyan-400">{reps}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div 
            className="bg-cyan-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (reps % 10) * 10)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Weak Areas */}
      {weakAreas.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-yellow-300 mb-3">Areas to Improve</h4>
          <div className="flex flex-wrap gap-2">
            {weakAreas.map((area, index) => (
              <motion.span
                key={area}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-full text-yellow-300 text-xs"
              >
                {area}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Real-time Feedback */}
      <div>
        <h4 className="text-sm font-semibold text-cyan-300 mb-3">Live Feedback</h4>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          <AnimatePresence>
            {feedback.length > 0 ? (
              feedback.map((message, index) => (
                <motion.div
                  key={`${message}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-3 bg-gray-700/50 rounded-lg border-l-4 border-cyan-500"
                >
                  <p className="text-sm text-gray-200">{message}</p>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-4 text-gray-400"
              >
                <div className="text-2xl mb-2">👋</div>
                <p className="text-sm">Start exercising to get AI feedback</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
        <h4 className="text-sm font-semibold text-cyan-300 mb-2">💡 Pro Tip</h4>
        <p className="text-xs text-cyan-200">
          {accuracy >= 90 
            ? "Excellent form! Maintain this technique for maximum results."
            : "Focus on one correction at a time. Quality over quantity!"
          }
        </p>
      </div>
    </div>
  );
};

export default FeedbackPanel;