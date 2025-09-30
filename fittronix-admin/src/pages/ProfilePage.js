// src/pages/ProfilePage.js
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  User, Mail, Phone, Calendar, MapPin, Dumbbell, 
  Edit, Save, X, Camera, Award, Activity, Upload, Trash2,
  Ruler, Scale, Heart, Target, Clock, Flame, TrendingUp,
  AlertCircle, CheckCircle, Zap, Cpu, Rocket
} from "lucide-react";
import { getAuth, onAuthStateChanged, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../firebase";
import { Link } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// Custom hook for Firebase user data management
function useFirebaseUser() {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true);
        setError(null);
        
        if (firebaseUser) {
          setUser(firebaseUser);
          
          // Fetch additional profile data from Firestore
          try {
            const docRef = doc(db, "users", firebaseUser.uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              const userData = docSnap.data();
              setProfileData(userData);
              
              // Fetch workout history
              await fetchWorkoutHistory(firebaseUser.uid);
              await calculateUserStats(firebaseUser.uid, userData);
            } else {
              // Create a comprehensive profile if it doesn't exist
              const comprehensiveProfile = {
                // Personal Information
                name: firebaseUser.displayName || "",
                email: firebaseUser.email || "",
                phone: "",
                dob: "",
                location: "",
                
                // Physical Attributes
                height: "",
                weight: "",
                gender: "",
                
                // Fitness Information
                fitnessGoal: "",
                activityLevel: "",
                targetWeight: "",
                currentFitnessLevel: "",
                preferredWorkoutTypes: [],
                workoutFrequency: "",
                
                // Health Information
                medicalConditions: "",
                injuries: "",
                allergies: "",
                emergencyContact: "",
                
                // Preferences
                dietaryPreferences: "",
                workoutTimePreference: "",
                fitnessMotivation: "",
                
                // System Fields
                profileCompleted: false,
                joined: new Date().toISOString().split('T')[0],
                lastUpdated: new Date().toISOString(),
                photoURL: firebaseUser.photoURL || ""
              };
              
              await setDoc(docRef, comprehensiveProfile);
              setProfileData(comprehensiveProfile);
            }
          } catch (firestoreError) {
            console.error("Error fetching Firestore data:", firestoreError);
            setError("Failed to load profile data");
          }
        } else {
          setUser(null);
          setProfileData(null);
          setWorkoutHistory([]);
          setStats(null);
        }
      } catch (err) {
        setError(err.message);
        console.error("Error in auth state change:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchWorkoutHistory = async (userId) => {
    try {
      const workoutsRef = collection(db, "users", userId, "workouts");
      const q = query(workoutsRef, orderBy("date", "desc"), limit(10));
      const querySnapshot = await getDocs(q);
      const workouts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWorkoutHistory(workouts);
    } catch (error) {
      console.error("Error fetching workout history:", error);
    }
  };

  const calculateUserStats = async (userId, userData) => {
    try {
      const workoutsRef = collection(db, "users", userId, "workouts");
      const q = query(workoutsRef, orderBy("date", "desc"), limit(30));
      const querySnapshot = await getDocs(q);
      const workouts = querySnapshot.docs.map(doc => doc.data());
      
      const totalWorkouts = workouts.length;
      const totalCalories = workouts.reduce((sum, workout) => sum + (workout.calories || 0), 0);
      const uniqueDays = new Set(workouts.map(w => w.date?.split('T')[0])).size;
      
      // Calculate progress percentage based on goal
      let progressPercentage = 0;
      if (userData.targetWeight && userData.weight) {
        const currentWeight = parseFloat(userData.weight);
        const targetWeight = parseFloat(userData.targetWeight);
        if (!isNaN(currentWeight) && !isNaN(targetWeight)) {
          const startWeight = currentWeight > targetWeight ? currentWeight + 10 : currentWeight - 10;
          progressPercentage = Math.round(((startWeight - currentWeight) / (startWeight - targetWeight)) * 100);
          progressPercentage = Math.max(0, Math.min(100, progressPercentage));
        }
      }

      setStats({
        totalWorkouts,
        totalCalories,
        activeDays: uniqueDays,
        progressPercentage,
        workoutHistory: workouts
      });
    } catch (error) {
      console.error("Error calculating stats:", error);
    }
  };

  const updateUserData = async (updatedData) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error("No user logged in");
      }

      // Update Firebase Auth profile if name or photo changed
      const authUpdates = {};
      if (updatedData.name && updatedData.name !== user.displayName) {
        authUpdates.displayName = updatedData.name;
      }
      if (updatedData.photoURL && updatedData.photoURL !== user.photoURL) {
        authUpdates.photoURL = updatedData.photoURL;
      }
      
      if (Object.keys(authUpdates).length > 0) {
        await updateProfile(user, authUpdates);
      }

      // Add timestamp for last update
      const dataWithTimestamp = {
        ...updatedData,
        lastUpdated: new Date().toISOString(),
        profileCompleted: true
      };

      // Update Firestore data
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, dataWithTimestamp);
      
      // Update local state
      setProfileData(prev => ({ ...prev, ...dataWithTimestamp }));
      setUser(prev => prev ? { ...prev, ...authUpdates } : null);
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error("Error updating user data:", err);
      return { success: false, error: err.message };
    }
  };

  return { 
    user: user ? { ...user, ...profileData } : null, 
    loading, 
    error, 
    updateUserData,
    workoutHistory,
    stats,
    refreshWorkouts: (userId) => fetchWorkoutHistory(userId)
  };
}

