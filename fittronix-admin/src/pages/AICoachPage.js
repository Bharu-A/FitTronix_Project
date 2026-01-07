// src/pages/AICoachPage.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Video,
  Play,
  Square,
  Upload,
  Zap,
  Activity,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

const AICoachPage = () => {
  // ---------- UI State ----------
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isExercising, setIsExercising] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);

  // ---------- Refs ----------
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const fileInputRef = useRef(null);

  // ---------- Analysis State ----------
  const [repsCompleted, setRepsCompleted] = useState(0);
  const [correctFormPercentage, setCorrectFormPercentage] = useState(0);
  const [feedbackMessages, setFeedbackMessages] = useState([]);
  const [detectedExerciseName, setDetectedExerciseName] = useState("Detecting...");
  const [currentStage, setCurrentStage] = useState("-");
  const [currentAngle, setCurrentAngle] = useState(0);

  // ---------- Upload State ----------
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  // ---------- Static Data ----------
  const exercises = [
    {
      name: 'Squat',
      description: 'Keep feet shoulder-width apart. Keep back straight.',
      targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
      caloriesPerMin: 8,
      difficulty: 'Beginner'
    },
    {
      name: 'Pushup',
      description: 'Hands width apart. Lower body until chest nearly touches floor.',
      targetMuscles: ['Chest', 'Triceps', 'Shoulders'],
      caloriesPerMin: 9,
      difficulty: 'Intermediate'
    },
    {
      name: 'Lunge',
      description: 'Step forward with one leg, lower hips until both knees are bent at 90 degrees.',
      targetMuscles: ['Quadriceps', 'Glutes', 'Calves'],
      caloriesPerMin: 7,
      difficulty: 'Beginner'
    }
  ];

  const currentExerciseData = exercises[currentExercise];

  // ---------- WebSocket Connection ----------
  const connectWebSocket = useCallback(() => {
    if (wsRef.current) return;
    const ws = new WebSocket('ws://localhost:8000/ws/analyze');

    ws.onopen = () => console.log('✅ Connected to AI Coach Backend');

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.redirect_url) {
          setIsExercising(false);
          alert("⚠️ Incorrect Posture Detected! Redirecting to tutorial...");
          window.open(data.redirect_url, '_blank');
          return;
        }

        if (data.exercise) setDetectedExerciseName(data.exercise.toUpperCase().replace('_', ' '));
        if (data.current_angle !== undefined) setCurrentAngle(data.current_angle);
        if (data.stage) setCurrentStage(data.stage.toUpperCase());

        if (data.landmarks) drawSkeleton(data.landmarks, data.is_correct);

        if (data.feedback && data.feedback.length > 0) {
          const now = Date.now();
          const newFeedbacks = data.feedback.map((msg, idx) => ({
            id: now + idx,
            message: msg,
            type: data.is_correct ? 'success' : 'warning',
            timestamp: now
          }));
          setFeedbackMessages(prev => [...newFeedbacks, ...prev].slice(0, 3));
        }

        if (data.reps !== undefined) setRepsCompleted(data.reps);
        if (data.accuracy !== undefined) setCorrectFormPercentage(data.accuracy);

      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      console.log('❌ Disconnected');
      wsRef.current = null;
    };

    wsRef.current = ws;
  }, []);

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  // ---------- Video Handling ----------
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      streamRef.current = stream;
      setIsVideoActive(true);
      connectWebSocket();
    } catch (err) {
      console.error("Error accessing webcam:", err);
      alert("Could not access webcam.");
    }
  };

  useEffect(() => {
    if (isVideoActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(e => console.error("Play error:", e));
      };
    }
  }, [isVideoActive]);

  const stopVideo = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsVideoActive(false);
    disconnectWebSocket();
  };

  const sendFrame = useCallback(() => {
    if (!videoRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // console.log("Sending frame...", canvas.width, canvas.height); // Debug log

    // Scale down for faster transmission if needed, but 720p is fine for localhost
    const base64Image = canvas.toDataURL('image/jpeg', 0.6);
    wsRef.current.send(JSON.stringify({ image: base64Image, exercise: currentExerciseData.name }));
  }, [currentExerciseData.name]);

  useEffect(() => {
    let interval;
    if (isVideoActive && isExercising) {
      interval = setInterval(sendFrame, 100); // 10 FPS
    }
    return () => clearInterval(interval);
  }, [isVideoActive, isExercising, sendFrame]);

  // ---------- Drawing ----------
  const drawSkeleton = (landmarks, isCorrect) => {
    const canvas = canvasRef.current;
    if (!canvas || !videoRef.current) return;
    const ctx = canvas.getContext('2d');

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const color = isCorrect ? '#00FF00' : '#FF0000';
    const connections = [
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24],
      [23, 24], [23, 25], [24, 26], [25, 27], [26, 28], [27, 29], [28, 30]
    ];

    // Draw lines
    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
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
    ctx.fillStyle = '#FFFFFF';
    landmarks.forEach(lm => {
      if (lm.visibility > 0.5) {
        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 6, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };

  // ---------- Upload Logic ----------
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Stop existing stream if any
    stopVideo();

    // Create local URL for playback
    const url = URL.createObjectURL(file);

    if (videoRef.current) {
      // Reset old source if needed
      videoRef.current.srcObject = null;
      videoRef.current.src = url;

      videoRef.current.loop = true; // Enable looping

      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
        setIsVideoActive(true);
        setIsExercising(true); // Auto-start session for uploads
        connectWebSocket();
      };

      // Removed onended handler to allow continuous analysis until manual stop
    }

    // Reset input
    event.target.value = '';
  };

  // ---------- Cleanup ----------
  useEffect(() => {
    return () => {
      stopVideo();
    };
  }, []);

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden flex flex-col items-center justify-center">
      {/* VIDEO LAYER - FULL SCREEN */}
      <div className="absolute inset-0 z-0">
        {isVideoActive ? (
          <>
            <video ref={videoRef} className="w-full h-full object-contain" autoPlay playsInline muted />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <div className="text-center p-10">
              <Camera className="w-20 h-20 text-cyan-500 mx-auto mb-4 animate-pulse" />
              <h2 className="text-4xl font-bold text-white mb-2 tracking-wider">NEURAL LINK OFFLINE</h2>
              <p className="text-gray-400 text-lg">Activate camera to begin real-time pose estimation</p>
            </div>
          </div>
        )}
      </div>

      {/* TOP OVERLAY - HEADER & UPLOAD */}
      <div className="absolute top-24 left-0 right-0 p-6 z-20 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            AI POSTURE COACH
          </h1>
          <p className="text-cyan-200/70 text-sm tracking-widest">REAL-TIME ANALYSIS</p>
        </div>

        <div className="flex gap-4">
          {/* UPLOAD BUTTON */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-blue-500/20 border border-blue-400/20 backdrop-blur-sm"
          >
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
            {isUploading ? "ANALYZING..." : "UPLOAD VIDEO"}
          </motion.button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="video/*"
            className="hidden"
          />

          {/* VISUAL TOGGLE */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => isVideoActive ? stopVideo() : startVideo()}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-lg backdrop-blur-sm border ${isVideoActive
              ? 'bg-red-500/80 hover:bg-red-500 text-white border-red-400/50'
              : 'bg-emerald-500/80 hover:bg-emerald-500 text-white border-emerald-400/50'
              }`}
          >
            <Camera className="w-5 h-5" />
            {isVideoActive ? "STOP CAMERA" : "START CAMERA"}
          </motion.button>
        </div>
      </div>

      {/* BOTTOM OVERLAY - CONTROLS & FEEDBACK */}
      <div className="absolute bottom-0 left-0 right-0 p-8 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
        <div className="max-w-7xl mx-auto flex items-end justify-between gap-8">

          {/* EXERCISE SELECTION */}
          <div className="flex-1 max-w-md">
            <div className="flex items-center justify-between mb-4 text-cyan-500 font-bold tracking-wider text-sm">
              <button onClick={() => setCurrentExercise((p) => (p - 1 + exercises.length) % exercises.length)} className="hover:text-cyan-300">
                <ChevronLeft />
              </button>
              <span>CURRENT PROTOCOL: {currentExerciseData.name.toUpperCase()}</span>
              <button onClick={() => setCurrentExercise((p) => (p + 1) % exercises.length)} className="hover:text-cyan-300">
                <ChevronRight />
              </button>
            </div>
            <div className="bg-black/40 border border-white/10 rounded-xl p-4 backdrop-blur-md">
              <h3 className="text-white font-bold mb-1 flex items-center gap-2"><Activity className="w-4 h-4 text-green-400" /> {detectedExerciseName}</h3>
              <div className="w-full bg-gray-800 h-2 rounded-full mt-2 overflow-hidden">
                <div className="bg-green-500 h-full transition-all duration-300" style={{ width: `${correctFormPercentage}%` }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Form Accuracy</span>
                <span>{correctFormPercentage}%</span>
              </div>
            </div>
          </div>

          {/* MAIN ACTION: START/STOP WORKOUT */}
          <div className="flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={!isVideoActive}
              onClick={() => setIsExercising(!isExercising)}
              className={`w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-2xl ${!isVideoActive ? 'bg-gray-700 border-gray-600 opacity-50 cursor-not-allowed' :
                isExercising
                  ? 'bg-red-600 border-red-400 shadow-red-500/50'
                  : 'bg-white text-black border-cyan-500 shadow-cyan-500/50'
                }`}
            >
              {isExercising ? <Square className="w-8 h-8 fill-current" /> : <Play className="w-10 h-10 fill-current ml-1" />}
            </motion.button>
          </div>

          {/* LIVE FEEDBACK STREAM */}
          <div className="flex-1 max-w-md flex flex-col justify-end h-32">
            <div className="space-y-2">
              <AnimatePresence>
                {feedbackMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className={`p-3 rounded-lg text-sm font-bold backdrop-blur-md border-l-4 shadow-lg ${msg.type === 'success' ? 'bg-green-900/40 border-green-500 text-green-200' : 'bg-amber-900/40 border-amber-500 text-amber-200'
                      }`}
                  >
                    <Zap className="w-3 h-3 inline mr-2" />
                    {msg.message}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* STATS ROW */}
        {isExercising && (
          <div className="flex justify-center gap-12 mt-6 border-t border-white/10 pt-4">
            <div className="text-center">
              <div className="text-4xl font-black text-white">{repsCompleted}</div>
              <div className="text-xs text-gray-400 tracking-widest uppercase">Reps</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-cyan-400">{currentAngle}°</div>
              <div className="text-xs text-cyan-200/50 tracking-widest uppercase">Angle</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-purple-400">{currentStage}</div>
              <div className="text-xs text-purple-200/50 tracking-widest uppercase">Phase</div>
            </div>
          </div>
        )}
      </div>

      {/* UPLOAD MODAL */}
      <AnimatePresence>
        {uploadResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setUploadResult(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-900 border border-cyan-500/50 rounded-2xl p-8 max-w-lg w-full shadow-2xl shadow-cyan-500/20"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Activity className="text-cyan-400" /> Analysis Report
              </h2>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-800 p-4 rounded-xl text-center">
                  <div className="text-xs text-gray-400 mb-1">EXERCISE</div>
                  <div className="font-bold text-white text-lg">{uploadResult.exercise}</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl text-center">
                  <div className="text-xs text-gray-400 mb-1">REPS</div>
                  <div className="font-bold text-green-400 text-3xl">{uploadResult.reps}</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl text-center">
                  <div className="text-xs text-gray-400 mb-1">FORM</div>
                  <div className="font-bold text-blue-400 text-3xl">{uploadResult.accuracy}%</div>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-6 border border-white/5">
                <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">AI Coach Feedback</h3>
                <ul className="space-y-3">
                  {uploadResult.feedback.length > 0 ? (
                    uploadResult.feedback.map((msg, i) => (
                      <li key={i} className="flex gap-3 text-gray-200">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                        {msg}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 italic">Perfect form detected! No corrections needed.</li>
                  )}
                </ul>
              </div>

              <button
                onClick={() => setUploadResult(null)}
                className="w-full mt-8 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl transition-all"
              >
                CLOSE REPORT
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AICoachPage;
