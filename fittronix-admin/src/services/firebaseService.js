// services/firebaseService.js
import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  serverTimestamp,
  increment 
} from 'firebase/firestore';

export const saveWorkoutSession = async (sessionData) => {
  try {
    const sessionsRef = collection(db, 'workoutSessions');
    const docRef = await addDoc(sessionsRef, {
      ...sessionData,
      timestamp: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving workout session:', error);
    throw error;
  }
};

export const updateUserProgress = async (userId, sessionData) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const currentStreak = calculateCurrentStreak(userData.lastWorkout);
      
      await updateDoc(userRef, {
        totalWorkouts: increment(1),
        totalCalories: increment(sessionData.calories),
        currentStreak,
        lastWorkout: serverTimestamp(),
        [`exerciseStats.${sessionData.exerciseType}.totalReps`]: increment(sessionData.reps),
        [`exerciseStats.${sessionData.exerciseType}.totalSessions`]: increment(1),
        [`exerciseStats.${sessionData.exerciseType}.averageAccuracy`]: calculateAverageAccuracy(
          userData.exerciseStats?.[sessionData.exerciseType]?.averageAccuracy,
          sessionData.accuracy,
          userData.exerciseStats?.[sessionData.exerciseType]?.totalSessions || 0
        )
      });
    }
  } catch (error) {
    console.error('Error updating user progress:', error);
    throw error;
  }
};

const calculateCurrentStreak = (lastWorkoutTimestamp) => {
  if (!lastWorkoutTimestamp) return 1;
  
  const lastWorkout = lastWorkoutTimestamp.toDate();
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if last workout was yesterday or today
  if (lastWorkout.toDateString() === yesterday.toDateString() || 
      lastWorkout.toDateString() === today.toDateString()) {
    return increment(1);
  }
  
  return 1;
};

const calculateAverageAccuracy = (currentAverage, newAccuracy, sessionCount) => {
  if (!currentAverage) return newAccuracy;
  return Math.round((currentAverage * sessionCount + newAccuracy) / (sessionCount + 1));
};

// Admin dashboard data aggregation
export const getAdminDashboardData = async () => {
  try {
    const sessionsRef = collection(db, 'workoutSessions');
    const usersRef = collection(db, 'users');
    
    // Get all sessions from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // This would be implemented with proper queries
    // For now, return mock structure
    return {
      totalUsers: 0,
      totalWorkouts: 0,
      averageAccuracy: 0,
      popularExercises: [],
      userLeaderboard: []
    };
  } catch (error) {
    console.error('Error getting admin dashboard data:', error);
    throw error;
  }
};