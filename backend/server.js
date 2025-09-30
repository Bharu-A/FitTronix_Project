// backend/server.js - Firebase Compatible Version
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.log('ℹ️ Firebase Admin already initialized');
}

const db = admin.firestore();
const realtimeDb = admin.database();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'FitTronix Backend is running with Firebase!',
    timestamp: new Date().toISOString()
  });
});

// Video analysis endpoint
app.post('/api/analyze-video', async (req, res) => {
  const { videoData, exerciseType } = req.body;
  
  console.log(`📹 Video analysis requested for: ${exerciseType}`);
  
  try {
    // Simulate video analysis (replace with actual AI model)
    const analysis = {
      timestamp: new Date(),
      exerciseType: exerciseType,
      correctnessScore: 0.75 + Math.random() * 0.2,
      feedback: [
        "✅ Video analysis complete!",
        "📊 Form analysis: Good overall technique",
        "💡 Suggestion: Maintain consistent tempo",
        "🎯 Focus: Keep core engaged throughout"
      ],
      repCount: Math.floor(Math.random() * 15) + 5,
      riskLevel: 'low',
      duration: Math.floor(Math.random() * 120) + 60,
      summary: {
        totalReps: Math.floor(Math.random() * 15) + 5,
        goodReps: Math.floor(Math.random() * 12) + 3,
        badReps: Math.floor(Math.random() * 3),
        improvements: ["Work on depth", "Maintain consistent form"]
      }
    };
    
    // Save to Firestore
    if (req.body.userId) {
      const videoSessionRef = db.collection('videoSessions').doc();
      await videoSessionRef.set({
        id: videoSessionRef.id,
        userId: req.body.userId,
        exerciseType: exerciseType,
        analysis: analysis,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    res.json(analysis);
  } catch (error) {
    console.error('❌ Video analysis error:', error);
    res.status(500).json({ error: 'Video analysis failed' });
  }
});

// Enhanced pose analysis service with Firebase
class FirebasePoseAnalysisService {
  constructor() {
    this.activeSessions = new Map();
    this.exerciseMapping = {
      'quickstart': 'pushup',
      'quick start': 'pushup',
      'upper body strength': 'pushup',
      'hiit cardio': 'squat', 
      'lower body strength': 'squat',
      'yoga & flexibility': 'plank',
      'core & balance': 'plank',
      'active recovery': 'lunge',
      'push-ups': 'pushup',
      'pushups': 'pushup',
      'squats': 'squat',
      'lunges': 'lunge',
      'plank': 'plank'
    };
  }

  mapExerciseType(inputType) {
    if (!inputType) return 'pushup';
    const normalized = inputType.toLowerCase().trim();
    console.log(`🔍 Mapping exercise: "${inputType}" -> "${normalized}"`);
    const mapped = this.exerciseMapping[normalized] || 'pushup';
    console.log(`✅ Mapped to: ${mapped}`);
    return mapped;
  }

  initializeSession(socketId, sessionData) {
    const mappedExerciseType = this.mapExerciseType(sessionData.exerciseType);
    
    const session = {
      userId: sessionData.userId,
      exerciseType: mappedExerciseType,
      originalExerciseType: sessionData.exerciseType,
      startTime: new Date(),
      frames: [],
      repCount: 0,
      currentSet: 1,
      fatigueLevel: 0,
      lastState: 'up',
      stateCount: 0,
      repThreshold: 3,
      frameCount: 0
    };
    
    this.activeSessions.set(socketId, session);
    console.log(`🎬 Session started: ${sessionData.exerciseType} -> ${mappedExerciseType} for user: ${sessionData.userId}`);
    
    return this.getWelcomeFeedback(session);
  }

  async analyzeFrame(socketId, frameData) {
    const session = this.activeSessions.get(socketId);
    if (!session) {
      return { error: 'Session not found' };
    }

    session.frameCount++;
    
    // Simulate analysis (replace with actual pose detection)
    const analysis = this.simulateExerciseAnalysis(session);
    
    // Update session
    session.frames.push(analysis);
    
    // Update rep count if new rep detected
    if (analysis.isRepCompleted && analysis.repCount > session.repCount) {
      session.repCount = analysis.repCount;
      console.log(`🔢 ${session.exerciseType} - Rep ${session.repCount} completed!`);
    }

    return {
      ...analysis,
      originalExerciseType: session.originalExerciseType,
      sessionStats: {
        totalReps: session.repCount,
        currentSet: session.currentSet,
        duration: Math.floor((new Date() - session.startTime) / 1000),
        frameCount: session.frameCount
      }
    };
  }

  getWelcomeFeedback(session) {
    const exerciseGuides = {
      pushup: {
        title: "🏋️ Push-up Session Started!",
        instructions: [
          "Position yourself facing the camera",
          "Keep your body in a straight line", 
          "Lower your chest towards the ground",
          "Push back up to starting position",
          "We'll count your reps and check your form!"
        ]
      },
      squat: {
        title: "🦵 Squat Session Started!",
        instructions: [
          "Stand facing the camera with feet shoulder-width apart",
          "Lower your hips as if sitting in a chair",
          "Keep knees behind your toes",
          "Return to standing position",
          "We'll track your depth and form!"
        ]
      },
      lunge: {
        title: "🚶 Lunge Session Started!", 
        instructions: [
          "Stand facing the camera",
          "Step forward with one leg",
          "Lower your hips until both knees are bent at 90°",
          "Push back to starting position",
          "We'll monitor your balance and form!"
        ]
      },
      plank: {
        title: "🧘 Plank Session Started!",
        instructions: [
          "Position yourself facing the camera in plank position",
          "Keep your body in a straight line",
          "Engage your core muscles", 
          "Hold the position steadily",
          "We'll track your duration and form!"
        ]
      }
    };

    const guide = exerciseGuides[session.exerciseType] || exerciseGuides.pushup;
    
    return {
      timestamp: new Date(),
      exerciseType: session.exerciseType,
      originalExerciseType: session.originalExerciseType,
      correctnessScore: 0.8,
      feedback: [guide.title, ...guide.instructions],
      riskLevel: 'low',
      repCount: 0,
      isRepCompleted: false,
      isWelcome: true,
      sessionStats: {
        totalReps: 0,
        currentSet: 1,
        duration: 0,
        frameCount: 0
      }
    };
  }

  simulateExerciseAnalysis(session) {
    const frame = session.frameCount;
    const exercise = session.exerciseType;
    
    let currentState = 'up';
    let correctnessScore = 0.7 + Math.random() * 0.25;
    let feedback = [];
    let isRepCompleted = false;

    // Simulate rep completion every 20-40 frames
    if (frame > 5 && frame % (20 + Math.floor(Math.random() * 20)) === 0) {
      session.repCount++;
      isRepCompleted = true;
      currentState = 'up';
      correctnessScore = 0.8 + Math.random() * 0.15;
      feedback.push(`✅ Great! Completed rep ${session.repCount}`);
    } else if (frame % 15 < 8) {
      currentState = 'down';
      feedback.push(this.getFormFeedback(exercise, 'down'));
    } else {
      currentState = 'up';
      feedback.push(this.getFormFeedback(exercise, 'up'));
    }

    // Add occasional tips
    if (frame % 10 === 0) {
      feedback.push(this.getRandomTip(exercise));
    }

    return {
      timestamp: new Date(),
      exerciseType: exercise,
      originalExerciseType: session.originalExerciseType,
      correctnessScore: correctnessScore,
      feedback: feedback,
      riskLevel: Math.random() > 0.9 ? 'medium' : 'low',
      repCount: session.repCount,
      isRepCompleted: isRepCompleted,
      currentState: currentState
    };
  }

  getFormFeedback(exercise, state) {
    const feedbackMap = {
      pushup: {
        down: "📉 Lowering down - keep elbows at 45°",
        up: "📈 Pushing up - fully extend arms"
      },
      squat: {
        down: "📉 Squatting down - keep knees behind toes", 
        up: "📈 Standing up - squeeze those glutes!"
      },
      lunge: {
        down: "📉 Lunging down - front knee at 90°",
        up: "📈 Returning up - maintain balance"
      },
      plank: {
        down: "📉 Hold steady - don't let hips drop",
        up: "📈 Maintain straight line - engage core"
      }
    };
    
    return feedbackMap[exercise]?.[state] || "💪 Keep going! Maintain good form";
  }

  getRandomTip(exercise) {
    const tips = {
      pushup: [
        "💡 Tip: Keep your core tight throughout",
        "💡 Tip: Breathe out as you push up",
        "💡 Tip: Don't let your hips sag"
      ],
      squat: [
        "💡 Tip: Keep your chest up and back straight",
        "💡 Tip: Push through your heels, not toes",
        "💡 Tip: Go deep enough - aim for parallel"
      ],
      lunge: [
        "💡 Tip: Keep your torso upright throughout", 
        "💡 Tip: Step far enough for 90° angles",
        "💡 Tip: Engage your core for balance"
      ],
      plank: [
        "💡 Tip: Squeeze your glutes to prevent sag",
        "💡 Tip: Keep neck in line with spine",
        "💡 Tip: Breathe steadily throughout"
      ]
    };
    
    const exerciseTips = tips[exercise] || tips.pushup;
    return exerciseTips[Math.floor(Math.random() * exerciseTips.length)];
  }

  async finalizeSession(socketId, finalData) {
    const session = this.activeSessions.get(socketId);
    if (session) {
      console.log(`🏁 Session ended: ${session.exerciseType}, Reps: ${session.repCount}, Duration: ${Math.floor((new Date() - session.startTime) / 1000)}s`);
      
      // Save session to Firestore
      try {
        const sessionRef = db.collection('workoutSessions').doc();
        await sessionRef.set({
          id: sessionRef.id,
          userId: session.userId,
          startTime: session.startTime,
          endTime: new Date(),
          exerciseType: session.exerciseType,
          originalExerciseType: session.originalExerciseType,
          totalReps: session.repCount,
          duration: Math.floor((new Date() - session.startTime) / 1000),
          caloriesBurned: this.calculateCalories(session),
          averageCorrectness: this.calculateAverageCorrectness(session),
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Session saved to Firestore');
      } catch (error) {
        console.error('❌ Error saving session to Firestore:', error);
      }
      
      this.activeSessions.delete(socketId);
    }
  }

  calculateCalories(session) {
    const duration = (new Date() - session.startTime) / 1000 / 60;
    const baseCalories = {
      'pushup': 8, 'squat': 7, 'lunge': 6, 'plank': 3
    };
    return (baseCalories[session.exerciseType] || 5) * duration;
  }

  calculateAverageCorrectness(session) {
    if (session.frames.length === 0) return 0;
    return session.frames.reduce((sum, frame) => sum + frame.correctnessScore, 0) / session.frames.length;
  }

  cleanupSession(socketId) {
    this.activeSessions.delete(socketId);
  }
}

// Initialize service
const poseService = new FirebasePoseAnalysisService();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  socket.on('start_session', (data) => {
    console.log('🎬 Starting session:', data);
    try {
      const welcomeFeedback = poseService.initializeSession(socket.id, data);
      
      socket.emit('pose_feedback', welcomeFeedback);
      socket.emit('session_started', { 
        success: true, 
        exerciseType: data.exerciseType,
        mappedExerciseType: welcomeFeedback.exerciseType,
        message: `${data.exerciseType} session started successfully!` 
      });
      
      console.log(`✅ Session started: ${data.exerciseType} -> ${welcomeFeedback.exerciseType}`);
    } catch (error) {
      console.error('❌ Error starting session:', error);
      socket.emit('session_error', { error: error.message });
    }
  });

  socket.on('video_frame', async (frameData) => {
    try {
      const analysis = await poseService.analyzeFrame(socket.id, frameData);
      socket.emit('pose_feedback', analysis);
    } catch (error) {
      console.error('❌ Error analyzing frame:', error);
      socket.emit('analysis_error', { error: error.message });
    }
  });

  socket.on('end_session', (data) => {
    console.log('🏁 Ending session:', data);
    poseService.finalizeSession(socket.id, data);
    socket.emit('session_ended', { 
      success: true, 
      message: 'Workout completed successfully! 🎉' 
    });
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
    poseService.cleanupSession(socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 FitTronix Backend Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔥 Using Firebase Firestore & Realtime Database`);
  console.log(`🎯 Exercise mapping enabled`);
  console.log(`📹 Video analysis endpoint ready`);
});