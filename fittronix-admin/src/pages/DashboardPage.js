// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Activity, Target, Salad, Smile, Settings, 
  TrendingUp, Calendar, Clock, Award, Heart,
  ChevronRight, Users, BarChart3, Plus, Zap,
  Battery, Cpu, Network, Dumbbell, HeartPulse,
  Camera, Brain, Smartphone, Gauge, CheckCircle
} from "lucide-react";
import { 
  getAuth, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  orderBy,
  getDocs, limit  
} from "firebase/firestore";
import { 
  getFunctions, 
  httpsCallable 
} from "firebase/functions";

function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [upcomingWorkouts, setUpcomingWorkouts] = useState([]);
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [fitnessMetrics, setFitnessMetrics] = useState([]);
  const [systemStatus, setSystemStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Firebase instances
  const auth = getAuth();
  const db = getFirestore();
  const functions = getFunctions();

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Firebase Authentication listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await initializeDashboardData(currentUser.uid);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Initialize all dashboard data with real-time listeners
  const initializeDashboardData = async (userId) => {
    try {
      setLoading(true);
      
      // Set up real-time listeners for user data
      const userDocRef = doc(db, "users", userId);
      
      // Real-time listener for user profile data
      const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          setUserData(doc.data());
        }
      });

      // Real-time listener for analytics data (computed by Cloud Functions)
      const analyticsDocRef = doc(db, "analytics", userId);
      const unsubscribeAnalytics = onSnapshot(analyticsDocRef, (doc) => {
        if (doc.exists()) {
          const analytics = doc.data();
          setAnalyticsData(analytics);
          
          // Update fitness metrics with real-time analytics
          setFitnessMetrics([
            { 
              label: "Form Accuracy", 
              value: analytics.formAccuracy || 0, 
              max: 100, 
              icon: CheckCircle, 
              color: "green", 
              desc: "Posture detection score" 
            },
            { 
              label: "Workout Intensity", 
              value: analytics.workoutIntensity || 0, 
              max: 100, 
              icon: Gauge, 
              color: "orange", 
              desc: "Current session effort" 
            },
            { 
              label: "Recovery Status", 
              value: analytics.recoveryStatus || 0, 
              max: 100, 
              icon: HeartPulse, 
              color: "blue", 
              desc: "Muscle recovery level" 
            },
            { 
              label: "AI Analysis", 
              value: analytics.aiAnalysisScore || 0, 
              max: 100, 
              icon: Brain, 
              color: "purple", 
              desc: "Real-time feedback accuracy" 
            }
          ]);

          // Update weekly progress with analytics data
          if (analytics.weeklySummary) {
            setWeeklyProgress(analytics.weeklySummary);
          }
        }
      });

      // Fetch upcoming workouts with real-time updates
      const workoutsQuery = query(
        collection(db, "workouts"),
        where("userId", "==", userId),
        where("scheduledDate", ">=", new Date()),
        orderBy("scheduledDate", "asc")
      );
      
      const unsubscribeWorkouts = onSnapshot(workoutsQuery, (snapshot) => {
        const workouts = [];
        snapshot.forEach((doc) => {
          workouts.push({ id: doc.id, ...doc.data() });
        });
        setUpcomingWorkouts(workouts);
      });

      // Fetch recent achievements with real-time updates
      const achievementsQuery = query(
        collection(db, "achievements"),
        where("userId", "==", userId),
        orderBy("achievedAt", "desc"),
        limit(5)
      );
      
      const unsubscribeAchievements = onSnapshot(achievementsQuery, (snapshot) => {
        const achievements = [];
        snapshot.forEach((doc) => {
          achievements.push({ id: doc.id, ...doc.data() });
        });
        setRecentAchievements(achievements);
      });

      // System status from Firebase services
      const updateSystemStatus = () => {
        setSystemStatus([
          { 
            feature: "Camera Tracking", 
            status: "Active", 
            icon: Camera, 
            color: "green",
            lastUpdate: new Date() 
          },
          { 
            feature: "Pose Detection", 
            status: "Optimized", 
            icon: Brain, 
            color: "blue",
            accuracy: analyticsData?.poseDetectionAccuracy || 95 
          },
          { 
            feature: "AI Feedback", 
            status: "Live", 
            icon: Smartphone, 
            color: "purple",
            responseTime: "120ms" 
          },
          { 
            feature: "Data Sync", 
            status: "Syncing", 
            icon: Network, 
            color: "orange",
            lastSync: new Date() 
          }
        ]);
      };

      // Call Cloud Functions to compute analytics
      await refreshAnalytics(userId);

      setLoading(false);

      // Cleanup function for all listeners
      return () => {
        unsubscribeUser();
        unsubscribeAnalytics();
        unsubscribeWorkouts();
        unsubscribeAchievements();
      };

    } catch (err) {
      console.error("Error initializing dashboard:", err);
      setError("Failed to load dashboard data");
      setLoading(false);
    }
  };

  // Call Cloud Functions to refresh analytics
  const refreshAnalytics = async (userId) => {
    try {
      const computeAnalytics = httpsCallable(functions, 'computeUserAnalytics');
      const result = await computeAnalytics({ userId });
      
      // Analytics will be automatically updated via Firestore listener
      console.log("Analytics computation triggered:", result.data);
    } catch (error) {
      console.error("Error calling analytics function:", error);
    }
  };

  // Get workout icon based on type
  const getWorkoutIcon = (type) => {
    switch(type) {
      case 'strength': return <Dumbbell className="h-4 w-4" />;
      case 'cardio': return <Activity className="h-4 w-4" />;
      case 'core': return <Activity className="h-4 w-4" />;
      case 'hiit': return <Zap className="h-4 w-4" />;
      case 'yoga': return <Heart className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  // Get achievement icon based on type
  const getAchievementIcon = (type) => {
    const icons = {
      form: "🎯",
      streak: "🔥",
      performance: "⚡",
      consistency: "📅",
      milestone: "🏆",
      challenge: "💪"
    };
    return icons[type] || "🏅";
  };

  // Time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "ENERGIZE";
    if (hour < 17) return "PERFORM";
    return "RECOVER";
  };

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-green-400 text-lg">Loading your fitness dashboard...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-red-900/20 rounded-2xl border border-red-500/30"
        >
          <p className="text-red-400 text-xl mb-4">⚠️ {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300"
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  // No user state
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 bg-blue-900/20 rounded-2xl border border-blue-500/30"
        >
          <p className="text-blue-400 text-xl mb-4">Please sign in to access your dashboard</p>
          <Link 
            to="/login"
            className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 inline-block"
          >
            Sign In
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      {/* Enhanced Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-green-900/20 via-gray-900 to-blue-600/10 pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-gray-900 to-green-900/20 pointer-events-none"></div>
      
      {/* Main Content */}
      <motion.div 
        className="relative z-10 max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.header className="mb-8 pt-4" variants={itemVariants}>
          <div className="pt-[65px] flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <motion.h1 
                className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                FITTRONIX {getTimeBasedGreeting()}, {userData?.name?.toUpperCase() || "ATHLETE"}
              </motion.h1>
              <p className="text-blue-300 mt-2 text-lg">
                AI-Powered Fitness System | {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center mt-4 lg:mt-0 space-x-4">
              <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-3 border border-green-500/30 shadow-lg shadow-green-500/20">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-green-400 mr-2" />
                  <span className="text-green-300 font-medium">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-3 border border-purple-500/30 shadow-lg shadow-purple-500/20">
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-purple-400 mr-2" />
                  <span className="text-purple-300 font-medium">
                    {analyticsData?.currentStreak || 0} DAY STREAK
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Fitness Metrics Grid */}
        <motion.section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" variants={containerVariants}>
          {fitnessMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              className="bg-gray-800/30 backdrop-blur-md rounded-2xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <metric.icon className={`h-8 w-8 text-${metric.color}-400`} />
                <div className="text-right">
                  <motion.p 
                    className="text-2xl font-bold text-white"
                    key={metric.value}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    {metric.value}%
                  </motion.p>
                  <p className="text-sm text-gray-400">{metric.label}</p>
                </div>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <motion.div 
                  className={`h-2 rounded-full bg-gradient-to-r from-${metric.color}-500 to-${metric.color}-600 shadow-lg shadow-${metric.color}-500/30`}
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                ></motion.div>
              </div>
              <p className="text-xs text-gray-400 mt-2">{metric.desc}</p>
            </motion.div>
          ))}
        </motion.section>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - 2/3 width */}
          <div className="xl:col-span-2 space-y-8">
            {/* Weekly Performance Chart */}
            <motion.div 
              className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-green-500/30 shadow-lg shadow-green-500/10"
              variants={itemVariants}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  WEEKLY PERFORMANCE ANALYTICS
                </h2>
                <button 
                  onClick={() => refreshAnalytics(user.uid)}
                  className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 hover:scale-105"
                >
                  REFRESH DATA
                </button>
              </div>
              <div className="flex items-end justify-between h-48 space-x-2">
                {weeklyProgress.length > 0 ? (
                  weeklyProgress.map((day, index) => (
                    <motion.div 
                      key={day.day || index}
                      className="flex flex-col items-center flex-1"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                      <div className="text-sm text-green-300 mb-2">{day.day}</div>
                      <motion.div 
                        className="w-full rounded-t-lg bg-gradient-to-t from-green-500 to-blue-600 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 cursor-pointer"
                        style={{ height: `${day.value}%` }}
                        title={`${day.type} - ${day.calories} kcal`}
                        whileHover={{ scaleY: 1.1 }}
                      ></motion.div>
                      <div className="text-xs mt-2 font-semibold text-green-400">{day.value}%</div>
                      <div className="text-xs text-gray-400 mt-1">{day.calories}kcal</div>
                    </motion.div>
                  ))
                ) : (
                  <div className="w-full text-center text-gray-400 py-8">
                    No workout data for this week
                  </div>
                )}
              </div>
            </motion.div>

            {/* AI System Status */}
            <motion.div 
              className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-purple-500/30 shadow-lg shadow-purple-500/10"
              variants={itemVariants}
            >
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-400 bg-clip-text text-transparent mb-6">
                AI FITNESS COACH STATUS
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {systemStatus.map((system, index) => (
                  <motion.div 
                    key={system.feature} 
                    className="bg-gradient-to-r from-purple-900/30 to-purple-900/10 p-4 rounded-xl border border-purple-500/30"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center mb-2">
                      <system.icon className={`h-5 w-5 text-${system.color}-400 mr-2`} />
                      <span className="font-semibold text-purple-400">{system.feature}</span>
                    </div>
                    <p className={`text-${system.color}-300 text-sm`}>Status: {system.status}</p>
                    {system.accuracy && (
                      <p className="text-green-300 text-xs mt-1">Accuracy: {system.accuracy}%</p>
                    )}
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg border border-green-500/30">
                <div className="flex items-center">
                  <Brain className="h-5 w-5 text-green-400 mr-2" />
                  <span className="text-green-300 font-semibold">SYSTEM OPTIMAL</span>
                </div>
                <p className="text-green-200 text-sm mt-1">All AI modules functioning at 90%+ accuracy</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-8">
            {/* Quick Start Workout */}
            <motion.div variants={itemVariants}>
              <Link to="/workout">
                <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-green-500/30 shadow-lg shadow-green-500/10 hover:shadow-green-500/30 transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-green-400 group-hover:text-green-300 transition-colors">
                      START WORKOUT
                    </h3>
                    <Zap className="h-5 w-5 text-green-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-green-900/30 to-green-900/10 p-3 rounded-lg">
                      <p className="text-green-300 font-semibold">AI Form Analysis</p>
                      <p className="text-green-200 text-sm">Real-time posture correction</p>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-300">Today's Focus:</span>
                      <span className="text-white">{analyticsData?.todaysFocus || "Full Body Workout"}</span>
                    </div>
                    <button className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-lg font-bold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300">
                      INITIATE AI COACH
                    </button>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Upcoming AI Workouts */}
            <motion.div 
              className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-blue-500/30 shadow-lg shadow-blue-500/10"
              variants={itemVariants}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-blue-400">SCHEDULED WORKOUTS</h3>
                <Link 
                  to="/workouts/schedule"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
                >
                  <Plus className="h-4 w-4 inline mr-1" /> ADD
                </Link>
              </div>
              <div className="space-y-3">
                {upcomingWorkouts.length > 0 ? (
                  upcomingWorkouts.map((workout) => (
                    <motion.div 
                      key={workout.id}
                      className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-all duration-200"
                      whileHover={{ x: 5 }}
                      layout
                    >
                      <div className="flex items-center">
                        {getWorkoutIcon(workout.type)}
                        <div className="ml-3">
                          <p className="font-semibold text-blue-300">{workout.name}</p>
                          <p className="text-sm text-gray-400">
                            {workout.scheduledDate?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {workout.duration}
                          </p>
                          {workout.aiAssist && (
                            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">AI ASSIST</span>
                          )}
                        </div>
                      </div>
                      <Link 
                        to={`/workout/${workout.id}`}
                        className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-3 py-1 rounded text-xs font-semibold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300"
                      >
                        START
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-4">
                    No upcoming workouts scheduled
                  </div>
                )}
              </div>
            </motion.div>

            {/* Fitness Achievements */}
            <motion.div 
              className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-purple-500/30 shadow-lg shadow-purple-500/10"
              variants={itemVariants}
            >
              <h3 className="text-xl font-bold text-purple-400 mb-4">RECENT ACHIEVEMENTS</h3>
              <div className="space-y-3">
                {recentAchievements.length > 0 ? (
                  recentAchievements.map((achievement) => (
                    <motion.div 
                      key={achievement.id}
                      className="flex items-center p-3 bg-purple-900/20 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      layout
                    >
                      <div className="text-2xl mr-3">
                        {getAchievementIcon(achievement.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-purple-300">{achievement.title}</p>
                        <p className="text-sm text-purple-200/80">{achievement.description}</p>
                        <p className="text-xs text-purple-400 mt-1">
                          {achievement.achievedAt?.toDate().toLocaleDateString()}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-4">
                    No achievements yet. Start working out!
                  </div>
                )}
              </div>
            </motion.div>

            {/* Progress Summary */}
            <motion.div variants={itemVariants}>
              <Link to="/progress">
                <div className="bg-gradient-to-br from-blue-900/20 to-green-900/20 backdrop-blur-md rounded-2xl p-6 border border-blue-500/30 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-green-500 to-blue-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">PROGRESS TRACKER</h3>
                        <p className="text-blue-300 text-sm">View detailed analytics</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center p-2 bg-blue-900/30 rounded">
                      <p className="text-green-400 font-bold">{analyticsData?.totalWorkouts || 0}</p>
                      <p className="text-blue-300">Workouts</p>
                    </div>
                    <div className="text-center p-2 bg-green-900/30 rounded">
                      <p className="text-green-400 font-bold">{analyticsData?.totalCalories || 0}</p>
                      <p className="text-green-300">Calories</p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default DashboardPage;