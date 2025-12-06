// src/pages/AICoachPage.jsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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

/**
 * Single-file optimized AICoachPage component
 * - Keeps same UI & styling
 * - Better separation of handlers, memoized static data
 * - Reduced re-renders via useCallback/useMemo
 * - Robust cleanup for media and timers
 */

const AICoachPage = () => {
  // ---------- UI / Feature toggles ----------
  const [darkMode, setDarkMode] = useState(true);
  const [voiceFeedback, setVoiceFeedback] = useState(false);

  // ---------- Video / Recording ----------
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // ---------- Workout session ----------
  const [currentExercise, setCurrentExercise] = useState(0);
  const [isExercising, setIsExercising] = useState(false);
  const sessionTimerRef = useRef(null);

  // ---------- Stats ----------
  const [repsCompleted, setRepsCompleted] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [correctFormPercentage, setCorrectFormPercentage] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);

  // ---------- Feedback / History ----------
  const [feedbackMessages, setFeedbackMessages] = useState([]);
  const feedbackDebounceRef = useRef(null);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [showProgressChart, setShowProgressChart] = useState(false);

  // ---------- Video Upload ----------
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/analyze_video", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      setUploadResult(data);
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Failed to analyze video. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ---------- Memoized static data ----------
  const exercises = useMemo(() => [
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
  ], []);

  const workoutPlans = useMemo(() => [
    { id: 1, name: 'CYBER INITIATION', exercises: [0, 1, 2], duration: 15, difficulty: 'Beginner' },
    { id: 2, name: 'QUANTUM CIRCUIT', exercises: [0, 1, 2, 3], duration: 25, difficulty: 'Intermediate' },
    { id: 3, name: 'NEURAL OVERLOAD', exercises: [1, 0, 3, 2, 1], duration: 35, difficulty: 'Advanced' }
  ], []);

  const achievements = useMemo(() => [
    { id: 1, name: 'FIRST CONTACT', description: 'Complete first workout', unlocked: true },
    { id: 2, name: 'FORM MASTER', description: 'Achieve 95% form accuracy', unlocked: false },
    { id: 3, name: 'QUANTUM CONSISTENCY', description: '7-day streak', unlocked: false },
    { id: 4, name: 'CYBER WARRIOR', description: '1000 total reps', unlocked: false }
  ], []);

  const currentExerciseData = exercises[currentExercise];

  // ---------- Helpers ----------
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // ---------- Skeleton Drawing ----------
  const canvasRef = useRef(null);

  const drawSkeleton = useCallback((landmarks, isCorrect) => {
    const canvas = canvasRef.current;
    if (!canvas || !landmarks) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    const connections = [
      [11, 13], [13, 15], // Left arm
      [12, 14], [14, 16], // Right arm
      [11, 12], // Shoulders
      [11, 23], [12, 24], // Torso
      [23, 24], // Hips
      [23, 25], [25, 27], // Left leg
      [24, 26], [26, 28]  // Right leg
    ];

    ctx.lineWidth = 4;
    ctx.strokeStyle = isCorrect ? '#00ff00' : '#ff0000'; // Green if correct, Red if wrong

    connections.forEach(([start, end]) => {
      const p1 = landmarks[start];
      const p2 = landmarks[end];
      if (p1 && p2 && p1.visibility > 0.5 && p2.visibility > 0.5) {
        ctx.beginPath();
        ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
        ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
        ctx.stroke();
      }
    });

    // Draw points
    ctx.fillStyle = '#00ffff';
    landmarks.forEach(lm => {
      if (lm.visibility > 0.5) {
        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  }, []);

  // ---------- WebSocket ----------
  const wsRef = useRef(null);
  const frameIntervalRef = useRef(null);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [currentStage, setCurrentStage] = useState("-");
  const [detectedExerciseName, setDetectedExerciseName] = useState("Detecting...");

  const connectWebSocket = useCallback(() => {
    if (wsRef.current) return;

    const ws = new WebSocket('ws://localhost:8000/ws/analyze');

    ws.onopen = () => {
      console.log('✅ Connected to AI Coach Backend');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Handle Redirection
        if (data.redirect_url) {
          setIsExercising(false); // Pause session
          alert("⚠️ Incorrect Posture Detected! Redirecting to tutorial...");
          window.open(data.redirect_url, '_blank');
          return;
        }

        // Update Detected Exercise
        if (data.exercise) {
          setDetectedExerciseName(data.exercise.toUpperCase().replace('_', ' '));
        }

        // Update Metrics
        if (data.current_angle !== undefined) setCurrentAngle(data.current_angle);
        if (data.stage) setCurrentStage(data.stage.toUpperCase());

        // Draw Skeleton
        if (data.landmarks) {
          drawSkeleton(data.landmarks, data.is_correct);
        }

        if (data.feedback && data.feedback.length > 0) {
          const now = Date.now();
          const newFeedbacks = data.feedback.map((msg, idx) => ({
            id: now + idx,
            message: msg,
            type: data.is_correct ? 'success' : 'warning',
            timestamp: now
          }));

          setFeedbackMessages(prev => [...newFeedbacks, ...prev].slice(0, 5));
        }

        if (data.reps !== undefined) {
          setRepsCompleted(data.reps);
        }

        if (data.accuracy !== undefined) {
          setCorrectFormPercentage(data.accuracy);
        } else if (data.is_correct) {
          setCorrectFormPercentage(prev => Math.min(100, prev + 1));
        } else {
          setCorrectFormPercentage(prev => Math.max(0, prev - 1));
        }

      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      console.log('❌ Disconnected from AI Coach Backend');
      wsRef.current = null;
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current = ws;
  }, [drawSkeleton]);

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendFrame = useCallback(() => {
    if (!videoRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL('image/jpeg', 0.5);

    wsRef.current.send(JSON.stringify({
      image: base64Image,
      exercise: currentExerciseData.name
    }));
  }, [currentExerciseData]);

  // ---------- Webcam control ----------
  const startVideo = useCallback(async () => {
    if (isVideoActive) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
      streamRef.current = stream;
      setIsVideoActive(true);
      connectWebSocket();
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setIsVideoActive(false);
    }
  }, [isVideoActive, connectWebSocket]);

  useEffect(() => {
    if (isVideoActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(e => console.error("Play error:", e));
    }
  }, [isVideoActive]);

  const stopVideo = useCallback(() => {
    const s = streamRef.current;
    if (s && s.getTracks) {
      s.getTracks().forEach(t => t.stop());
    }
    streamRef.current = null;
    setIsVideoActive(false);
    disconnectWebSocket();
    if (isRecording) {
      stopRecording();
    }
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
  }, [isRecording, disconnectWebSocket]);

  // ---------- Recording (stubbed) ----------
  const startRecording = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;
    try {
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size) chunks.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Recording start failed:', err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    try {
      const mr = mediaRecorderRef.current;
      if (mr && mr.state !== 'inactive') mr.stop();
    } catch (err) {
      // ignore
    } finally {
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  }, []);

  const toggleRecording = useCallback(() => {
    if (!isVideoActive) return;
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isVideoActive, isRecording, startRecording, stopRecording]);

  // ---------- Workout session control ----------
  const saveWorkoutSession = useCallback(() => {
    const session = {
      id: Date.now(),
      exercise: currentExerciseData.name,
      duration: sessionTime,
      reps: repsCompleted,
      calories: caloriesBurned,
      formScore: correctFormPercentage,
      timestamp: new Date().toISOString()
    };
    setWorkoutHistory(prev => [session, ...prev].slice(0, 10)); // keep last 10
  }, [currentExerciseData, sessionTime, repsCompleted, caloriesBurned, correctFormPercentage]);

  const stopExerciseSession = useCallback(() => {
    setIsExercising(false);
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    saveWorkoutSession();
  }, [saveWorkoutSession]);

  const toggleExercise = useCallback(() => {
    if (!isVideoActive) return;
    if (isExercising) {
      stopExerciseSession();
    } else {
      setIsExercising(true);
      setSessionTime(0);
      // start interval
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
        setCaloriesBurned(prev => prev + (currentExerciseData.caloriesPerMin / 60));
      }, 1000);

      // Start sending frames
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = setInterval(sendFrame, 100); // 10 FPS
    }
  }, [isVideoActive, isExercising, stopExerciseSession, sendFrame, currentExerciseData]);

  // ---------- Exercise navigation ----------
  const nextExercise = useCallback(() => {
    setCurrentExercise(prev => (prev + 1) % exercises.length);
    setFeedbackMessages([]);
  }, [exercises.length]);

  const prevExercise = useCallback(() => {
    setCurrentExercise(prev => (prev - 1 + exercises.length) % exercises.length);
    setFeedbackMessages([]);
  }, [exercises.length]);

  // ---------- UI toggles ----------
  const toggleDarkMode = useCallback(() => setDarkMode(prev => !prev), []);
  const toggleVoiceFeedback = useCallback(() => setVoiceFeedback(prev => !prev), []);

  // ---------- Clean up on unmount ----------
  useEffect(() => {
    return () => {
      // stop media
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      // clear timers
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
      if (feedbackDebounceRef.current) {
        clearTimeout(feedbackDebounceRef.current);
      }
      if (isRecording) {
        stopRecording();
      }
      disconnectWebSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disconnectWebSocket]);

  // ---------- Small performance improvements: only recalc when necessary ----------
  const repCountDisplay = repsCompleted; // local alias for readability
  const caloriesDisplay = caloriesBurned;
  const formDisplay = correctFormPercentage;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-cyan-900/10 pointer-events-none" />

      <div className="relative container mx-auto px-4 py-8 pt-[90px]">
        {/* Header */}
        <motion.header className="mb-8 text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI CYBER COACH
          </h1>
          <p className={`text-lg ${darkMode ? 'text-cyan-200' : 'text-gray-600'}`}>
            Real-time neural feedback for optimal cybernetic performance
          </p>
        </motion.header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="xl:col-span-2 space-y-6">
            {/* Video */}
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
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <canvas ref={canvasRef} width={640} height={480} className="absolute top-0 left-0 w-full h-full pointer-events-none" />

                    {isExercising && (
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Rep Counter */}
                        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/30">
                          <div className="text-cyan-300 text-sm">REP COUNT</div>
                          <div className="text-2xl font-bold text-white">{repCountDisplay}</div>
                        </div>

                        {/* Session Timer */}
                        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-purple-500/30">
                          <div className="text-purple-300 text-sm">SESSION TIME</div>
                          <div className="text-2xl font-bold text-white">{formatTime(sessionTime)}</div>
                        </div>

                        {/* Advanced Metrics Overlay */}
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                          <div className="bg-black/60 backdrop-blur-md p-3 rounded-lg border border-green-500/30">
                            <div className="text-green-300 text-xs">DETECTED EXERCISE</div>
                            <div className="text-xl font-bold text-white">{detectedExerciseName}</div>
                          </div>

                          <div className="bg-black/60 backdrop-blur-md p-3 rounded-lg border border-yellow-500/30">
                            <div className="text-yellow-300 text-xs">JOINT ANGLE</div>
                            <div className="text-xl font-bold text-white">{currentAngle}°</div>
                          </div>

                          <div className="bg-black/60 backdrop-blur-md p-3 rounded-lg border border-blue-500/30">
                            <div className="text-blue-300 text-xs">PHASE</div>
                            <div className="text-xl font-bold text-white">{currentStage}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center flex items-center justify-center h-full">
                    <div>
                      <div className="text-6xl mb-4">📡</div>
                      <p className="text-gray-400">NEURAL LINK OFFLINE</p>
                      <p className="text-sm text-gray-500">Activate camera to begin cyber analysis</p>
                    </div>
                  </div>
                )}

                {/* Recording Indicator */}
                {isRecording && (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    RECORDING
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <motion.button
                  onClick={() => (isVideoActive ? stopVideo() : startVideo())}
                  className={`p-3 rounded-lg font-medium flex items-center justify-center gap-2 ${isVideoActive
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30'
                    : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30'
                    } transition-all duration-300`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-pressed={isVideoActive}
                >
                  <Camera className="h-4 w-4" />
                  {isVideoActive ? 'DEACTIVATE' : 'ACTIVATE'}
                </motion.button>

                <motion.button
                  onClick={toggleExercise}
                  disabled={!isVideoActive}
                  className={`p-3 rounded-lg font-medium flex items-center justify-center gap-2 ${isExercising
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
                  className={`p-3 rounded-lg font-medium flex items-center justify-center gap-2 ${isRecording
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
                  className={`p-3 rounded-lg font-medium flex items-center justify-center gap-2 ${voiceFeedback
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

            {/* Feedback */}
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
                  {feedbackMessages.map(feedback => (
                    <motion.div
                      key={feedback.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`p-4 rounded-lg border-l-4 backdrop-blur-sm ${feedback.type === 'warning'
                        ? 'bg-yellow-500/10 border-yellow-500 text-yellow-300'
                        : feedback.type === 'success'
                          ? 'bg-green-500/10 border-green-500 text-green-300'
                          : 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                        } transition-all duration-300`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${feedback.type === 'warning' ? 'bg-yellow-500' :
                          feedback.type === 'success' ? 'bg-green-500' : 'bg-cyan-500'
                          }`} />
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
                      {isExercising ? 'ANALYZING CYBERNETIC FORM...' : 'AWAITING NEURAL INITIATION'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Progress Charts */}
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
                  onClick={() => setShowProgressChart(prev => !prev)}
                  className="px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 rounded-lg transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {showProgressChart ? 'HIDE CHARTS' : 'SHOW CHARTS'}
                </motion.button>
              </div>

              {showProgressChart && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-700/30 rounded-lg p-4 border border-cyan-500/20">
                    <h3 className="text-cyan-300 font-semibold mb-3">FORM ACCURACY</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-cyan-200">Current Session</span>
                        <span className="text-cyan-400">{formDisplay}%</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-3">
                        <motion.div
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full shadow-lg shadow-cyan-500/30"
                          initial={{ width: 0 }}
                          animate={{ width: `${formDisplay}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700/30 rounded-lg p-4 border border-purple-500/20">
                    <h3 className="text-purple-300 font-semibold mb-3">ENERGY OUTPUT</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-200">Calories Burned</span>
                        <span className="text-purple-400">{caloriesDisplay}</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-3">
                        <motion.div
                          className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full shadow-lg shadow-purple-500/30"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, Math.floor(caloriesDisplay / 2))}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Exercise Guidance */}
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
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${currentExerciseData.difficulty === 'Beginner'
                      ? 'bg-green-500/20 text-green-300'
                      : currentExerciseData.difficulty === 'Intermediate'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-red-500/20 text-red-300'
                      }`}
                  >
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
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
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

            {/* Stats */}
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
                  <p className="text-3xl font-bold text-cyan-300">{repCountDisplay}</p>
                  <p className="text-sm text-cyan-400">REPS COMPLETED</p>
                </div>

                <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <p className="text-3xl font-bold text-purple-300">{caloriesDisplay}</p>
                  <p className="text-sm text-purple-400">ENERGY OUTPUT</p>
                </div>

                <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-3xl font-bold text-green-300">{formDisplay}%</p>
                  <p className="text-sm text-green-400">FORM ACCURACY</p>
                </div>

                <div className="text-center p-4 rounded-lg bg-pink-500/10 border border-pink-500/20">
                  <p className="text-3xl font-bold text-pink-300">{formatTime(sessionTime)}</p>
                  <p className="text-sm text-pink-400">SESSION TIME</p>
                </div>
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              className={`rounded-xl p-6 backdrop-blur-md border ${darkMode ? 'bg-gray-800/50 border-yellow-500/20' : 'bg-white border-gray-200'} shadow-lg hover:shadow-yellow-500/10 transition-all duration-300`}
              whileHover={{ y: -5 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-yellow-300 flex items-center gap-2">
                <Trophy className="h-6 w-6" />
                CYBER ACHIEVEMENTS
              </h2>

              <div className="space-y-3">
                {achievements.map(achievement => (
                  <div
                    key={achievement.id}
                    className={`p-3 rounded-lg border ${achievement.unlocked ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300' : 'bg-gray-700/30 border-gray-600/30 text-gray-400'
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
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isUploading}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="video/*"
                    className="hidden"
                  />
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Video className="h-4 w-4" />
                  )}
                  {isUploading ? 'ANALYZING...' : 'UPLOAD VIDEO'}
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

        {/* Upload Result Modal */}
        <AnimatePresence>
          {uploadResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setUploadResult(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-gray-800 border border-cyan-500/30 rounded-xl p-8 max-w-md w-full shadow-2xl shadow-cyan-500/20"
                onClick={e => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold text-cyan-300 mb-6 flex items-center gap-2">
                  <Activity className="h-6 w-6" />
                  ANALYSIS COMPLETE
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                    <span className="text-gray-400">EXERCISE</span>
                    <span className="text-xl font-bold text-white">{uploadResult.exercise.toUpperCase()}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                    <span className="text-gray-400">REPS COUNTED</span>
                    <span className="text-xl font-bold text-green-400">{uploadResult.reps}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                    <span className="text-gray-400">AVG FORM</span>
                    <span className="text-xl font-bold text-blue-400">{uploadResult.accuracy}%</span>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-purple-300 mb-2">AI FEEDBACK:</h3>
                    <ul className="space-y-2">
                      {uploadResult.feedback.length > 0 ? (
                        uploadResult.feedback.map((msg, idx) => (
                          <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                            <span className="text-purple-500 mt-1">•</span>
                            {msg}
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-gray-500 italic">No specific corrections needed. Great form!</li>
                      )}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => setUploadResult(null)}
                  className="w-full mt-8 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded-lg font-bold transition-all"
                >
                  CLOSE REPORT
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default AICoachPage;
