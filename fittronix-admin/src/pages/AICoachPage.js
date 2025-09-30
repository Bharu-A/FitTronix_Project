import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Video, 
  Square, 
  Play, 
  Moon, 
  Sun,
  Award,
  TrendingUp,
  Clock,
  Target,
  Users,
  Share2,
  Download,
  Zap,
  Cpu,
  Activity,
  BarChart3,
  Trophy,
  Calendar,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';

const AICoachPage = () => {
  // State for video input and AI feedback
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [isExercising, setIsExercising] = useState(false);
  const [repsCompleted, setRepsCompleted] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [correctFormPercentage, setCorrectFormPercentage] = useState(0);
  const [feedbackMessages, setFeedbackMessages] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [voiceFeedback, setVoiceFeedback] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [showProgressChart, setShowProgressChart] = useState(false);
  const [currentWorkoutPlan, setCurrentWorkoutPlan] = useState([]);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  // Sample exercise data with cyber-themed names
  const exercises = [
    {
      id: 1,
      name: 'QUANTUM SQUATS',
      description: 'Lower your body with cybernetic precision',
      image: '⚡',
      tips: [
        'Maintain neural alignment throughout descent',
        'Knees should not breach the quantum plane',
        'Lower until thighs achieve parallel resonance'
      ],
      difficulty: 'Intermediate',
      targetMuscles: ['Quadriceps', 'Glutes', 'Core'],
      caloriesPerMin: 8
    },
    {
      id: 2,
      name: 'CYBER PUSH-UPS',
      description: 'Execute perfect upper-body cybernetics',
      image: '🤖',
      tips: [
        'Maintain cyber-core engagement',
        'Lower chassis until elbows reach 90°',
        'Sync breathing with motion algorithm'
      ],
      difficulty: 'Advanced',
      targetMuscles: ['Chest', 'Triceps', 'Shoulders'],
      caloriesPerMin: 10
    },
    {
      id: 3,
      name: 'NEURAL PLANK',
      description: 'Hold neural alignment under tension',
      image: '🧠',
      tips: [
        'Maintain quantum-level core activation',
        'Sync neural pathways for stability',
        'Avoid gravitational drift in hip alignment'
      ],
      difficulty: 'Beginner',
      targetMuscles: ['Core', 'Shoulders', 'Back'],
      caloriesPerMin: 5
    },
    {
      id: 4,
      name: 'HOLO-LUNGES',
      description: 'Project strength through dimensional shifts',
      image: '🌌',
      tips: [
        'Maintain holographic balance',
        'Front knee aligns with ankle plane',
        'Descend until both knees form perfect angles'
      ],
      difficulty: 'Intermediate',
      targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
      caloriesPerMin: 7
    }
  ];

  // Sample workout plans
  const workoutPlans = [
    {
      id: 1,
      name: 'CYBER INITIATION',
      exercises: [0, 1, 2],
      duration: 15,
      difficulty: 'Beginner'
    },
    {
      id: 2,
      name: 'QUANTUM CIRCUIT',
      exercises: [0, 1, 2, 3],
      duration: 25,
      difficulty: 'Intermediate'
    },
    {
      id: 3,
      name: 'NEURAL OVERLOAD',
      exercises: [1, 0, 3, 2, 1],
      duration: 35,
      difficulty: 'Advanced'
    }
  ];

  // Sample achievements
  const achievements = [
    { id: 1, name: 'FIRST CONTACT', description: 'Complete first workout', unlocked: true },
    { id: 2, name: 'FORM MASTER', description: 'Achieve 95% form accuracy', unlocked: false },
    { id: 3, name: 'QUANTUM CONSISTENCY', description: '7-day streak', unlocked: false },
    { id: 4, name: 'CYBER WARRIOR', description: '1000 total reps', unlocked: false }
  ];

  // Initialize webcam
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsVideoActive(true);
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  };

  // Stop webcam
  const stopVideo = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      setIsVideoActive(false);
      setIsRecording(false);
    }
  };

  // Toggle video recording
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Save recording logic would go here
    } else {
      setIsRecording(true);
    }
  };

  // Start/stop exercise session
  const toggleExercise = () => {
    if (isExercising) {
      setIsExercising(false);
      clearInterval(timerRef.current);
      // Save workout session
      saveWorkoutSession();
    } else {
      setIsExercising(true);
      setSessionTime(0);
      timerRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
      simulateAIFeedback();
    }
  };

  // Save workout session to history
  const saveWorkoutSession = () => {
    const session = {
      id: Date.now(),
      exercise: exercises[currentExercise].name,
      duration: sessionTime,
      reps: repsCompleted,
      calories: caloriesBurned,
      formScore: correctFormPercentage,
      timestamp: new Date().toISOString()
    };
    setWorkoutHistory(prev => [session, ...prev.slice(0, 9)]); // Keep last 10 sessions
  };

  // Simulate AI feedback with cyber-themed messages
  const simulateAIFeedback = () => {
    setFeedbackMessages([]);
    
    const exercise = exercises[currentExercise];
    const potentialFeedbacks = [
      `NEURAL ALIGNMENT: Straighten your back during ${exercise.name}`,
      `QUANTUM CORE: Maintain cyber-core engagement`,
      `GRAVITY COMPENSATION: Adjust your stance for optimal balance`,
      `RESPIRATORY SYNC: Breathe consistently through the motion`,
      `TEMPORAL OPTIMIZATION: Slow tempo for enhanced form precision`,
      `BIOMECHANICAL ALIGNMENT: Align knees with quantum plane`
    ];
    
    const randomCount = Math.floor(Math.random() * 2) + 2;
    const newFeedbacks = [];
    
    for (let i = 0; i < randomCount; i++) {
      const randomIndex = Math.floor(Math.random() * potentialFeedbacks.length);
      newFeedbacks.push({
        id: Date.now() + i,
        message: potentialFeedbacks[randomIndex],
        type: ['warning', 'success', 'info'][i % 3],
        timestamp: Date.now()
      });
    }
    
    setFeedbackMessages(newFeedbacks);
    
    // Simulate stats updates
    setRepsCompleted(prev => prev + Math.floor(Math.random() * 3) + 2);
    setCaloriesBurned(prev => prev + exercise.caloriesPerMin);
    setCorrectFormPercentage(prev => Math.min(100, prev + (Math.random() > 0.3 ? 2 : -1)));
  };

  // Change exercise
  const nextExercise = () => {
    setCurrentExercise((prev) => (prev + 1) % exercises.length);
    setFeedbackMessages([]);
  };

  const prevExercise = () => {
    setCurrentExercise((prev) => (prev - 1 + exercises.length) % exercises.length);
    setFeedbackMessages([]);
  };

  // Toggle features
  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleVoiceFeedback = () => setVoiceFeedback(!voiceFeedback);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      clearInterval(timerRef.current);
    };
  }, []);

  const currentExerciseData = exercises[currentExercise];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-cyan-900/10 pointer-events-none"></div>
      
      <div className="relative container mx-auto px-4 py-8 pt-[90px]">
        
        {/* Header Section */}
        <motion.header 
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI CYBER COACH
          </h1>
          <p className={`text-lg ${darkMode ? 'text-cyan-200' : 'text-gray-600'}`}>
            Real-time neural feedback for optimal cybernetic performance
          </p>
        </motion.header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left Column: Video Input and Controls */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Video Input Section */}
            <motion.div 
              className={`rounded-xl p-6 backdrop-blur-md border ${darkMode ? 'bg-gray-800/50 border-cyan-500/20' : 'bg-white border-gray-200'} shadow-lg hover:shadow-cyan-500/10 transition-all duration-300`}
              whileHover={{ y: -5 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-cyan-300 flex items-center gap-2">
                <Camera className="h-6 w-6" />
                NEURAL POSTURE ANALYSIS
              </h2>
              
              <div className="relative aspect-video bg-gray-700 rounded-xl overflow-hidden mb-4 border border-cyan-500/30">
                {isVideoActive ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    
                    {/* AI Pose Overlay */}
                    {isExercising && (
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Simulated AI pose points */}
                        <motion.div 
                          className="absolute top-1/4 left-1/2 w-6 h-6 bg-cyan-500 rounded-full border-2 border-white shadow-lg shadow-cyan-500/50"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.div 
                          className="absolute top-1/2 left-1/3 w-6 h-6 bg-purple-500 rounded-full border-2 border-white shadow-lg shadow-purple-500/50"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                        />
                        <motion.div 
                          className="absolute bottom-1/4 right-1/3 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg shadow-green-500/50"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
                        />
                        
                        {/* Rep Counter Overlay */}
                        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/30">
                          <div className="text-cyan-300 text-sm">REP COUNT</div>
                          <div className="text-2xl font-bold text-white">{repsCompleted}</div>
                        </div>
                        
                        {/* Session Timer */}
                        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-purple-500/30">
                          <div className="text-purple-300 text-sm">SESSION TIME</div>
                          <div className="text-2xl font-bold text-white">{formatTime(sessionTime)}</div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📡</div>
                      <p className="text-gray-400">NEURAL LINK OFFLINE</p>
                      <p className="text-sm text-gray-500">Activate camera to begin cyber analysis</p>
                    </div>
                  </div>
                )}
                
                {/* Recording Indicator */}
                {isRecording && (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    RECORDING
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <motion.button
                  onClick={() => isVideoActive ? stopVideo() : startVideo()}
                  className={`p-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                    isVideoActive 
                      ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30' 
                      : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30'
                  } transition-all duration-300`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Camera className="h-4 w-4" />
                  {isVideoActive ? 'DEACTIVATE' : 'ACTIVATE'}
                </motion.button>
                
                <motion.button
                  onClick={toggleExercise}
                  disabled={!isVideoActive}
                  className={`p-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                    isExercising 
                      ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30' 
                      : 'bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30'
                  } ${!isVideoActive ? 'opacity-50 cursor-not-allowed' : ''} transition-all duration-300`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isExercising ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isExercising ? 'TERMINATE' : 'INITIATE'}
                </motion.button>
                
                <motion.button
                  onClick={toggleRecording}
                  disabled={!isVideoActive}
                  className={`p-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                    isRecording
                      ? 'bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30'
                      : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30'
                  } ${!isVideoActive ? 'opacity-50 cursor-not-allowed' : ''} transition-all duration-300`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Video className="h-4 w-4" />
                  {isRecording ? 'STOP REC' : 'RECORD'}
                </motion.button>
                
                <motion.button
                  onClick={toggleVoiceFeedback}
                  className={`p-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                    voiceFeedback
                      ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30'
                      : 'bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 border border-gray-500/30'
                  } transition-all duration-300`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {voiceFeedback ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  VOICE {voiceFeedback ? 'ON' : 'OFF'}
                </motion.button>
              </div>
            </motion.div>
            
            {/* Real-time Feedback Section */}
            <motion.div 
              className={`rounded-xl p-6 backdrop-blur-md border ${darkMode ? 'bg-gray-800/50 border-purple-500/20' : 'bg-white border-gray-200'} shadow-lg hover:shadow-purple-500/10 transition-all duration-300`}
              whileHover={{ y: -5 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-purple-300 flex items-center gap-2">
                <Zap className="h-6 w-6" />
                NEURAL FEEDBACK STREAM
              </h2>
              
              <div className="max-h-64 overflow-y-auto space-y-3">
                <AnimatePresence>
                  {feedbackMessages.map((feedback) => (
                    <motion.div
                      key={feedback.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`p-4 rounded-lg border-l-4 backdrop-blur-sm ${
                        feedback.type === 'warning'
                          ? 'bg-yellow-500/10 border-yellow-500 text-yellow-300'
                          : feedback.type === 'success'
                          ? 'bg-green-500/10 border-green-500 text-green-300'
                          : 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                      } transition-all duration-300`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          feedback.type === 'warning' ? 'bg-yellow-500' :
                          feedback.type === 'success' ? 'bg-green-500' : 'bg-cyan-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="font-medium">{feedback.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(feedback.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {feedbackMessages.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">🌊</div>
                    <p className={`italic ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {isExercising 
                        ? 'ANALYZING CYBERNETIC FORM...' 
                        : 'AWAITING NEURAL INITIATION'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Progress Charts Section */}
            <motion.div 
              className={`rounded-xl p-6 backdrop-blur-md border ${darkMode ? 'bg-gray-800/50 border-pink-500/20' : 'bg-white border-gray-200'} shadow-lg hover:shadow-pink-500/10 transition-all duration-300`}
              whileHover={{ y: -5 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-pink-300 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  PERFORMANCE ANALYTICS
                </h2>
                <motion.button
                  onClick={() => setShowProgressChart(!showProgressChart)}
                  className="px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 rounded-lg transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {showProgressChart ? 'HIDE CHARTS' : 'SHOW CHARTS'}
                </motion.button>
              </div>
              
              {showProgressChart && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Form Accuracy Chart */}
                  <div className="bg-gray-700/30 rounded-lg p-4 border border-cyan-500/20">
                    <h3 className="text-cyan-300 font-semibold mb-3">FORM ACCURACY</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-cyan-200">Current Session</span>
                        <span className="text-cyan-400">{correctFormPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-3">
                        <motion.div 
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full shadow-lg shadow-cyan-500/30"
                          initial={{ width: 0 }}
                          animate={{ width: `${correctFormPercentage}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Calories Burned Chart */}
                  <div className="bg-gray-700/30 rounded-lg p-4 border border-purple-500/20">
                    <h3 className="text-purple-300 font-semibold mb-3">ENERGY OUTPUT</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-200">Calories Burned</span>
                        <span className="text-purple-400">{caloriesBurned}</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-3">
                        <motion.div 
                          className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full shadow-lg shadow-purple-500/30"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, caloriesBurned / 2)}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
          
          {/* Right Column: Exercise Guidance and Statistics */}
          <div className="space-y-6">
            
            {/* Exercise Guidance Section */}
            <motion.div 
              className={`rounded-xl p-6 backdrop-blur-md border ${darkMode ? 'bg-gray-800/50 border-green-500/20' : 'bg-white border-gray-200'} shadow-lg hover:shadow-green-500/10 transition-all duration-300`}
              whileHover={{ y: -5 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-green-300 flex items-center gap-2">
                <Target className="h-6 w-6" />
                EXERCISE PROTOCOL
              </h2>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-medium text-cyan-100">{currentExerciseData.name}</h3>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    currentExerciseData.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-300' :
                    currentExerciseData.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {currentExerciseData.difficulty}
                  </span>
                </div>
                <span className="text-5xl">{currentExerciseData.image}</span>
              </div>
              
              <p className="mb-4 text-gray-300">{currentExerciseData.description}</p>
              
              <div className="mb-4">
                <h4 className="font-semibold text-cyan-400 mb-2">TARGET SYSTEMS:</h4>
                <div className="flex flex-wrap gap-2">
                  {currentExerciseData.targetMuscles.map((muscle, index) => (
                    <span key={index} className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm border border-cyan-500/30">
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>
              
              <h4 className="font-semibold text-purple-400 mb-2">NEURAL OPTIMIZATION TIPS:</h4>
              <ul className="space-y-2 mb-6">
                {currentExerciseData.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-300">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    {tip}
                  </li>
                ))}
              </ul>
              
              <div className="flex justify-between">
                <motion.button
                  onClick={prevExercise}
                  className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 border border-gray-500/30 rounded-lg font-medium transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  PREVIOUS
                </motion.button>
                
                <motion.button
                  onClick={nextExercise}
                  className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded-lg font-medium transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  NEXT
                </motion.button>
              </div>
            </motion.div>
            
            {/* Statistics Section */}
            <motion.div 
              className={`rounded-xl p-6 backdrop-blur-md border ${darkMode ? 'bg-gray-800/50 border-blue-500/20' : 'bg-white border-gray-200'} shadow-lg hover:shadow-blue-500/10 transition-all duration-300`}
              whileHover={{ y: -5 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-blue-300 flex items-center gap-2">
                <Activity className="h-6 w-6" />
                CYBERNETIC STATS
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <p className="text-3xl font-bold text-cyan-300">{repsCompleted}</p>
                  <p className="text-sm text-cyan-400">REPS COMPLETED</p>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <p className="text-3xl font-bold text-purple-300">{caloriesBurned}</p>
                  <p className="text-sm text-purple-400">ENERGY OUTPUT</p>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-3xl font-bold text-green-300">{correctFormPercentage}%</p>
                  <p className="text-sm text-green-400">FORM ACCURACY</p>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-pink-500/10 border border-pink-500/20">
                  <p className="text-3xl font-bold text-pink-300">{formatTime(sessionTime)}</p>
                  <p className="text-sm text-pink-400">SESSION TIME</p>
                </div>
              </div>
            </motion.div>

            {/* Achievements Section */}
            <motion.div 
              className={`rounded-xl p-6 backdrop-blur-md border ${darkMode ? 'bg-gray-800/50 border-yellow-500/20' : 'bg-white border-gray-200'} shadow-lg hover:shadow-yellow-500/10 transition-all duration-300`}
              whileHover={{ y: -5 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-yellow-300 flex items-center gap-2">
                <Trophy className="h-6 w-6" />
                CYBER ACHIEVEMENTS
              </h2>
              
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-3 rounded-lg border ${
                      achievement.unlocked
                        ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
                        : 'bg-gray-700/30 border-gray-600/30 text-gray-400'
                    } transition-all duration-300`}
                  >
                    <div className="flex items-center gap-3">
                      <Award className={`h-5 w-5 ${achievement.unlocked ? 'text-yellow-400' : 'text-gray-500'}`} />
                      <div>
                        <p className="font-medium">{achievement.name}</p>
                        <p className="text-sm opacity-80">{achievement.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div 
              className={`rounded-xl p-6 backdrop-blur-md border ${darkMode ? 'bg-gray-800/50 border-gray-500/20' : 'bg-white border-gray-200'} shadow-lg transition-all duration-300`}
              whileHover={{ y: -5 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-gray-300 flex items-center gap-2">
                <Settings className="h-6 w-6" />
                SYSTEM CONTROLS
              </h2>
              
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  onClick={toggleDarkMode}
                  className="p-3 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 border border-gray-500/30 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {darkMode ? 'LIGHT MODE' : 'DARK MODE'}
                </motion.button>
                
                <motion.button
                  className="p-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Share2 className="h-4 w-4" />
                  SHARE DATA
                </motion.button>
                
                <motion.button
                  className="p-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="h-4 w-4" />
                  EXPORT LOGS
                </motion.button>
                
                <motion.button
                  className="p-3 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Users className="h-4 w-4" />
                  LEADERBOARD
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICoachPage;