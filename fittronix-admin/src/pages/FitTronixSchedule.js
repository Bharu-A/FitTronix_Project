import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FitTronixSchedule = () => {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [workouts, setWorkouts] = useState({
    Monday: [
      { 
        id: 1, 
        name: 'Cyber Circuit Training', 
        time: '07:00 AM', 
        duration: '45 min', 
        completed: true,
        details: {
          sets: 3,
          reps: '12-15',
          difficulty: 'Intermediate',
          aiTips: ['Focus on maintaining circuit pace', 'Keep heart rate in zone 3-4', 'Hydrate between sets'],
          description: 'High-intensity circuit training with cybernetic resistance'
        }
      },
      { 
        id: 2, 
        name: 'Neural Flex Yoga', 
        time: '12:30 PM', 
        duration: '30 min', 
        completed: false,
        details: {
          sets: 1,
          reps: 'Hold 30-60s',
          difficulty: 'Beginner',
          aiTips: ['Focus on breathing synchronization', 'Maintain neural connection throughout', 'Use VR enhancement for better form'],
          description: 'Mind-body connection training with neural feedback'
        }
      }
    ],
    Tuesday: [
      { 
        id: 3, 
        name: 'Synth Strength', 
        time: '08:00 AM', 
        duration: '60 min', 
        completed: false,
        details: {
          sets: 4,
          reps: '8-12',
          difficulty: 'Advanced',
          aiTips: ['Progressive overload key for synth gains', 'Monitor bio-feedback for optimal load', 'Recovery protocol essential'],
          description: 'Advanced strength training with synthetic resistance'
        }
      }
    ],
    Wednesday: [
      { 
        id: 4, 
        name: 'Holo-Cycling', 
        time: '06:00 PM', 
        duration: '45 min', 
        completed: false,
        details: {
          sets: 1,
          reps: 'Continuous',
          difficulty: 'Intermediate',
          aiTips: ['Maintain RPM between 80-100', 'Use holographic terrain for motivation', 'Track power output'],
          description: 'Immersive cycling in holographic environments'
        }
      }
    ],
    Thursday: [
      { 
        id: 5, 
        name: 'Quantum Cardio', 
        time: '07:30 AM', 
        duration: '30 min', 
        completed: false,
        details: {
          sets: 1,
          reps: 'Interval training',
          difficulty: 'Advanced',
          aiTips: ['Quantum intervals: 30s max effort, 90s recovery', 'Monitor quantum energy expenditure', 'Stay in quantum zone for optimal results'],
          description: 'Advanced interval training using quantum principles'
        }
      }
    ],
    Friday: [
      { 
        id: 6, 
        name: 'Cybernetic Core', 
        time: '06:00 AM', 
        duration: '40 min', 
        completed: false,
        details: {
          sets: 3,
          reps: '15-20',
          difficulty: 'Intermediate',
          aiTips: ['Engage cybernetic core throughout', 'Maintain proper form with bio-feedback', 'Progressive core activation'],
          description: 'Core strengthening with cybernetic resistance technology'
        }
      },
      { 
        id: 7, 
        name: 'VR Battle Fitness', 
        time: '07:00 PM', 
        duration: '50 min', 
        completed: false,
        details: {
          sets: 5,
          reps: 'Game-based',
          difficulty: 'Intermediate',
          aiTips: ['Use full range of motion in VR space', 'Stay engaged with battle scenarios', 'Track reaction times'],
          description: 'Gamified fitness in virtual reality combat scenarios'
        }
      }
    ],
    Saturday: [
      { 
        id: 8, 
        name: 'Neon Flex Stretching', 
        time: '09:00 AM', 
        duration: '30 min', 
        completed: false,
        details: {
          sets: 1,
          reps: 'Hold 45s',
          difficulty: 'Beginner',
          aiTips: ['Follow neon guidance for proper form', 'Synchronize breathing with flex patterns', 'Use bio-luminescent feedback'],
          description: 'Advanced flexibility training with neon visual guidance'
        }
      }
    ],
    Sunday: [] // Rest day
  });

  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [avatarAnimation, setAvatarAnimation] = useState('idle');

  const upcomingSessions = [
    { id: 3, name: 'Synth Strength', day: 'Tuesday', time: '08:00 AM', countdown: '22:45:12' },
    { id: 4, name: 'Holo-Cycling', day: 'Wednesday', time: '06:00 PM', countdown: '46:45:12' },
    { id: 5, name: 'Quantum Cardio', day: 'Thursday', time: '07:30 AM', countdown: '70:15:32' }
  ];

  const aiSuggestions = [
    { 
      id: 9, 
      name: 'Neural Recovery Protocol', 
      reason: 'Based on elevated stress biomarkers', 
      category: 'Recovery',
      duration: '25 min',
      intensity: 'Low'
    },
    { 
      id: 10, 
      name: 'Cybernetic Core Boost', 
      reason: 'To improve your overall strength matrix', 
      category: 'Strength',
      duration: '35 min',
      intensity: 'Medium'
    },
    { 
      id: 11, 
      name: 'Quantum Sprint Intervals', 
      reason: 'Performance plateau detected', 
      category: 'Cardio',
      duration: '20 min',
      intensity: 'High'
    }
  ];

  const motivationalQuotes = [
    "The circuit of success is built with reps of determination.",
    "Your body is a biomechanical marvel; upgrade it daily.",
    "In the matrix of fitness, you are the prime program.",
    "Glow brighter than your excuses.",
    "Resistance is not futile—it's how strength is forged.",
    "Every rep codes strength into your DNA.",
    "Sync your mind and muscles for optimal performance.",
    "The future of fitness is in your hands—shape it.",
    "Upgrade your body, transcend your limits.",
    "In the digital age, your physique is your signature."
  ];

  const achievements = [
    { id: 1, name: 'Circuit Master', icon: '⚡', description: 'Complete 10 circuit workouts', progress: 7, total: 10 },
    { id: 2, name: 'Neural Nexus', icon: '🧠', description: '5 consecutive days of neural training', progress: 3, total: 5 },
    { id: 3, name: 'Quantum Pioneer', icon: '🌌', description: 'First quantum workout completed', progress: 0, total: 1 },
    { id: 4, name: 'Cybernetic Warrior', icon: '🤖', description: 'Complete all cyber workouts', progress: 2, total: 5 }
  ];

  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);
  const [weeklyProgress, setWeeklyProgress] = useState(58);
  const [streak, setStreak] = useState(7);

  // Update countdown and quote rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const quoteInterval = setInterval(() => {
      setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    }, 10000);

    return () => {
      clearInterval(timer);
      clearInterval(quoteInterval);
    };
  }, []);

  const toggleWorkoutCompletion = (day, workoutId) => {
    setWorkouts(prev => ({
      ...prev,
      [day]: prev[day].map(workout => 
        workout.id === workoutId 
          ? { ...workout, completed: !workout.completed }
          : workout
      )
    }));

    // Trigger avatar animation
    setAvatarAnimation('celebrate');
    setTimeout(() => setAvatarAnimation('idle'), 2000);
  };

  const openWorkoutDetails = (workout) => {
    setSelectedWorkout(workout);
    setIsModalOpen(true);
  };

  const addAISuggestion = (suggestion) => {
    // Add to Monday as default
    setWorkouts(prev => ({
      ...prev,
      Monday: [...prev.Monday, { 
        ...suggestion, 
        id: Date.now(),
        time: '06:00 PM',
        completed: false,
        details: {
          sets: 3,
          reps: '12-15',
          difficulty: suggestion.intensity,
          aiTips: ['AI recommended based on your performance data', 'Focus on proper form', 'Monitor bio-feedback'],
          description: `AI-suggested ${suggestion.category.toLowerCase()} training`
        }
      }]
    }));
  };

  const calculateWeeklyCompletion = () => {
    const totalWorkouts = Object.values(workouts).flat().length;
    const completedWorkouts = Object.values(workouts).flat().filter(w => w.completed).length;
    return Math.round((completedWorkouts / totalWorkouts) * 100);
  };

  const ProgressChart = () => (
    <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden">
      <motion.div 
        className="h-full bg-gradient-to-r from-cyan-400 to-purple-500"
        initial={{ width: 0 }}
        animate={{ width: `${weeklyProgress}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-white mix-blend-overlay">{weeklyProgress}%</span>
      </div>
    </div>
  );

  const Avatar = () => (
    <motion.div 
      className="relative w-16 h-16 mx-auto mb-4"
      animate={avatarAnimation}
      variants={{
        idle: { scale: 1 },
        celebrate: { 
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0],
          transition: { duration: 0.6 }
        }
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full animate-pulse"></div>
      <div className="absolute inset-2 bg-gray-900 rounded-full flex items-center justify-center">
        <span className="text-2xl">🤖</span>
      </div>
      <div className="absolute -inset-1 bg-cyan-400 rounded-full opacity-20 blur-sm"></div>
    </motion.div>
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} text-${darkMode ? 'white' : 'gray-900'} overflow-x-hidden transition-colors duration-300`}>
      
     

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden ">
        <div className={`absolute inset-0 bg-gradient-to-br ${darkMode ? 'from-purple-900/20 to-cyan-500/10' : 'from-purple-100 to-cyan-50'}`}></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1533139502658-0198f920d8e8?ixlib=rb-4.0.3')] bg-cover bg-center mix-blend-overlay opacity-10 "></div>
        
        <div className="relative container mx-auto px-4 text-center pt-[60px]">
          <Avatar />
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            <span className={`text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500`}>
              Your Cyber Fitness
            </span>
            <br />
            <span className="neon-text">Schedule</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`text-xl ${darkMode ? 'text-cyan-200' : 'text-cyan-700'} max-w-3xl mx-auto`}
          >
            Program your body for peak performance in the digital age
          </motion.p>

          {/* Current Time Display */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 inline-block px-4 py-2 bg-gray-800/50 rounded-lg border border-cyan-400/30"
          >
            <span className="font-mono text-cyan-300">
              {currentTime.toLocaleTimeString()}
            </span>
          </motion.div>
        </div>
      </section>

      {/* Weekly Calendar View */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-center neon-text-cyan">Weekly Program</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-12">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
            <motion.div 
              key={day}
              whileHover={{ scale: 1.05 }}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedDay === day 
                  ? 'border-cyan-400 bg-cyan-900/20 shadow-lg shadow-cyan-500/30' 
                  : `${darkMode ? 'border-purple-700/50 bg-gray-800/50' : 'border-purple-300 bg-white'}`
              } ${workouts[day].length === 0 ? `${darkMode ? 'bg-pink-900/30 border-pink-500' : 'bg-pink-100 border-pink-300'}` : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              <h3 className="font-bold text-center mb-2">{day}</h3>
              {workouts[day].length === 0 ? (
                <motion.div 
                  className="text-center py-4"
                  animate={{ 
                    boxShadow: ['0 0 5px #ec4899', '0 0 20px #ec4899', '0 0 5px #ec4899']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-pink-400 neon-text-pink">REST DAY</span>
                </motion.div>
              ) : (
                <ul>
                  {workouts[day].map((workout) => (
                    <li key={workout.id} className={`mb-2 p-2 rounded ${darkMode ? 'bg-gray-700/30' : 'bg-gray-100'}`}>
                      <div className={`font-medium ${workout.completed ? 'text-green-400' : 'text-cyan-300'}`}>
                        {workout.name}
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {workout.time}
                      </div>
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
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Your body is charging for the next challenges</p>
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
                <motion.div 
                  className={`p-6 rounded-xl border ${
                    workout.completed 
                      ? 'border-green-400 bg-green-900/20' 
                      : `${darkMode ? 'border-cyan-400 bg-gray-800/50' : 'border-cyan-300 bg-white'}`
                  }`}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: workout.completed 
                      ? '0 0 20px rgba(34, 197, 94, 0.3)' 
                      : '0 0 20px rgba(34, 211, 238, 0.3)'
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{workout.name}</h3>
                      <p className="text-cyan-300">{workout.time} • {workout.duration}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {workout.completed && (
                        <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">Completed</span>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleWorkoutCompletion(selectedDay, workout.id)}
                        className={`w-6 h-6 rounded-full border-2 ${
                          workout.completed 
                            ? 'bg-green-400 border-green-400' 
                            : 'border-cyan-400'
                        }`}
                      >
                        {workout.completed && '✓'}
                      </motion.button>
                    </div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openWorkoutDetails(workout)}
                    className="mt-4 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-300 transition-all"
                  >
                    View Details
                  </motion.button>
                </motion.div>
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
              className={`p-6 border border-purple-400 rounded-xl bg-gradient-to-br ${darkMode ? 'from-purple-900/20 to-gray-800/50' : 'from-purple-100 to-gray-100'} relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">{session.name}</h3>
                <p className="text-purple-300">{session.day} • {session.time}</p>
                <div className="mt-4 p-3 bg-gray-900/50 rounded-lg">
                  <span className="text-cyan-300 font-mono">{session.countdown}</span>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-4 w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all"
                >
                  Set Reminder
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Progress & Streaks */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-center neon-text-cyan">Progress & Achievements</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 border border-cyan-400 rounded-xl bg-gray-800/30 text-center"
          >
            <div className="text-5xl mb-4">🔥</div>
            <div className="text-4xl font-bold text-cyan-300 neon-text">{streak}</div>
            <p className="text-gray-400">Day Streak</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="p-6 border border-pink-400 rounded-xl bg-gray-800/30"
          >
            <h3 className="text-xl font-bold mb-4">Weekly Completion</h3>
            <ProgressChart />
            <p className="text-right text-cyan-300 mt-2">{weeklyProgress}% complete</p>
          </motion.div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${achievement.progress === achievement.total ? 'border-yellow-400 bg-yellow-900/20' : 'border-gray-600 bg-gray-800/30'}`}
            >
              <div className="text-2xl mb-2">{achievement.icon}</div>
              <h4 className="font-bold mb-1">{achievement.name}</h4>
              <p className="text-sm text-gray-400 mb-2">{achievement.description}</p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-right mt-1 text-cyan-300">
                {achievement.progress}/{achievement.total}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Suggestions */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-center neon-text-pink">AI Recommendations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {aiSuggestions.map((suggestion, index) => (
            <motion.div 
              key={suggestion.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 border border-pink-400 rounded-xl bg-gradient-to-br ${darkMode ? 'from-pink-900/20 to-gray-800/50' : 'from-pink-100 to-gray-100'}`}
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
              <p className="text-gray-300 mb-2">{suggestion.reason}</p>
              <div className="flex justify-between text-sm text-gray-400 mb-4">
                <span>{suggestion.duration}</span>
                <span>Intensity: {suggestion.intensity}</span>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => addAISuggestion(suggestion)}
                className="w-full py-2 bg-pink-600 hover:bg-pink-700 rounded-lg transition-all"
              >
                Add to Schedule
              </motion.button>
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
        <div className={`max-w-3xl mx-auto p-8 border border-cyan-400 rounded-xl ${darkMode ? 'bg-cyan-900/20' : 'bg-cyan-50'} relative overflow-hidden`}>
          <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full translate-x-16 translate-y-16"></div>
          
          <div className="relative z-10">
            <span className="text-5xl mb-4 block">"</span>
            <motion.p 
              key={currentQuote}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl italic mb-4 neon-text-cyan"
            >
              {currentQuote}
            </motion.p>
            <span className="text-cyan-300">- FitTronix Motivator v2.5</span>
          </div>
        </div>
      </motion.section>

      {/* Workout Details Modal */}
      <AnimatePresence>
        {isModalOpen && selectedWorkout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-md w-full border border-cyan-400`}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold mb-2 text-cyan-300">{selectedWorkout.name}</h3>
              <p className="text-gray-400 mb-4">{selectedWorkout.details.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                  <div className="text-cyan-300 font-bold">{selectedWorkout.details.sets}</div>
                  <div className="text-sm text-gray-400">Sets</div>
                </div>
                <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                  <div className="text-cyan-300 font-bold">{selectedWorkout.details.reps}</div>
                  <div className="text-sm text-gray-400">Reps</div>
                </div>
                <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                  <div className="text-cyan-300 font-bold">{selectedWorkout.details.difficulty}</div>
                  <div className="text-sm text-gray-400">Difficulty</div>
                </div>
                <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                  <div className="text-cyan-300 font-bold">{selectedWorkout.duration}</div>
                  <div className="text-sm text-gray-400">Duration</div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-bold mb-2 text-cyan-300">AI Tips</h4>
                <ul className="space-y-1">
                  {selectedWorkout.details.aiTips.map((tip, index) => (
                    <li key={index} className="text-sm text-gray-300">• {tip}</li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-all"
                >
                  Close
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    toggleWorkoutCompletion(selectedDay, selectedWorkout.id);
                    setIsModalOpen(false);
                  }}
                  className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-all"
                >
                  {selectedWorkout.completed ? 'Mark Incomplete' : 'Mark Complete'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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