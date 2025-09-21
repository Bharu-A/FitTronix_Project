import React, { useState } from 'react';
import { motion } from 'framer-motion';

const FitTronixSchedule = () => {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [workouts, setWorkouts] = useState({
    Monday: [
      { id: 1, name: 'Cyber Circuit Training', time: '07:00 AM', duration: '45 min', completed: true },
      { id: 2, name: 'Neural Flex Yoga', time: '12:30 PM', duration: '30 min', completed: false }
    ],
    Tuesday: [
      { id: 3, name: 'Synth Strength', time: '08:00 AM', duration: '60 min', completed: false }
    ],
    Wednesday: [
      { id: 4, name: 'Holo-Cycling', time: '06:00 PM', duration: '45 min', completed: false }
    ],
    Thursday: [
      { id: 5, name: 'Quantum Cardio', time: '07:30 AM', duration: '30 min', completed: false }
    ],
    Friday: [
      { id: 6, name: 'Cybernetic Core', time: '06:00 AM', duration: '40 min', completed: false },
      { id: 7, name: 'VR Battle Fitness', time: '07:00 PM', duration: '50 min', completed: false }
    ],
    Saturday: [
      { id: 8, name: 'Neon Flex Stretching', time: '09:00 AM', duration: '30 min', completed: false }
    ],
    Sunday: [] // Rest day
  });

  const upcomingSessions = [
    { id: 3, name: 'Synth Strength', day: 'Tuesday', time: '08:00 AM', countdown: '22:45:12' },
    { id: 4, name: 'Holo-Cycling', day: 'Wednesday', time: '06:00 PM', countdown: '46:45:12' },
    { id: 5, name: 'Quantum Cardio', day: 'Thursday', time: '07:30 AM', countdown: '70:15:32' }
  ];

  const aiSuggestions = [
    { name: 'Neural Flex Yoga', reason: 'Based on your stress levels', category: 'Recovery' },
    { name: 'Cybernetic Core', reason: 'To improve your overall strength', category: 'Strength' }
  ];

  const motivationalQuotes = [
    "The circuit of success is built with reps of determination.",
    "Your body is a biomechanical marvel; upgrade it daily.",
    "In the matrix of fitness, you are the prime program.",
    "Glow brighter than your excuses.",
    "Resistance is not futile—it's how strength is forged."
  ];

  const [currentQuote] = useState(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-cyan-500/10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1533139502658-0198f920d8e8?ixlib=rb-4.0.3')] bg-cover bg-center mix-blend-overlay opacity-10"></div>
        
        <div className="relative container mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              Your Cyber Fitness
            </span>
            <br />
            <span className="neon-text">Schedule</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-cyan-200 max-w-3xl mx-auto"
          >
            Program your body for peak performance in the digital age
          </motion.p>
        </div>
      </section>

      {/* Weekly Calendar View */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-center neon-text-cyan">Weekly Program</h2>
        
        <div className="grid grid-cols-7 gap-4 mb-12">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
            <motion.div 
              key={day}
              whileHover={{ scale: 1.05 }}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedDay === day 
                  ? 'border-cyan-400 bg-cyan-900/20 shadow-lg shadow-cyan-500/30' 
                  : 'border-purple-700/50 bg-gray-800/50'
              } ${workouts[day].length === 0 ? 'bg-pink-900/30 border-pink-500' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              <h3 className="font-bold text-center mb-2">{day}</h3>
              {workouts[day].length === 0 ? (
                <div className="text-center py-4">
                  <span className="text-pink-400 neon-text-pink">REST DAY</span>
                </div>
              ) : (
                <ul>
                  {workouts[day].map((workout) => (
                    <li key={workout.id} className="mb-2 p-2 bg-gray-700/30 rounded">
                      <div className="font-medium text-cyan-300">{workout.name}</div>
                      <div className="text-xs text-gray-400">{workout.time}</div>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>

        {/* Daily Timeline View */}
        <h2 className="text-3xl font-bold mb-8 text-center neon-text-pink">{selectedDay} Timeline</h2>
        
        <div className="relative border-l-2 border-cyan-400 border-opacity-50 ml-4 pl-8 py-4 space-y-12">
          {workouts[selectedDay].length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">😴</div>
              <h3 className="text-2xl font-bold text-pink-400 neon-text-pink">Recovery Day</h3>
              <p className="text-gray-400">Your body is charging for the next challenges</p>
            </div>
          ) : (
            workouts[selectedDay].map((workout, index) => (
              <motion.div 
                key={workout.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="absolute -left-11 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center neon-circle">
                  <div className="w-4 h-4 bg-cyan-300 rounded-full"></div>
                </div>
                <div className={`p-6 rounded-xl border ${workout.completed ? 'border-green-400 bg-green-900/20' : 'border-cyan-400 bg-gray-800/50'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{workout.name}</h3>
                      <p className="text-cyan-300">{workout.time} • {workout.duration}</p>
                    </div>
                    {workout.completed && (
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">Completed</span>
                    )}
                  </div>
                  <button className="mt-4 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-300 transition-all">
                    View Details
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Upcoming Sessions */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-center neon-text-purple">Upcoming Sessions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingSessions.map((session, index) => (
            <motion.div 
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 border border-purple-400 rounded-xl bg-gradient-to-br from-purple-900/20 to-gray-800/50 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">{session.name}</h3>
                <p className="text-purple-300">{session.day} • {session.time}</p>
                <div className="mt-4 p-3 bg-gray-900/50 rounded-lg">
                  <span className="text-cyan-300 font-mono">{session.countdown}</span>
                </div>
                <button className="mt-4 w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all">
                  Set Reminder
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Progress & Streaks */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-center neon-text-cyan">Progress & Streaks</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-1 p-6 border border-cyan-400 rounded-xl bg-gray-800/30 text-center"
          >
            <div className="text-5xl mb-4">🔥</div>
            <div className="text-4xl font-bold text-cyan-300 neon-text">7</div>
            <p className="text-gray-400">Day Streak</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="col-span-2 p-6 border border-pink-400 rounded-xl bg-gray-800/30"
          >
            <h3 className="text-xl font-bold mb-4">Weekly Completion</h3>
            <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
              <div className="bg-gradient-to-r from-cyan-400 to-pink-500 h-4 rounded-full w-7/12"></div>
            </div>
            <p className="text-right text-cyan-300">7/12 workouts completed</p>
          </motion.div>
        </div>
      </section>

      {/* AI Suggestions */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-center neon-text-pink">AI Recommendations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {aiSuggestions.map((suggestion, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 border border-pink-400 rounded-xl bg-gradient-to-br from-pink-900/20 to-gray-800/50"
            >
              <div className="flex items-start mb-4">
                <div className="bg-pink-500/20 p-2 rounded-lg mr-4">
                  <span className="text-pink-300">🤖</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{suggestion.name}</h3>
                  <span className="text-xs px-2 py-1 bg-pink-500/20 text-pink-300 rounded-full">
                    {suggestion.category}
                  </span>
                </div>
              </div>
              <p className="text-gray-300">{suggestion.reason}</p>
              <button className="mt-4 px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg transition-all">
                Add to Schedule
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Motivational Quote */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="container mx-auto px-4 py-16 text-center"
      >
        <div className="max-w-3xl mx-auto p-8 border border-cyan-400 rounded-xl bg-cyan-900/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full translate-x-16 translate-y-16"></div>
          
          <div className="relative z-10">
            <span className="text-5xl mb-4 block">"</span>
            <p className="text-2xl italic mb-4 neon-text-cyan">{currentQuote}</p>
            <span className="text-cyan-300">- FitTronix Motivator v2.5</span>
          </div>
        </div>
      </motion.section>

      {/* Custom CSS for neon effects */}
      <style jsx>{`
        .neon-text {
          text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0073e6, 0 0 20px #0073e6, 0 0 25px #0073e6;
          color: #fff;
          animation: pulsate 2s infinite alternate;
        }
        
        .neon-text-cyan {
          text-shadow: 0 0 5px rgba(34, 211, 238, 0.5), 0 0 10px rgba(34, 211, 238, 0.5), 0 0 15px rgba(34, 211, 238, 0.5), 0 0 20px rgba(34, 211, 238, 0.5);
          color: #22d3ee;
        }
        
        .neon-text-pink {
          text-shadow: 0 0 5px rgba(236, 72, 153, 0.5), 0 0 10px rgba(236, 72, 153, 0.5), 0 0 15px rgba(236, 72, 153, 0.5), 0 0 20px rgba(236, 72, 153, 0.5);
          color: #ec4899;
        }
        
        .neon-text-purple {
          text-shadow: 0 0 5px rgba(168, 85, 247, 0.5), 0 0 10px rgba(168, 85, 247, 0.5), 0 0 15px rgba(168, 85, 247, 0.5), 0 0 20px rgba(168, 85, 247, 0.5);
          color: #a855f7;
        }
        
        .neon-circle {
          box-shadow: 0 0 5px #22d3ee, 0 0 10px #22d3ee, inset 0 0 5px #22d3ee;
        }
        
        @keyframes pulsate {
          0% {
            text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0073e6, 0 0 20px #0073e6;
          }
          100% {
            text-shadow: 0 0 10px #fff, 0 0 15px #0073e6, 0 0 20px #0073e6, 0 0 25px #0073e6;
          }
        }
      `}</style>
    </div>
  );
};

export default FitTronixSchedule;