// Cyber Loading Skeleton Component
function ProfileSkeleton() {
  return (
    <div className="p-6 space-y-6 bg-gray-900 min-h-screen">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-800 rounded w-1/4"></div>
        <div className="h-4 bg-gray-800 rounded w-1/2"></div>
        
        <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-6 space-y-6">
          {/* Profile Header Skeleton */}
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-800 rounded-full"></div>
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-gray-800 rounded w-32"></div>
              <div className="h-4 bg-gray-800 rounded w-24"></div>
            </div>
          </div>
          
          {/* Form Fields Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-gray-800 rounded"></div>
                <div className="h-4 bg-gray-800 rounded w-16"></div>
                <div className="h-10 bg-gray-800 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Cyber Stats Charts Component
function StatsCharts({ stats }) {
  if (!stats) return null;

  const workoutData = stats.workoutHistory?.slice(0, 7).reverse().map((workout, index) => ({
    name: `Day ${index + 1}`,
    calories: workout.calories || 0,
    duration: workout.duration || 0
  })) || [];

  const weightData = [
    { date: 'Jan', weight: 75 },
    { date: 'Feb', weight: 73 },
    { date: 'Mar', weight: 71 },
    { date: 'Apr', weight: 70 },
    { date: 'May', weight: 69 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gray-800/50 backdrop-blur-md border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-4 text-cyan-300">CALORIES BURNED</h4>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={workoutData}>
                <defs>
                  <linearGradient id="caloriesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #6D28D9',
                    borderRadius: '8px',
                    color: '#E5E7EB'
                  }}
                />
                <Area type="monotone" dataKey="calories" stroke="#8884d8" fillOpacity={1} fill="url(#caloriesGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gray-800/50 backdrop-blur-md border border-cyan-500/30 hover:border-cyan-500/50 transition-all duration-300">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-4 text-purple-300">WEIGHT PROGRESS</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #06B6D4',
                    borderRadius: '8px',
                    color: '#E5E7EB'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#82ca9d" 
                  strokeWidth={3}
                  dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#22C55E' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Cyber Workout History Component
function WorkoutHistory({ workouts }) {
  if (!workouts || workouts.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8 text-gray-400"
      >
        <Activity className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>No workouts recorded yet</p>
        <p className="text-sm text-gray-500">Start working out to see your history here!</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {workouts.map((workout, index) => (
          <motion.div
            key={workout.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-gray-800/30 backdrop-blur-md border border-cyan-500/10 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 group">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold capitalize text-cyan-200 group-hover:text-cyan-100 transition-colors">
                      {workout.type || "Workout"}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {workout.date ? new Date(workout.date).toLocaleDateString() : "Unknown date"}
                    </p>
                    {workout.notes && (
                      <p className="text-sm text-gray-500 mt-1">{workout.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-4 text-sm">
                      {workout.duration && (
                        <span className="flex items-center text-purple-300">
                          <Clock size={14} className="mr-1" />
                          {workout.duration}min
                        </span>
                      )}
                      {workout.calories && (
                        <span className="flex items-center text-orange-400">
                          <Flame size={14} className="mr-1" />
                          {workout.calories} cal
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Cyber Input Component
const CyberInput = ({ value, onChange, placeholder, type = "text", disabled = false, className = "" }) => (
  <Input
    value={value}
    onChange={onChange}
    type={type}
    placeholder={placeholder}
    disabled={disabled}
    className={`bg-gray-800/50 border border-cyan-500/20 text-cyan-100 placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 ${className}`}
  />
);

// Cyber Select Component
const CyberSelect = ({ value, onChange, children, className = "" }) => (
  <select
    value={value}
    onChange={onChange}
    className={`bg-gray-800/50 border border-cyan-500/20 text-cyan-100 rounded-lg p-3 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 ${className}`}
  >
    {children}
  </select>
);

// Cyber TextArea Component
const CyberTextArea = ({ value, onChange, placeholder, rows = 3, className = "" }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className={`bg-gray-800/50 border border-cyan-500/20 text-cyan-100 rounded-lg p-3 placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 w-full ${className}`}
  />
);

function ProfilePage() {
  const { user, loading, error, updateUserData, workoutHistory, stats } = useFirebaseUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saveStatus, setSaveStatus] = useState({});
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const fileInputRef = useRef(null);

  // Initialize edit form when user data is loaded
  useEffect(() => {
    if (user && !isEditing) {
      setEditForm({
        name: user.displayName || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        dob: user.dob || "",
        location: user.location || "",
        height: user.height || "",
        weight: user.weight || "",
        gender: user.gender || "",
        fitnessGoal: user.fitnessGoal || "",
        activityLevel: user.activityLevel || "",
        targetWeight: user.targetWeight || "",
        currentFitnessLevel: user.currentFitnessLevel || "",
        workoutFrequency: user.workoutFrequency || "",
        medicalConditions: user.medicalConditions || "",
        injuries: user.injuries || "",
        allergies: user.allergies || "",
        emergencyContact: user.emergencyContact || "",
        dietaryPreferences: user.dietaryPreferences || "",
        workoutTimePreference: user.workoutTimePreference || "",
        fitnessMotivation: user.fitnessMotivation || "",
        photoURL: user.photoURL || ""
      });
    }
  }, [user, isEditing]);

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaveStatus({ loading: true });
    const result = await updateUserData(editForm);
    setSaveStatus(result);
    
    if (result.success) {
      setIsEditing(false);
      setTimeout(() => setSaveStatus({}), 3000);
    }
  };

  const handleCancel = () => {
    if (user) {
      setEditForm({
        name: user.displayName || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        dob: user.dob || "",
        location: user.location || "",
        height: user.height || "",
        weight: user.weight || "",
        gender: user.gender || "",
        fitnessGoal: user.fitnessGoal || "",
        activityLevel: user.activityLevel || "",
        targetWeight: user.targetWeight || "",
        currentFitnessLevel: user.currentFitnessLevel || "",
        workoutFrequency: user.workoutFrequency || "",
        medicalConditions: user.medicalConditions || "",
        injuries: user.injuries || "",
        allergies: user.allergies || "",
        emergencyContact: user.emergencyContact || "",
        dietaryPreferences: user.dietaryPreferences || "",
        workoutTimePreference: user.workoutTimePreference || "",
        fitnessMotivation: user.fitnessMotivation || "",
        photoURL: user.photoURL || ""
      });
    }
    setIsEditing(false);
    setSaveStatus({});
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.match('image.*')) {
      setSaveStatus({ error: "Please select an image file" });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setSaveStatus({ error: "Image size must be less than 5MB" });
      return;
    }
    
    setUploading(true);
    
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error("No user logged in");
      }
      
      // Delete old photo if it exists and is from Firebase Storage
      if (user.photoURL && user.photoURL.includes('firebasestorage.googleapis.com')) {
        try {
          const oldPhotoRef = ref(storage, user.photoURL);
          await deleteObject(oldPhotoRef);
        } catch (error) {
          console.warn("Could not delete old photo:", error);
        }
      }
      
      // Upload new photo
      const storageRef = ref(storage, `profile-photos/${currentUser.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update user data
      const result = await updateUserData({ photoURL: downloadURL });
      if (result.success) {
        setEditForm(prev => ({ ...prev, photoURL: downloadURL }));
        setSaveStatus({ success: "Profile photo updated successfully!" });
        setTimeout(() => setSaveStatus({}), 3000);
      } else {
        setSaveStatus(result);
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      setSaveStatus({ error: err.message });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async () => {
    try {
      if (user.photoURL && user.photoURL.includes('firebasestorage.googleapis.com')) {
        const photoRef = ref(storage, user.photoURL);
        await deleteObject(photoRef);
      }
      
      const result = await updateUserData({ photoURL: "" });
      if (result.success) {
        setEditForm(prev => ({ ...prev, photoURL: "" }));
        setSaveStatus({ success: "Profile photo removed successfully!" });
        setTimeout(() => setSaveStatus({}), 3000);
      } else {
        setSaveStatus(result);
      }
    } catch (err) {
      console.error("Error removing photo:", err);
      setSaveStatus({ error: err.message });
    }
  };

  // Render loading state
  if (loading) {
    return <ProfileSkeleton />;
  }

  // Render error state
  if (error) {
    return (
      <div className="p-6 space-y-6 bg-gray-900 min-h-screen">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-900/90 border border-red-500 text-red-200 px-4 py-3 rounded-lg backdrop-blur-md"
        >
          <p>Error loading profile: {error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-lg shadow-red-500/30"
          >
            Try Again
          </Button>
        </motion.div>
      </div>
    );
  }

  // Render no user state
  if (!user) {
    return (
      <div className="p-6 space-y-6 bg-gray-900 min-h-screen">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-900/90 border border-yellow-500 text-yellow-200 px-4 py-3 rounded-lg backdrop-blur-md"
        >
          <p>Please log in to view your profile.</p>
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors">
            Go to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 pt-[50px] space-y-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
            PROFILE MATRIX
          </h1>
          <p className="text-gray-400">Manage your personal details & fitness goals</p>
        </div>
        {!isEditing ? (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300"
            >
              <Edit size={16} />
              <span>Edit Profile</span>
            </Button>
          </motion.div>
        ) : (
          <div className="flex space-x-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={handleSave}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300"
                disabled={uploading || saveStatus.loading}
              >
                {uploading || saveStatus.loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save size={16} />
                )}
                <span>{uploading || saveStatus.loading ? "SYNCING..." : "SAVE DATA"}</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={handleCancel}
                variant="outline"
                className="flex items-center space-x-2 border-pink-500/50 text-pink-400 hover:bg-pink-500/10 hover:border-pink-500 hover:text-pink-300 transition-all duration-300"
                disabled={uploading || saveStatus.loading}
              >
                <X size={16} />
                <span>CANCEL</span>
              </Button>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Status Messages */}
      <AnimatePresence>
        {saveStatus.error && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="bg-red-900/90 border border-red-500 text-red-200 px-4 py-3 rounded-lg backdrop-blur-md flex items-center"
          >
            <AlertCircle size={16} className="mr-2" />
            Error: {saveStatus.error}
          </motion.div>
        )}

        {saveStatus.success && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="bg-green-900/90 border border-green-500 text-green-200 px-4 py-3 rounded-lg backdrop-blur-md flex items-center"
          >
            <CheckCircle size={16} className="mr-2" />
            {typeof saveStatus.success === 'string' ? saveStatus.success : "Profile updated successfully!"}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="rounded-2xl bg-gray-800/50 backdrop-blur-md border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-500">
          <CardContent className="p-6">
            {/* Profile Header with Photo */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative">
                {editForm.photoURL ? (
                  <motion.img 
                    whileHover={{ scale: 1.05 }}
                    src={editForm.photoURL} 
                    alt={editForm.name || "User"} 
                    className="w-20 h-20 rounded-full object-cover border-2 border-cyan-500 shadow-lg shadow-cyan-500/30"
                  />
                ) : (
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="w-20 h-20 bg-gradient-to-br from-cyan-600 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-cyan-500/30"
                  >
                    {editForm.name ? editForm.name.charAt(0).toUpperCase() : "U"}
                  </motion.div>
                )}
                
                {isEditing && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -bottom-2 -right-2 flex space-x-1"
                  >
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gradient-to-r from-cyan-600 to-purple-600 text-white p-2 rounded-full shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300"
                      disabled={uploading}
                    >
                      {uploading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Camera size={16} />
                      )}
                    </motion.button>
                    
                    {editForm.photoURL && (
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleRemovePhoto}
                        className="bg-gradient-to-r from-pink-600 to-red-600 text-white p-2 rounded-full shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all duration-300"
                        disabled={uploading}
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    )}
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                    />
                  </motion.div>
                )}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <CyberInput
                    value={editForm.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Your Name"
                    className="text-2xl font-semibold"
                  />
                ) : (
                  <>
                    <h2 className="text-2xl font-semibold text-cyan-100">{user.displayName || user.name || "Unknown User"}</h2>
                    <p className="text-cyan-400 flex items-center">
                      <Award size={16} className="mr-1" />
                      {user.currentFitnessLevel || "Fitness Enthusiast"}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Tabs for different sections */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 backdrop-blur-md border border-cyan-500/20 p-1 rounded-lg">
                <TabsTrigger value="personal" className="text-cyan-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  <User size={16} className="mr-2" />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="fitness" className="text-purple-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                  <Dumbbell size={16} className="mr-2" />
                  Fitness
                </TabsTrigger>
                <TabsTrigger value="health" className="text-pink-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-red-600 data-[state=active]:text-white">
                  <Heart size={16} className="mr-2" />
                  Health
                </TabsTrigger>
                <TabsTrigger value="stats" className="text-green-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
                  <Activity size={16} className="mr-2" />
                  Stats
                </TabsTrigger>
              </TabsList>

              {/* Personal Information Tab */}
              <TabsContent value="personal" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: Mail, label: "Email", field: "email", type: "email", disabled: true, color: "text-cyan-400" },
                    { icon: Phone, label: "Phone", field: "phone", type: "tel", color: "text-purple-400" },
                    { icon: Calendar, label: "Date of Birth", field: "dob", type: "date", color: "text-pink-400" },
                    { icon: MapPin, label: "Location", field: "location", type: "text", color: "text-green-400" },
                    { icon: User, label: "Gender", field: "gender", type: "select", color: "text-cyan-400" },
                    { icon: Ruler, label: "Height", field: "height", type: "text", color: "text-purple-400" },
                    { icon: Scale, label: "Weight", field: "weight", type: "text", color: "text-pink-400" },
                    { icon: Target, label: "Target Weight", field: "targetWeight", type: "text", color: "text-green-400" },
                  ].map(({ icon: Icon, label, field, type, disabled = false, color }) => (
                    <motion.div 
                      key={field}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/30 border border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300"
                    >
                      <Icon className={`${color} flex-shrink-0`} />
                      <span className="text-gray-400 min-w-20">{label}:</span>
                      {isEditing ? (
                        type === "select" ? (
                          <CyberSelect
                            value={editForm[field]}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            className="flex-1"
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer-not-to-say">Prefer not to say</option>
                          </CyberSelect>
                        ) : (
                          <CyberInput
                            type={type}
                            value={editForm[field]}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            placeholder={label}
                            disabled={disabled}
                            className="flex-1"
                          />
                        )
                      ) : (
                        <span className="flex-1 text-cyan-100">{user[field] || "Not provided"}</span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* Fitness Information Tab */}
              <TabsContent value="fitness" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Primary Fitness Goal", field: "fitnessGoal", options: ["weight-loss", "muscle-gain", "endurance", "maintenance", "rehabilitation"] },
                    { label: "Activity Level", field: "activityLevel", options: ["sedentary", "light", "moderate", "very", "extreme"] },
                    { label: "Workout Frequency", field: "workoutFrequency", options: ["1-2", "3-4", "5-6", "daily"] },
                    { label: "Preferred Workout Time", field: "workoutTimePreference", options: ["morning", "afternoon", "evening", "flexible"] },
                  ].map(({ label, field, options }) => (
                    <motion.div 
                      key={field}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3 rounded-lg bg-gray-800/30 border border-purple-500/10 hover:border-purple-500/30 transition-all duration-300"
                    >
                      <label className="block text-sm font-medium text-purple-300 mb-2">{label}</label>
                      {isEditing ? (
                        <CyberSelect
                          value={editForm[field]}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          className="w-full"
                        >
                          <option value="">Select {label}</option>
                          {options.map(option => (
                            <option key={option} value={option}>
                              {option.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </option>
                          ))}
                        </CyberSelect>
                      ) : (
                        <p className="text-cyan-100 capitalize">
                          {user[field]?.replace('-', ' ') || "Not set"}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 rounded-lg bg-gray-800/30 border border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300"
                >
                  <label className="block text-sm font-medium text-cyan-300 mb-2">Fitness Motivation</label>
                  {isEditing ? (
                    <CyberTextArea
                      value={editForm.fitnessMotivation}
                      onChange={(e) => handleInputChange("fitnessMotivation", e.target.value)}
                      placeholder="What motivates you to stay fit?"
                      rows="3"
                    />
                  ) : (
                    <p className="text-cyan-100">{user.fitnessMotivation || "Not provided"}</p>
                  )}
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 rounded-lg bg-gray-800/30 border border-purple-500/10 hover:border-purple-500/30 transition-all duration-300"
                >
                  <label className="block text-sm font-medium text-purple-300 mb-2">Dietary Preferences</label>
                  {isEditing ? (
                    <CyberTextArea
                      value={editForm.dietaryPreferences}
                      onChange={(e) => handleInputChange("dietaryPreferences", e.target.value)}
                      placeholder="Any dietary preferences or restrictions?"
                      rows="2"
                    />
                  ) : (
                    <p className="text-cyan-100">{user.dietaryPreferences || "Not provided"}</p>
                  )}
                </motion.div>
              </TabsContent>

              {/* Health Information Tab */}
              <TabsContent value="health" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Medical Conditions", field: "medicalConditions", rows: 3 },
                    { label: "Injuries", field: "injuries", rows: 3 },
                    { label: "Allergies", field: "allergies", rows: 3 },
                    { label: "Emergency Contact", field: "emergencyContact", rows: 1 },
                  ].map(({ label, field, rows }) => (
                    <motion.div 
                      key={field}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3 rounded-lg bg-gray-800/30 border border-pink-500/10 hover:border-pink-500/30 transition-all duration-300"
                    >
                      <label className="block text-sm font-medium text-pink-300 mb-2">{label}</label>
                      {isEditing ? (
                        rows > 1 ? (
                          <CyberTextArea
                            value={editForm[field]}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            placeholder={label}
                            rows={rows}
                          />
                        ) : (
                          <CyberInput
                            value={editForm[field]}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            placeholder={label}
                          />
                        )
                      ) : (
                        <p className="text-cyan-100">{user[field] || "None reported"}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* Stats & Progress Tab */}
              <TabsContent value="stats" className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { value: stats?.totalWorkouts || 0, label: "Total Workouts", color: "from-cyan-600 to-blue-600", icon: Zap },
                    { value: `${stats?.activeDays || 0}/7`, label: "Active Days", color: "from-purple-600 to-pink-600", icon: Activity },
                    { value: stats?.totalCalories ? Math.round(stats.totalCalories).toLocaleString() : 0, label: "Calories Burned", color: "from-pink-600 to-red-600", icon: Flame },
                    { value: `${stats?.progressPercentage || 0}%`, label: "Progress", color: "from-green-600 to-cyan-600", icon: TrendingUp },
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className={`bg-gradient-to-br ${stat.color} rounded-xl p-4 text-center shadow-lg backdrop-blur-md border border-white/10`}
                    >
                      <stat.icon className="w-8 h-8 text-white mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-sm text-white/80">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Charts */}
                <StatsCharts stats={stats} />

                {/* Workout History */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-cyan-300">
                    <Rocket className="mr-2 text-cyan-400" />
                    RECENT WORKOUTS
                  </h3>
                  <WorkoutHistory workouts={workoutHistory} />
                </div>
              </TabsContent>
            </Tabs>

            {/* System Information */}
            <div className="flex justify-between items-center text-sm text-gray-400 mt-6 pt-4 border-t border-cyan-500/20">
              <p>Member since {user.joined ? new Date(user.joined).toLocaleDateString() : "January 2025"}</p>
              {user.lastUpdated && (
                <p>Last updated: {new Date(user.lastUpdated).toLocaleDateString()}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default ProfilePage;