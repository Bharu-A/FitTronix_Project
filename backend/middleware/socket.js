const { Server } = require('socket.io');
const PoseAnalysisService = require('../services/PoseAnalysisService');

let io;

const initialize = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle real-time pose analysis
    socket.on('analyze_pose', async (data) => {
      try {
        const { poseData, userId, sessionId } = data;
        
        const analysis = await PoseAnalysisService.analyzePose(
          poseData, 
          userId, 
          sessionId
        );

        socket.emit('analysis_result', {
          success: true,
          analysis,
          timestamp: new Date()
        });
      } catch (error) {
        socket.emit('analysis_error', {
          error: 'Pose analysis failed',
          details: error.message
        });
      }
    });

    // Handle exercise session updates
    socket.on('session_update', (data) => {
      // Broadcast to other clients in the same session
      socket.to(data.sessionId).emit('session_updated', data);
    });

    // Join session room
    socket.on('join_session', (sessionId) => {
      socket.join(sessionId);
    });

    // Leave session room
    socket.on('leave_session', (sessionId) => {
      socket.leave(sessionId);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = {
  initialize,
  getIO
};