import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const WorkoutPage = () => {
  const [activeDay, setActiveDay] = useState(0);
  
  // Sample data
  const workoutCategories = [
    { id: 1, name: 'Strength Training', icon: '💪', description: 'Build muscle and increase power' },
    { id: 2, name: 'Cardio', icon: '🏃‍♂️', description: 'Improve endurance and heart health' },
    { id: 3, name: 'Yoga', icon: '🧘‍♀️', description: 'Enhance flexibility and mindfulness' },
    { id: 4, name: 'HIIT', icon: '🔥', description: 'Maximum results in minimal time' },
    { id: 5, name: 'Flexibility', icon: '🤸‍♀️', description: 'Increase range of motion and prevent injury' },
  ];

  const exercises = [
    { id: 1, name: 'Cyber Squats', muscle: 'Legs', difficulty: 'Intermediate', duration: '3 sets x 12 reps', image: '🦵' },
    { id: 2, name: 'Neon Push-ups', muscle: 'Chest', difficulty: 'Beginner', duration: '3 sets x 10 reps', image: '👊' },
    { id: 3, name: 'Glow Planks', muscle: 'Core', difficulty: 'Beginner', duration: '3 sets x 30 sec', image: '✨' },
    { id: 4, name: 'Laser Lunges', muscle: 'Legs', difficulty: 'Intermediate', duration: '3 sets x 10 each', image: '⚡' },
    { id: 5, name: 'Holographic Pull-ups', muscle: 'Back', difficulty: 'Advanced', duration: '3 sets x 8 reps', image: '👁️' },
  ];

  const weeklyPlan = [
    { day: 'Monday', workout: 'Upper Body Strength', icon: '💪', duration: '45 mins' },
    { day: 'Tuesday', workout: 'HIIT Cardio', icon: '🔥', duration: '30 mins' },
    { day: 'Wednesday', workout: 'Yoga & Flexibility', icon: '🧘', duration: '40 mins' },
    { day: 'Thursday', workout: 'Lower Body Strength', icon: '🦵', duration: '50 mins' },
    { day: 'Friday', workout: 'Core & Balance', icon: '⚖️', duration: '35 mins' },
    { day: 'Saturday', workout: 'Active Recovery', icon: '🌊', duration: '25 mins' },
    { day: 'Sunday', workout: 'Rest Day', icon: '😴', duration: '0 mins' },
  ];

  const progressData = {
    workoutsCompleted: 12,
    streak: 5,
    caloriesBurned: 2450,
  };

  const motivationalQuotes = [
    "Your mind is the matrix. Your body is the code. Rewrite it.",
    "The only limit is the one you set yourself.",
    "Strength doesn't come from what you can do. It comes from overcoming what you once thought you couldn't.",
    "The pain you feel today will be the strength you feel tomorrow.",
    "Your body can stand almost anything. It's your mind that you have to convince."
  ];

  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-cyan-600/10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiNmZjAwZmYiIHN0cm9rZS13aWR0aD0iMC41IiBzdHJva2Utb3BhY2l0eT0iMC4yIj48cGF0aCBkPSJNIDAgMCBMIDYwIDYwIE0gNjAgMCBMIDAgNjAiLz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500"
          >
            TRANSFORM YOUR REALITY
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-cyan-200"
          >
            Enter the arena where human potential meets cybernetic enhancement
          </motion.p>
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(34, 211, 238, 0.5)" }}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg text-xl font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300"
          >
            START WORKOUT
          </motion.button>
        </div>
      </section>

      {/* Workout Categories */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-cyan-400">WORKOUT CATEGORIES</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {workoutCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ 
                  y: -5, 
                  boxShadow: "0 0 15px rgba(219, 39, 119, 0.5), 0 0 30px rgba(34, 211, 238, 0.3)" 
                }}
                className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-cyan-500/30 hover:border-pink-500/50 transition-all duration-300 cursor-pointer"
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-cyan-300">{category.name}</h3>
                <p className="text-gray-300">{category.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Exercise Library */}
      <section className="py-16 px-4 md:px-8 bg-gray-800/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-400">EXERCISE LIBRARY</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {exercises.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.03, 
                  boxShadow: "0 0 20px rgba(168, 85, 247, 0.4)" 
                }}
                className="bg-gray-800/50 backdrop-blur-md rounded-xl p-4 border border-purple-500/30 hover:border-cyan-500/50 transition-all duration-300"
              >
                <div className="text-5xl text-center mb-4">{exercise.image}</div>
                <h3 className="text-lg font-bold mb-2 text-pink-300">{exercise.name}</h3>
                <div className="flex justify-between text-sm text-cyan-300 mb-1">
                  <span>Muscle:</span>
                  <span>{exercise.muscle}</span>
                </div>
                <div className="flex justify-between text-sm text-cyan-300 mb-1">
                  <span>Difficulty:</span>
                  <span className={exercise.difficulty === 'Beginner' ? 'text-green-400' : exercise.difficulty === 'Intermediate' ? 'text-yellow-400' : 'text-red-400'}>
                    {exercise.difficulty}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-cyan-300">
                  <span>Duration:</span>
                  <span>{exercise.duration}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Weekly Workout Plan */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-pink-500">WEEKLY WORKOUT PLAN</h2>
          
          <div className="bg-gray-800/30 backdrop-blur-md rounded-2xl p-6 border border-cyan-500/20">
            <div className="flex overflow-x-auto pb-4 mb-6 scrollbar-hide">
              {weeklyPlan.map((day, index) => (
                <button
                  key={index}
                  onClick={() => setActiveDay(index)}
                  className={`flex-shrink-0 px-4 py-2 mr-2 rounded-lg transition-all duration-300 ${activeDay === index ? 
                    'bg-gradient-to-r from-cyan-500 to-purple-600 text-white' : 
                    'bg-gray-700/50 text-gray-300 hover:bg-gray-700/70'}`}
                >
                  {day.day}
                </button>
              ))}
            </div>
            
            <motion.div 
              key={activeDay}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-900/50 p-6 rounded-xl border border-pink-500/30"
            >
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-4">{weeklyPlan[activeDay].icon}</span>
                <div>
                  <h3 className="text-2xl font-bold text-cyan-300">{weeklyPlan[activeDay].workout}</h3>
                  <p className="text-pink-300">{weeklyPlan[activeDay].duration}</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4">Your personalized workout for {weeklyPlan[activeDay].day} designed to maximize your gains and keep you on track with your fitness goals.</p>
              <button className="px-4 py-2 bg-cyan-600/30 hover:bg-cyan-600/50 rounded-lg text-cyan-300 border border-cyan-500/30 transition-all duration-300">
                View Details
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Progress Tracking */}
      <section className="py-16 px-4 md:px-8 bg-gray-800/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">PROGRESS DASHBOARD</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-cyan-500/30"
            >
              <h3 className="text-xl font-bold mb-4 text-cyan-300">Workouts Completed</h3>
              <div className="text-5xl font-bold text-center text-white">{progressData.workoutsCompleted}</div>
              <div className="h-2 bg-gray-700 rounded-full mt-4 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progressData.workoutsCompleted / 20 * 100, 100)}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="h-full bg-cyan-500 rounded-full"
                ></motion.div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-pink-500/30"
            >
              <h3 className="text-xl font-bold mb-4 text-pink-300">Current Streak</h3>
              <div className="text-5xl font-bold text-center text-white">{progressData.streak} days</div>
              <div className="flex justify-center mt-4">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full mx-1 ${i < progressData.streak ? 'bg-pink-500' : 'bg-gray-700'}`}></div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-purple-500/30"
            >
              <h3 className="text-xl font-bold mb-4 text-purple-300">Calories Burned</h3>
              <div className="text-5xl font-bold text-center text-white">{progressData.caloriesBurned}</div>
              <div className="h-2 bg-gray-700 rounded-full mt-4 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progressData.caloriesBurned / 5000 * 100, 100)}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-purple-500 rounded-full"
                ></motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Motivational Quote */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            key={currentQuote}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center p-8 bg-gray-800/30 backdrop-blur-md rounded-2xl border border-cyan-500/20 hover:border-pink-500/30 transition-all duration-500"
          >
            <p className="text-2xl md:text-3xl italic mb-4 text-cyan-200">"{motivationalQuotes[currentQuote]}"</p>
            <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-pink-500 mx-auto mb-4"></div>
            <p className="text-lg text-pink-300">- FitTronix Motto</p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 md:px-8 bg-gradient-to-br from-purple-900/20 to-cyan-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">READY TO LEVEL UP?</h2>
          <p className="text-xl text-cyan-200 mb-10 max-w-2xl mx-auto">Join our cybernetic fitness challenges and transform your body with AI-guided workouts.</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <motion.button
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 0 25px rgba(219, 39, 119, 0.5)" 
              }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg text-xl font-bold shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all duration-300"
            >
              JOIN CHALLENGES
            </motion.button>
            
            <motion.button
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 0 25px rgba(34, 211, 238, 0.5)" 
              }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg text-xl font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300"
            >
              START AI GUIDED WORKOUT
            </motion.button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WorkoutPage;