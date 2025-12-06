import { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  setDoc, // ✅ ADD THIS IMPORT
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export const useFirestoreData = (user) => {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch data with caching
  const fetchWithCache = async (key, fetchFunction) => {
    const cached = localStorage.getItem(`fitTronix_${key}`);
    const now = Date.now();

    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (now - timestamp < CACHE_DURATION) {
        console.log(`📦 Using cached ${key}`);
        return data;
      }
    }

    console.log(`🔄 Fetching fresh ${key}`);
    const data = await fetchFunction();
    
    // Cache the data
    localStorage.setItem(`fitTronix_${key}`, JSON.stringify({
      data,
      timestamp: now
    }));

    return data;
  };

  // Fetch all data in parallel
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError('');

        const [
          categoriesData,
          exercisesData,
          plansData,
          quotesData
        ] = await Promise.all([
          fetchWithCache('workoutCategories', async () => {
            const snapshot = await getDocs(collection(db, 'workoutCategories'));
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          }),
          fetchWithCache('exercises', async () => {
            const snapshot = await getDocs(collection(db, 'exercises'));
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          }),
          fetchWithCache('weeklyPlans', async () => {
            const snapshot = await getDocs(collection(db, 'weeklyPlans'));
            if (!snapshot.empty) {
              const planData = snapshot.docs[0].data();
              return planData.days || generateDefaultWeeklyPlan();
            }
            return generateDefaultWeeklyPlan();
          }),
          fetchWithCache('motivationalQuotes', async () => {
            const snapshot = await getDocs(collection(db, 'motivationalQuotes'));
            return snapshot.docs.map(doc => 
              doc.data().text || doc.data().quote || "Stay motivated and keep pushing!"
            );
          })
        ]);

        setWorkoutCategories(categoriesData);
        setExercises(exercisesData);
        setWeeklyPlan(plansData);
        setMotivationalQuotes(quotesData);

      } catch (err) {
        console.error('❌ Error fetching data:', err);
        setError('Failed to load workout data. Using cached data if available.');
        
        // Try to use cached data as fallback
        try {
          const cachedCategories = localStorage.getItem('fitTronix_workoutCategories');
          if (cachedCategories) {
            const { data } = JSON.parse(cachedCategories);
            setWorkoutCategories(data);
          }
        } catch (cacheError) {
          console.error('Cache fallback failed:', cacheError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Fetch user progress (real-time)
  useEffect(() => {
    if (!user) {
      setProgressData({ workoutsCompleted: 0, streak: 0, caloriesBurned: 0, lastWorkoutDate: null });
      return;
    }

    const fetchUserProgress = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const unsub = onSnapshot(userDocRef, (snap) => {
          if (snap.exists()) {
            const userData = snap.data();
            setProgressData({
              workoutsCompleted: userData.workoutsCompleted || 0,
              streak: userData.streak || 0,
              caloriesBurned: userData.caloriesBurned || 0,
              lastWorkoutDate: userData.lastWorkoutDate || null
            });

            // Cache user progress locally
            localStorage.setItem(`fitTronix_userProgress_${user.uid}`, JSON.stringify({
              data: userData,
              timestamp: Date.now()
            }));
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
            setDoc(userDocRef, defaultProgress);
            setProgressData(defaultProgress);
          }
        });

        return unsub;
      } catch (err) {
        console.error('❌ Error fetching user progress:', err);
        
        // Try to use cached progress
        try {
          const cachedProgress = localStorage.getItem(`fitTronix_userProgress_${user.uid}`);
          if (cachedProgress) {
            const { data } = JSON.parse(cachedProgress);
            setProgressData({
              workoutsCompleted: data.workoutsCompleted || 0,
              streak: data.streak || 0,
              caloriesBurned: data.caloriesBurned || 0,
              lastWorkoutDate: data.lastWorkoutDate || null
            });
          }
        } catch (cacheError) {
          console.error('Progress cache fallback failed:', cacheError);
        }
      }
    };

    fetchUserProgress();
  }, [user]);

  // Real-time motivational quotes updates
  useEffect(() => {
    const quotesQuery = query(
      collection(db, 'motivationalQuotes'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsub = onSnapshot(quotesQuery, (snapshot) => {
      const newQuotes = snapshot.docs.map(doc => 
        doc.data().text || doc.data().quote || "Stay motivated and keep pushing!"
      );
      
      if (newQuotes.length > 0) {
        setMotivationalQuotes(newQuotes);
        
        // Update cache
        localStorage.setItem('fitTronix_motivationalQuotes', JSON.stringify({
          data: newQuotes,
          timestamp: Date.now()
        }));
      }
    });

    return () => unsub();
  }, []);

  // Update user progress
  const updateProgress = async (newData) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        ...newData,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Error updating progress:', error);
      throw error;
    }
  };

  // Clear cache (useful for development)
  const clearCache = () => {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('fitTronix_'));
    keys.forEach(key => localStorage.removeItem(key));
    console.log('🧹 Cache cleared');
  };

  // Generate default weekly plan
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

  return {
    workoutCategories,
    exercises,
    weeklyPlan,
    motivationalQuotes,
    progressData,
    loading,
    error,
    updateProgress,
    clearCache
  };
};