import { 
  collection, 
  doc, 
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

export const useWorkoutSession = (user, selectedExercise, speak) => {
  const startSession = async () => {
    if (!user) {
      throw new Error('User must be logged in to start a session');
    }

    try {
      // Create workout session in Firestore
      const sessionRef = doc(collection(db, 'workoutSessions'));
      const sessionData = {
        id: sessionRef.id,
        userId: user.uid,
        startTime: serverTimestamp(),
        exerciseType: selectedExercise,
        status: 'active',
        sets: 1,
        aiEnabled: true,
        membership: user.membership?.plan || 'free'
      };
      
      await setDoc(sessionRef, sessionData);
      console.log('✅ Workout session started:', sessionRef.id);
      
      return sessionRef.id;
    } catch (error) {
      console.error('❌ Error starting workout session:', error);
      throw error;
    }
  };

  const endSession = async (sessionData) => {
    if (!user) return;

    try {
      // Find active session
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
          totalReps: sessionData?.reps || 0,
          caloriesBurned: sessionData?.calories || 0,
          averageCorrectness: sessionData?.accuracy || 0,
          duration: sessionData?.duration || 0,
          guidanceMessages: sessionData?.guidanceMessages || [],
          weakAreas: sessionData?.weakAreas || []
        });

        console.log('✅ Workout session completed');
        
        // Voice feedback
        if (speak && sessionData) {
          speak(`Session completed! You did ${sessionData.reps} reps with ${sessionData.accuracy}% accuracy.`);
        }
      }
    } catch (error) {
      console.error('❌ Error ending workout session:', error);
      throw error;
    }
  };

  const updateSessionProgress = async (progressData) => {
    if (!user) return;

    try {
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
          lastUpdate: serverTimestamp(),
          currentReps: progressData.reps,
          currentCalories: progressData.calories,
          currentDuration: progressData.duration
        });
      }
    } catch (error) {
      console.error('❌ Error updating session progress:', error);
    }
  };

  return {
    startSession,
    endSession,
    updateSessionProgress
  };
};