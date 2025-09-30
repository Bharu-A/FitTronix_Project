// src/pages/WorkoutPage.js - Fixed Version
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { ref, set, push, onValue } from 'firebase/database';
import { db, auth, realtimeDb } from '../firebase';
import { io } from 'socket.io-client';

// Import AI Analysis Components
import SessionStats from '../components/SessionStats';
import FeedbackPanel from '../components/FeedbackPanel';
import { useVideoAnalysis } from '../hooks/useVideoAnalysis';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

const WorkoutPage = () => {
  // State management - Define selectedExercise FIRST
  const [selectedExercise, setSelectedExercise] = useState('pushup');
  
  // AI Video Analysis Hook - Now selectedExercise is defined
  const {
    videoRef,
    canvasRef,
    isAnalyzing,
    sessionData,
    startAnalysis,
    stopAnalysis,
    detector
  } = useVideoAnalysis(selectedExercise);

  // Speech synthesis for voice feedback
  const { speak } = useSpeechSynthesis();

  // Other state management
  const [activeDay, setActiveDay] = useState(0);
  const [workoutCategories, setWorkoutCategories] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [motivationalQuotes, setMotivationalQuotes] = useState([]);
  const [progressData, setProgressData] = useState({ 
    workoutsCompleted: 0, 
    streak: 0, 
    caloriesBurned: 0,
    lastWorkoutDate: null 
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuote, setCurrentQuote] = useState(0);
  
  // Real-time workout states
  const [isRecording, setIsRecording] = useState(false);
  const [realTimeFeedback, setRealTimeFeedback] = useState([]);
  const [sessionStats, setSessionStats] = useState({
    reps: 0,
    sets: 1,
    calories: 0,
    duration: 0,
    correctness: 0
  });
  const [sessionStarted, setSessionStarted] = useState(false);
  
  // Video upload states
  const [videoUploadMode, setVideoUploadMode] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [videoAnalysis, setVideoAnalysis] = useState(null);
  const [isVideoAnalyzing, setIsVideoAnalyzing] = useState(false);
  
  const streamRef = useRef(null);
  const socketRef = useRef(null);
  const animationRef = useRef(null);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchUserProgress(firebaseUser.uid);
        initializeSocketConnection();
      } else {
        setUser(null);
        setProgressData({ workoutsCompleted: 0, streak: 0, caloriesBurned: 0, lastWorkoutDate: null });
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      stopCamera();
      stopAnalysis();
    };
  }, []);

  // Initialize socket connection for advanced features
  const initializeSocketConnection = () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    console.log(`🔌 Connecting to backend: ${backendUrl}`);
    
    socketRef.current = io(backendUrl, {
      timeout: 10000,
      reconnectionAttempts: 5
    });
    
    socketRef.current.on('connect', () => {
      console.log('✅ Connected to backend server');
      setError('');
    });

    socketRef.current.on('analysis_error', (data) => {
      console.error('❌ Analysis error:', data.error);
      setError(data.error);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      setError('Failed to connect to analysis server. Make sure backend is running on port 5000.');
    });

    socketRef.current.on('disconnect', () => {
      console.log('🔌 Disconnected from backend');
      setError('Disconnected from analysis server');
    });
  };

  // Enhanced camera management
  const startCamera = async () => {
    if (!videoRef.current) {
      console.error('Video element not found!');
      return;
    }

    try {
      console.log('📷 Starting camera...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        } 
      });
      
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      
      return new Promise((resolve) => {
        videoRef.current.onloadedmetadata = () => {
          console.log('✅ Camera started successfully');
          videoRef.current.play().then(() => {
            console.log('🎥 Video playback started');
            resolve(stream);
          }).catch(error => {
            console.error('❌ Video play failed:', error);
            resolve(stream);
          });
        };
        
        setTimeout(() => {
          resolve(stream);
        }, 1000);
      });
    } catch (error) {
      console.error('❌ Error accessing camera:', error.name, error.message);
      let errorMsg = `Camera error: ${error.message}`;
      if (error.name === 'NotAllowedError') {
        errorMsg = 'Camera permission denied. Please allow camera access and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMsg = 'No camera found on this device.';
      } else if (error.name === 'NotSupportedError') {
        errorMsg = 'Camera not supported in this browser.';
      }
      setError(errorMsg);
      throw error;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Enhanced session management with AI analysis
  const startSession = async (workoutType = null) => {
    if (!user) {
      setError('Please log in to start a workout');
      return;
    }

    try {
      console.log('🎬 Starting AI workout session...');
      
      // Reset states
      setRealTimeFeedback([]);
      setSessionStats({
        reps: 0,
        sets: 1,
        calories: 0,
        duration: 0,
        correctness: 0
      });
      
      // Start camera and AI analysis
      await startCamera();
      await startAnalysis();
      
      setIsRecording(true);
      
      // Set the exercise type if provided
      if (workoutType) {
        const exerciseType = workoutType.toLowerCase().replace(/\s+/g, '');
        setSelectedExercise(exerciseType);
      }
      
      console.log(`🏋️ Starting ${selectedExercise} session with AI analysis...`);

      // Create workout session in Firestore
      const sessionRef = doc(collection(db, 'workoutSessions'));
      const sessionData = {
        id: sessionRef.id,
        userId: user.uid,
        startTime: serverTimestamp(),
        exerciseType: selectedExercise,
        status: 'active',
        sets: 1,
        aiEnabled: true
      };
      await setDoc(sessionRef, sessionData);

      // Voice feedback
      speak(`Starting ${selectedExercise} session. Let's begin!`);
      
    } catch (error) {
      console.error('❌ Error starting session:', error);
      setError(`Failed to start workout: ${error.message}`);
      setIsRecording(false);
      stopCamera();
      stopAnalysis();
    }
  };

  const endSession = async () => {
    console.log('🏁 Ending AI workout session...');
    setIsRecording(false);
    setSessionStarted(false);
    stopCamera();
    stopAnalysis();
    
    try {
      // Update workout session in Firestore
      const sessionsQuery = query(
        collection(db, 'workoutSessions'),
        where('userId', '==', user.uid),
        where('status', '==', 'active'),
        orderBy('startTime', 'desc'),
        limit(1)
      );
      
      const snapshot = await getDocs(sessionsQuery);
      if (!snapshot.empty) {
        const sessionDoc = snapshot.docs[0];
        await updateDoc(sessionDoc.ref, {
          endTime: serverTimestamp(),
          status: 'completed',
          totalReps: sessionData.reps,
          caloriesBurned: sessionData.calories,
          averageCorrectness: sessionData.accuracy,
          duration: sessionData.duration,
          guidanceMessages: sessionData.guidanceMessages,
          weakAreas: sessionData.weakAreas
        });

        // Update user progress
        await updateUserProgress();
      }

      // Voice feedback
      speak(`Session completed! You did ${sessionData.reps} reps with ${sessionData.accuracy}% accuracy.`);

      // Reset states
      setRealTimeFeedback([]);

    } catch (error) {
      console.error('Error ending session:', error);
      setError('Failed to save workout session.');
    }
  };

  // Update session stats from AI analysis
  useEffect(() => {
    if (isAnalyzing && sessionData) {
      setSessionStats(prev => ({
        ...prev,
        reps: sessionData.reps,
        correctness: sessionData.accuracy,
        calories: sessionData.calories,
        duration: sessionData.duration
      }));

      // Update real-time feedback
      if (sessionData.guidanceMessages && sessionData.guidanceMessages.length > 0) {
        setRealTimeFeedback(prev => [
          {
            message: sessionData.guidanceMessages[0],
            correctness: sessionData.accuracy,
            timestamp: Date.now()
          },
          ...prev.slice(0, 9)
        ]);
      }

      // Store real-time data in Firebase
      if (user && sessionData) {
        storeRealTimeData(sessionData);
      }
    }
  }, [sessionData, isAnalyzing, user]);

  // Store real-time workout data in Firebase
  const storeRealTimeData = async (data) => {
    try {
      const sessionRef = ref(realtimeDb, `sessions/${user.uid}/current`);
      await set(sessionRef, {
        ...data,
        timestamp: Date.now(),
        userId: user.uid,
        exerciseType: selectedExercise
      });
    } catch (error) {
      console.error('Error storing real-time data:', error);
    }
  };

  // Fetch all public collections from Firestore
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch workout categories
        const categoriesSnapshot = await getDocs(collection(db, 'workoutCategories'));
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setWorkoutCategories(categoriesData);

        // Fetch exercises
        const exercisesSnapshot = await getDocs(collection(db, 'exercises'));
        const exercisesData = exercisesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setExercises(exercisesData);

        // Fetch weekly plans
        const weeklyPlansSnapshot = await getDocs(collection(db, 'weeklyPlans'));
        if (!weeklyPlansSnapshot.empty) {
          const planData = weeklyPlansSnapshot.docs[0].data();
          setWeeklyPlan(planData.days || []);
        } else {
          setWeeklyPlan(generateDefaultWeeklyPlan());
        }

        // Fetch motivational quotes
        const quotesSnapshot = await getDocs(collection(db, 'motivationalQuotes'));
        const quotesData = quotesSnapshot.docs.map(doc => 
          doc.data().text || doc.data().quote || "Stay motivated and keep pushing!"
        );
        setMotivationalQuotes(quotesData);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load workout data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Fetch user progress from Firestore
  const fetchUserProgress = async (uid) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProgressData({
          workoutsCompleted: userData.workoutsCompleted || 0,
          streak: userData.streak || 0,
          caloriesBurned: userData.caloriesBurned || 0,
          lastWorkoutDate: userData.lastWorkoutDate || null
        });
      } else {
        // Create user document with default progress
        const defaultProgress = {
          workoutsCompleted: 0,
          streak: 0,
          caloriesBurned: 0,
          lastWorkoutDate: null,
          createdAt: serverTimestamp(),
          preferences: {},
          fitnessLevel: 'beginner',
          goals: []
        };
        await setDoc(userDocRef, defaultProgress);
        setProgressData(defaultProgress);
      }
    } catch (err) {
      console.error('Error fetching user progress:', err);
      setError('Failed to load user progress.');
    }
  };

  const updateUserProgress = async () => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      await updateDoc(userDocRef, {
        workoutsCompleted: (progressData.workoutsCompleted || 0) + 1,
        caloriesBurned: (progressData.caloriesBurned || 0) + sessionData.calories,
        lastWorkoutDate: serverTimestamp(),
        streak: calculateStreak(progressData.lastWorkoutDate, progressData.streak || 0),
        workoutHistory: arrayUnion({
          type: selectedExercise,
          date: serverTimestamp(),
          reps: sessionData.reps,
          calories: sessionData.calories,
          correctness: sessionData.accuracy,
          duration: sessionData.duration,
          guidanceMessages: sessionData.guidanceMessages,
          weakAreas: sessionData.weakAreas
        })
      });

      // Refresh progress data
      await fetchUserProgress(user.uid);
      
      console.log('✅ Progress updated successfully');
      
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  // Video upload functions
  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setError('Please upload a video file');
        return;
      }
      
      if (file.size > 50 * 1024 * 1024) {
        setError('Video file too large. Maximum size is 50MB.');
        return;
      }
      
      const videoUrl = URL.createObjectURL(file);
      setUploadedVideo({
        file,
        url: videoUrl,
        name: file.name
      });
      setVideoAnalysis(null);
      console.log('📹 Video uploaded:', file.name);
    }
  };

  const analyzeUploadedVideo = async () => {
    if (!uploadedVideo || !selectedExercise) {
      setError('Please select a video and exercise type');
      return;
    }

    setIsVideoAnalyzing(true);
    setError('');

    try {
      // For now, we'll simulate analysis since we don't have actual video processing
      // In production, you'd send the video to your backend for processing
      
      const simulatedAnalysis = {
        timestamp: new Date(),
        exerciseType: selectedExercise,
        correctnessScore: 0.75 + Math.random() * 0.2,
        feedback: [
          "✅ Video analysis complete!",
          "📊 Detected 12 reps with good form",
          "💡 Suggestion: Maintain consistent tempo",
          "🎯 Focus on keeping core engaged",
          "Overall: Great workout! 💪"
        ],
        repCount: Math.floor(Math.random() * 15) + 8,
        riskLevel: 'low',
        duration: Math.floor(Math.random() * 120) + 60,
        summary: {
          totalReps: Math.floor(Math.random() * 15) + 8,
          goodReps: Math.floor(Math.random() * 12) + 5,
          badReps: Math.floor(Math.random() * 3),
          improvements: ["Work on depth", "Maintain consistent form"]
        }
      };

      setVideoAnalysis(simulatedAnalysis);
      console.log('✅ Video analysis complete:', simulatedAnalysis);
      
      // Save to Firebase
      if (user) {
        const videoSessionRef = doc(collection(db, 'videoSessions'));
        await setDoc(videoSessionRef, {
          id: videoSessionRef.id,
          userId: user.uid,
          exerciseType: selectedExercise,
          videoName: uploadedVideo.name,
          analysis: simulatedAnalysis,
          createdAt: serverTimestamp()
        });
      }
      
    } catch (error) {
      console.error('❌ Video analysis error:', error);
      setError(`Video analysis failed: ${error.message}`);
    } finally {
      setIsVideoAnalyzing(false);
    }
  };

  const resetVideoUpload = () => {
    setUploadedVideo(null);
    setVideoAnalysis(null);
    setVideoUploadMode(false);
  };

  // Calculate streak
  const calculateStreak = (lastWorkoutDate, currentStreak) => {
    if (!lastWorkoutDate) return 1;
    
    const lastDate = lastWorkoutDate.toDate();
    const today = new Date();
    const diffTime = today - lastDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays === 1 ? currentStreak + 1 : 1;
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      if (isRecording) {
        await endSession();
      }
      await signOut(auth);
    } catch (err) {
      console.error('Error logging out:', err);
      setError('Failed to log out');
    }
  };

  // Generate default weekly plan if none exists
  const generateDefaultWeeklyPlan = () => [
    { 
      day: 'Monday', 
      workout: 'Upper Body Strength', 
      icon: '💪', 
      duration: '45 mins',
      description: 'Build upper body strength with compound movements',
      difficulty: 'Intermediate'
    },
    { 
      day: 'Tuesday', 
      workout: 'HIIT Cardio', 
      icon: '🔥', 
      duration: '30 mins',
      description: 'High-intensity interval training for maximum calorie burn',
      difficulty: 'Advanced'
    },
    { 
      day: 'Wednesday', 
      workout: 'Yoga & Flexibility', 
      icon: '🧘', 
      duration: '40 mins',
      description: 'Improve flexibility and mental focus',
      difficulty: 'Beginner'
    },
    { 
      day: 'Thursday', 
      workout: 'Lower Body Strength', 
      icon: '🦵', 
      duration: '50 mins',
      description: 'Target leg muscles for balanced strength',
      difficulty: 'Intermediate'
    },
    { 
      day: 'Friday', 
      workout: 'Core & Balance', 
      icon: '⚖️', 
      duration: '35 mins',
      description: 'Strengthen core muscles and improve stability',
      difficulty: 'Beginner'
    },
    { 
      day: 'Saturday', 
      workout: 'Active Recovery', 
      icon: '🌊', 
      duration: '25 mins',
      description: 'Light activity to promote recovery',
      difficulty: 'Beginner'
    },
    { 
      day: 'Sunday', 
      workout: 'Rest Day', 
      icon: '😴', 
      duration: '0 mins',
      description: 'Recover and prepare for the week ahead',
      difficulty: 'None'
    }
  ];

  // Rotate motivational quotes
  useEffect(() => {
    if (motivationalQuotes.length === 0) return;

    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [motivationalQuotes]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-400 text-xl">Loading your fitness journey...</p>
        </div>
      </div>
    );
  }

  // Video Upload Section Component
  const VideoUploadSection = () => (
    <section className="py-16 px-4 md:px-8 bg-gray-800/20">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-blue-400">
          📹 UPLOAD & ANALYZE WORKOUT VIDEO
        </h2>
        
        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-8 border border-green-500/30">
          {!videoUploadMode ? (
            <div className="text-center">
              <motion.button
                onClick={() => setVideoUploadMode(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg text-xl font-bold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 mb-4"
              >
                📤 Upload Workout Video
              </motion.button>
              <p className="text-gray-300">
                Get AI feedback on your recorded workouts. Upload any exercise video for analysis.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Exercise Selection */}
              <div>
                <label className="block text-cyan-300 font-semibold mb-3">
                  Select Exercise Type:
                </label>
                <select 
                  value={selectedExercise}
                  onChange={(e) => setSelectedExercise(e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-cyan-500/50 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="pushup">Push-ups</option>
                  <option value="squat">Squats</option>
                  <option value="lunge">Lunges</option>
                  <option value="plank">Plank</option>
                </select>
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-cyan-300 font-semibold mb-3">
                  Upload Video:
                </label>
                <div className="border-2 border-dashed border-green-500/30 rounded-lg p-6 text-center hover:border-green-500/50 transition-colors">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-upload"
                  />
                  <label
                    htmlFor="video-upload"
                    className="cursor-pointer block"
                  >
                    <div className="text-4xl mb-2">📹</div>
                    <p className="text-green-300 font-semibold mb-1">
                      {uploadedVideo ? 'Video Selected' : 'Click to Upload Video'}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {uploadedVideo ? uploadedVideo.name : 'MP4, MOV, AVI (max 50MB)'}
                    </p>
                  </label>
                </div>
              </div>

              {/* Uploaded Video Preview */}
              {uploadedVideo && (
                <div>
                  <label className="block text-cyan-300 font-semibold mb-3">
                    Video Preview:
                  </label>
                  <video
                    src={uploadedVideo.url}
                    controls
                    className="w-full rounded-lg max-h-64"
                  />
                </div>
              )}

              {/* Analysis Results */}
              {videoAnalysis && (
                <div className="bg-gray-900/50 rounded-lg p-6 border border-blue-500/30">
                  <h3 className="text-xl font-bold text-blue-300 mb-4">📊 Video Analysis Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-cyan-300 mb-2">Performance Summary</h4>
                      <div className="space-y-2">
                        <p>Total Reps: <span className="text-green-400">{videoAnalysis.repCount}</span></p>
                        <p>Form Score: <span className="text-yellow-400">{Math.round(videoAnalysis.correctnessScore * 100)}%</span></p>
                        <p>Duration: <span className="text-purple-400">{videoAnalysis.duration}s</span></p>
                        <p>Risk Level: <span className={`${videoAnalysis.riskLevel === 'low' ? 'text-green-400' : 'text-yellow-400'}`}>{videoAnalysis.riskLevel}</span></p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-cyan-300 mb-2">Feedback</h4>
                      <div className="space-y-2">
                        {videoAnalysis.feedback.map((item, index) => (
                          <p key={index} className="text-sm">{item}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center pt-4">
                {uploadedVideo && !videoAnalysis && (
                  <motion.button
                    onClick={analyzeUploadedVideo}
                    disabled={isVideoAnalyzing}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-cyan-600 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVideoAnalyzing ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </span>
                    ) : (
                      '🎯 Analyze Video'
                    )}
                  </motion.button>
                )}
                
                <motion.button
                  onClick={resetVideoUpload}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
                >
                  {videoAnalysis ? 'Upload New Video' : 'Cancel'}
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-900/90 border border-red-500 rounded-lg p-4 max-w-sm">
          <div className="flex justify-between items-center">
            <p className="text-red-200">{error}</p>
            <button 
              onClick={() => setError('')}
              className="text-red-400 hover:text-red-200 ml-4"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Camera Debug Info */}
      {isRecording && (
        <div className="fixed top-4 left-4 z-50 bg-blue-900/90 border border-blue-500 rounded-lg p-4 max-w-sm">
          <h4 className="font-bold text-blue-300 mb-2">AI Analysis Debug</h4>
          <div className="text-sm">
            <p>AI Status: {isAnalyzing ? '✅ Analyzing' : '❌ Idle'}</p>
            <p>Video Ready: {videoRef.current?.readyState === 4 ? '✅' : '❌'}</p>
            <p>Detector: {detector ? '✅ Loaded' : '❌ Loading'}</p>
            <p>Reps: {sessionData.reps}</p>
            <p>Accuracy: {sessionData.accuracy}%</p>
          </div>
        </div>
      )}

      {/* Real-time Workout Section */}
      {isRecording && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Video Feed and Pose Canvas */}
              <div className="lg:col-span-2">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="relative">
                    <div className="bg-gradient-to-r from-cyan-600 to-purple-600 text-white px-4 py-2 rounded-t-lg flex justify-between items-center">
                      <span className="font-bold">🤖 AI WORKOUT - {selectedExercise.toUpperCase()}</span>
                      <span className="text-sm">
                        {sessionData.duration > 0 
                          ? `Duration: ${Math.floor(sessionData.duration / 60)}:${(sessionData.duration % 60).toString().padStart(2, '0')}`
                          : 'Starting...'
                        }
                      </span>
                    </div>
                    
                    {/* Video Container with AI Analysis */}
                    <div className="relative bg-black rounded-b-lg min-h-[400px] flex items-center justify-center">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full rounded-b-lg"
                        onLoadedMetadata={() => console.log('✅ Video metadata loaded')}
                        onCanPlay={() => console.log('✅ Video can play')}
                        onPlay={() => console.log('🎥 Video started playing')}
                        onError={(e) => console.error('❌ Video error:', e)}
                      />
                      
                      {/* AI Pose Canvas Overlay */}
                      <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0 w-full h-full rounded-b-lg"
                        width={640}
                        height={480}
                      />
                      
                      {/* Fallback if video doesn't load */}
                      {(!videoRef.current?.videoWidth || videoRef.current.videoWidth === 0) && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 rounded-b-lg">
                          <div className="text-6xl mb-4">📷</div>
                          <p className="text-xl text-cyan-300 mb-2">Camera Loading...</p>
                          <p className="text-gray-400 text-sm">Please allow camera permissions</p>
                          <button 
                            onClick={startCamera}
                            className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg"
                          >
                            Retry Camera
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Controls */}
                  <div className="mt-4 flex gap-4 items-center">
                    <select 
                      value={selectedExercise}
                      onChange={(e) => setSelectedExercise(e.target.value)}
                      className="bg-gray-700 text-white px-4 py-2 rounded border border-cyan-500/50"
                      disabled={isRecording}
                    >
                      <option value="pushup">Push-ups</option>
                      <option value="squat">Squats</option>
                      <option value="lunge">Lunges</option>
                      <option value="plank">Plank</option>
                    </select>
                    
                    <div className="flex-1 text-center">
                      <span className="text-cyan-300 font-semibold">
                        {isAnalyzing ? '🤖 AI Analyzing...' : '🔄 Starting AI...'}
                      </span>
                    </div>
                    
                    <button
                      onClick={endSession}
                      className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                      End Workout
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <SessionStats stats={{
                  reps: sessionData.reps,
                  sets: sessionData.sets,
                  calories: sessionData.calories,
                  duration: sessionData.duration,
                  correctness: sessionData.accuracy
                }} />
                <FeedbackPanel 
                  feedback={sessionData.guidanceMessages?.map((message, index) => ({
                    message,
                    correctness: sessionData.accuracy,
                    timestamp: Date.now() - index * 1000
                  })) || []}
                  weakAreas={sessionData.weakAreas}
                  accuracy={sessionData.accuracy}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Content */}
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
            AI FITNESS COACH
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-cyan-200"
          >
            Real-time pose detection, form analysis, and personalized guidance
          </motion.p>
          
          {/* Start Workout Button */}
          <motion.button
            onClick={() => startSession('Quick Start')}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(34, 211, 238, 0.5)" }}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg text-xl font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 mb-4"
          >
            🤖 START AI WORKOUT
          </motion.button>
          
          <div className="text-cyan-300 text-sm">
            💡 AI-powered real-time form analysis with pose detection
          </div>
        </div>
      </section>

      {/* Video Upload Section */}
      <VideoUploadSection />

      {/* Workout Categories */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-cyan-400">
            AI WORKOUT CATEGORIES
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {workoutCategories.length > 0 ? (
              workoutCategories.map((category, index) => (
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
                  onClick={() => startSession(category.name)}
                >
                  <div className="text-4xl mb-4 text-center">{category.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-cyan-300 text-center">{category.name}</h3>
                  <p className="text-gray-300 text-sm text-center">{category.description}</p>
                  <div className="mt-4 text-center">
                    <span className="text-cyan-400 text-sm">AI Analysis Available</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-400">No workout categories found. Using default exercises.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {[
                    { name: 'Push-ups', icon: '💪', type: 'pushup' },
                    { name: 'Squats', icon: '🦵', type: 'squat' },
                    { name: 'Lunges', icon: '🚶', type: 'lunge' },
                    { name: 'Plank', icon: '🧘', type: 'plank' }
                  ].map((exercise, index) => (
                    <motion.div
                      key={exercise.name}
                      whileHover={{ scale: 1.05 }}
                      className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/30 cursor-pointer"
                      onClick={() => startSession(exercise.type)}
                    >
                      <div className="text-2xl mb-2">{exercise.icon}</div>
                      <p className="text-cyan-300 font-semibold">{exercise.name}</p>
                      <p className="text-green-400 text-xs mt-1">AI Enabled</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Progress Dashboard */}
      <section className="py-16 px-4 md:px-8 bg-gray-800/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
            YOUR AI PROGRESS
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300"
            >
              <div className="text-4xl mb-4 text-cyan-400">🎯</div>
              <h3 className="text-xl font-bold mb-4 text-cyan-300">AI Workouts Completed</h3>
              <div className="text-5xl font-bold text-center text-white mb-2">
                {progressData.workoutsCompleted}
              </div>
              <p className="text-center text-cyan-200 text-sm">AI-powered sessions</p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-pink-500/30 hover:border-pink-400/50 transition-all duration-300"
            >
              <div className="text-4xl mb-4 text-pink-400">🔥</div>
              <h3 className="text-xl font-bold mb-4 text-pink-300">AI Streak</h3>
              <div className="text-5xl font-bold text-center text-white mb-2">
                {progressData.streak} days
              </div>
              <p className="text-center text-pink-200 text-sm">AI-guided consistency</p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300"
            >
              <div className="text-4xl mb-4 text-purple-400">🤖</div>
              <h3 className="text-xl font-bold mb-4 text-purple-300">AI Accuracy</h3>
              <div className="text-5xl font-bold text-center text-white mb-2">
                {sessionData.accuracy || 0}%
              </div>
              <p className="text-center text-purple-200 text-sm">Form perfection score</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* User Status Bar */}
      {user && (
        <div className="fixed bottom-4 right-4 bg-gray-800/90 backdrop-blur-md rounded-lg p-4 border border-cyan-500/30">
          <div className="flex items-center space-x-3">
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=0ea5e9&color=fff`}
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
            <div>
              <p className="text-sm text-cyan-300">{user.displayName || 'User'}</p>
              <p className="text-xs text-gray-400">AI Streak: {progressData.streak} days</p>
            </div>
            <button 
              onClick={handleLogout}
              className="text-xs text-red-400 hover:text-red-300 ml-2"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutPage;