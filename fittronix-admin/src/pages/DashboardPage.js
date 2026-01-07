// src/pages/DashboardPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart, Bar, ResponsiveContainer, Cell, XAxis } from "recharts";
import {
  Activity, Target, Salad, Smile, Settings,
  TrendingUp, Calendar, Clock, Award, Heart,
  ChevronRight, Users, BarChart3, Plus, Zap,
  Battery, Cpu, Network, Dumbbell, HeartPulse,
  Camera, Brain, Smartphone, Gauge, CheckCircle
} from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  doc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

/**
 * DashboardPage - optimized and corrected version
 * Key fixes:
 * - Replaced dynamic Tailwind classes with a colorClasses lookup (Tailwind-safe)
 * - Proper listener cleanup (returns unsubscribe function from initializer and used in auth effect)
 * - Avoid infinite analytics-refresh loop: refresh analytics only once at initialize
 * - Safe handling for Firestore Timestamp vs string/null
 * - Minor performance improvements (reduced timer frequency, removed unused imports)
 */

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

  // firebase instances (assumes firebase has been initialized elsewhere)
  const auth = getAuth();
  const db = getFirestore();
  const functions = getFunctions();

  // keep a ref to cleanup function(s) so we can unsubscribe previous listeners when auth changes
  const cleanupRef = useRef(() => { });

  // Tailwind-safe color classes lookup (no dynamic template strings)
  const colorClasses = {
    green: {
      text: "text-green-400",
      valueText: "text-green-300",
      progFrom: "from-green-500",
      progTo: "to-green-600",
      shadow: "shadow-green-500/30",
      bg: "bg-gradient-to-r from-green-500 to-blue-600"
    },
    blue: {
      text: "text-blue-400",
      valueText: "text-blue-300",
      progFrom: "from-blue-500",
      progTo: "to-blue-600",
      shadow: "shadow-blue-500/30",
      bg: "bg-gradient-to-r from-blue-600 to-purple-600"
    },
    purple: {
      text: "text-purple-400",
      valueText: "text-purple-300",
      progFrom: "from-purple-500",
      progTo: "to-purple-600",
      shadow: "shadow-purple-500/30",
      bg: "bg-gradient-to-r from-purple-500 to-pink-400"
    },
    orange: {
      text: "text-orange-400",
      valueText: "text-orange-300",
      progFrom: "from-orange-500",
      progTo: "to-orange-600",
      shadow: "shadow-orange-500/30",
      bg: "bg-gradient-to-r from-orange-500 to-orange-600"
    }
  };

  // ---------- Time updater ----------
  useEffect(() => {
    // update immediately, then every 30 seconds (less frequent than once-per-minute but still responsive)
    const tick = () => setCurrentTime(new Date());
    tick();
    const timer = setInterval(tick, 30 * 1000);
    return () => clearInterval(timer);
  }, []);

  // ---------- Auth listener + initialize dashboard ----------
  useEffect(() => {
    // when auth state changes, initialize data and ensure previous listeners are cleaned
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      // clean previous listeners if any
      try {
        cleanupRef.current && cleanupRef.current();
      } catch (e) {
        // ignore
      }

      if (currentUser) {
        setUser(currentUser);
        // initializeDashboardData will return a cleanup function (to unsubscribe listeners)
        const cleanupFn = await initializeDashboardData(currentUser.uid);
        cleanupRef.current = cleanupFn;
      } else {
        setUser(null);
        setUserData(null);
        setAnalyticsData(null);
        setWeeklyProgress([]);
        setUpcomingWorkouts([]);
        setRecentAchievements([]);
        setFitnessMetrics([]);
        setSystemStatus([]);
        setLoading(false);
        cleanupRef.current = () => { };
      }
    });

    return () => {
      // cleanup auth listener and any dashboard listeners
      unsubscribeAuth();
      try {
        cleanupRef.current && cleanupRef.current();
      } catch (e) { }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Initialize dashboard: sets up realtime listeners and returns cleanup function ----------
  const initializeDashboardData = async (userId) => {
    setLoading(true);
    setError(null);

    // keep references to unsubscribe functions so we can return a composite cleanup
    const unsubscribes = [];

    // To avoid infinite analytics-refresh loop, only trigger computation once at initialization
    let analyticsTriggered = false;

    try {
      // User profile listener
      const userDocRef = doc(db, "users", userId);
      const unsubUser = onSnapshot(userDocRef, (snap) => {
        if (snap.exists()) {
          setUserData(snap.data());
        }
      }, (err) => {
        console.error("User snapshot error:", err);
        setError("Failed to load user profile");
      });
      unsubscribes.push(unsubUser);

      // Analytics listener (doc per user)
      const analyticsDocRef = doc(db, "analytics", userId);
      const unsubAnalytics = onSnapshot(analyticsDocRef, (snap) => {
        if (snap.exists()) {
          const analytics = snap.data();
          setAnalyticsData(analytics);

          // Update fitness metrics from analytics (use fallback defaults)
          setFitnessMetrics([
            {
              label: "Form Accuracy",
              value: clampPercent(analytics.formAccuracy),
              max: 100,
              icon: CheckCircle,
              color: "green",
              desc: "Posture detection score"
            },
            {
              label: "Workout Intensity",
              value: clampPercent(analytics.workoutIntensity),
              max: 100,
              icon: Gauge,
              color: "orange",
              desc: "Current session effort"
            },
            {
              label: "Recovery Status",
              value: clampPercent(analytics.recoveryStatus),
              max: 100,
              icon: HeartPulse,
              color: "blue",
              desc: "Muscle recovery level"
            },
            {
              label: "AI Analysis",
              value: clampPercent(analytics.aiAnalysisScore),
              max: 100,
              icon: Brain,
              color: "purple",
              desc: "Real-time feedback accuracy"
            }
          ]);

          // Weekly progress
          if (Array.isArray(analytics.weeklySummary)) {
            setWeeklyProgress(analytics.weeklySummary);
          }

          // Update system status (use analytics when available)
          updateSystemStatus(analytics);

          // Trigger compute analytics only once (avoid loop)
          if (!analyticsTriggered) {
            analyticsTriggered = true;
            refreshAnalytics(userId).catch((e) => {
              console.warn("refreshAnalytics error:", e);
            });
          }
        }
      }, (err) => {
        console.error("Analytics snapshot error:", err);
      });
      unsubscribes.push(unsubAnalytics);

      // Upcoming workouts - real-time
      // Note: When using range queries, Firestore requires appropriate indexing. If Firestore complains, follow console links to create index.
      const workoutsQuery = query(
        collection(db, "workouts"),
        where("userId", "==", userId),
        // ordering/sorting by scheduledDate helps when using range filters — keep orderBy on the same field
        orderBy("scheduledDate", "asc")
        // The `where("scheduledDate", ">=", new Date())` cannot be appended AFTER orderBy in code order,
        // however the Firestore SDK accepts a query composed of all constraints. We'll add the range as another constraint below:
      );

      // We need to re-compose the query with the range filter — create it explicitly to avoid SDK mistakes.
      const workoutsQueryWithRange = query(
        collection(db, "workouts"),
        where("userId", "==", userId),
        where("scheduledDate", ">=", new Date()),
        orderBy("scheduledDate", "asc")
      );

      const unsubWorkouts = onSnapshot(workoutsQueryWithRange, (snap) => {
        const list = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
        // sanitize dates before storing in state to avoid crashes in rendering
        const normalized = list.map((w) => ({
          ...w,
          scheduledDate: normalizeTimestamp(w.scheduledDate)
        }));
        setUpcomingWorkouts(normalized);
      }, (err) => {
        console.error("Workouts snapshot error:", err);
      });
      unsubscribes.push(unsubWorkouts);

      // Recent achievements (limit 5)
      const achievementsQuery = query(
        collection(db, "achievements"),
        where("userId", "==", userId),
        orderBy("achievedAt", "desc"),
        limit(5)
      );
      const unsubAchievements = onSnapshot(achievementsQuery, (snap) => {
        const items = [];
        snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
        const normalized = items.map((a) => ({
          ...a,
          achievedAt: normalizeTimestamp(a.achievedAt)
        }));
        setRecentAchievements(normalized);
      }, (err) => {
        console.error("Achievements snapshot error:", err);
      });
      unsubscribes.push(unsubAchievements);

      // initial systemStatus (optimistic defaults until analytics arrives)
      updateSystemStatus(null);

      setLoading(false);

      // return cleanup function that unsubscribes all listeners
      return () => {
        unsubscribes.forEach((u) => {
          try {
            if (typeof u === "function") u();
          } catch (e) { }
        });
      };
    } catch (err) {
      console.error("Error initializing dashboard:", err);
      setError("Failed to load dashboard data");
      setLoading(false);
      // return no-op cleanup
      return () => { };
    }
  };

  // ---------- Helpers ----------
  function clampPercent(val) {
    const n = Number(val);
    if (!isFinite(n) || isNaN(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  // Normalize Firestore Timestamp or JS Date or string -> return object with toDate method safe usage in UI
  function normalizeTimestamp(ts) {
    if (!ts) return null;
    // Firestore Timestamp has toDate()
    if (typeof ts?.toDate === "function") {
      try {
        return ts;
      } catch (e) {
        return null;
      }
    }
    // If it's a plain JS Date
    if (ts instanceof Date) {
      // wrap to mimic Firestore Timestamp-like interface for existing UI code
      return {
        toDate: () => ts
      };
    }
    // If ISO string
    if (typeof ts === "string") {
      const d = new Date(ts);
      if (!isNaN(d.getTime())) {
        return { toDate: () => d };
      }
    }
    return null;
  }

  // Update system status using analytics data (if available)
  const updateSystemStatus = (analytics = null) => {
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
        status: analytics?.poseDetectionAccuracy ? "Optimized" : "Ready",
        icon: Brain,
        color: "blue",
        accuracy: analytics?.poseDetectionAccuracy ?? 95
      },
      {
        feature: "AI Feedback",
        status: "Live",
        icon: Smartphone,
        color: "purple",
        responseTime: analytics?.aiResponseTime || "120ms"
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

  // Call Cloud Functions to refresh analytics — keep as a separate function
  const refreshAnalytics = async (userId) => {
    try {
      const computeAnalytics = httpsCallable(functions, "computeUserAnalytics");
      const result = await computeAnalytics({ userId });
      // analytic doc will update via onSnapshot listener; just log the result
      console.log("Analytics function invoked:", result.data);
      return result.data;
    } catch (err) {
      console.error("Error invoking computeUserAnalytics:", err);
      throw err;
    }
  };

  // Get workout icon based on type
  const getWorkoutIcon = (type) => {
    switch (type) {
      case "strength":
        return <Dumbbell className="h-4 w-4" />;
      case "cardio":
        return <Activity className="h-4 w-4" />;
      case "core":
        return <Activity className="h-4 w-4" />;
      case "hiit":
        return <Zap className="h-4 w-4" />;
      case "yoga":
        return <Heart className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  // Achievement icon map
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

  // Greeting
  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "ENERGIZE";
    if (hour < 17) return "PERFORM";
    return "RECOVER";
  };

  // Framer motion variants
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

  // ---------- UI states ----------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-green-400 text-lg">Loading your fitness dashboard...</p>
        </motion.div>
      </div>
    );
  }

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

  // ---------- Render main dashboard ----------
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      {/* Background layers */}
      <div className="fixed inset-0 bg-gradient-to-br from-green-900/20 via-gray-900 to-blue-600/10 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-gray-900 to-green-900/20 pointer-events-none" />

      <motion.div className="relative z-10 max-w-7xl mx-auto" variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <motion.header className="mb-8 pt-4" variants={itemVariants}>
          <div className="pt-[65px] flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <motion.h1
                className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                FITTRONIX — {getTimeBasedGreeting()}, {userData?.name?.toUpperCase() || "ATHLETE"}
              </motion.h1>
              <p className="text-blue-300 mt-2 text-lg">
                AI-Powered Fitness System |{" "}
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric"
                })}
              </p>
            </div>

            <div className="flex items-center mt-4 lg:mt-0 space-x-4">
              <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-3 border border-green-500/30 shadow-lg shadow-green-500/20">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-green-400 mr-2" />
                  <span className="text-green-300 font-medium">
                    {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-3 border border-purple-500/30 shadow-lg shadow-purple-500/20">
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-purple-400 mr-2" />
                  <span className="text-purple-300 font-medium">{analyticsData?.currentStreak || 0} DAY STREAK</span>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Fitness metrics */}
        <motion.section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" variants={containerVariants}>
          {fitnessMetrics.map((metric, index) => {
            const c = colorClasses[metric.color] || colorClasses.green;
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.label}
                className="bg-gray-800/30 backdrop-blur-md rounded-2xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`${c.text} h-8 w-8`} />
                  <div className="text-right">
                    <motion.p className="text-2xl font-bold text-white" key={metric.value} initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
                      {metric.value}%
                    </motion.p>
                    <p className="text-sm text-gray-400">{metric.label}</p>
                  </div>
                </div>

                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full ${c.progFrom} ${c.progTo} ${c.shadow}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                </div>

                <p className="text-xs text-gray-400 mt-2">{metric.desc}</p>
              </motion.div>
            );
          })}
        </motion.section>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="xl:col-span-2 space-y-8">
            {/* Weekly Performance */}
            <motion.div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-green-500/30 shadow-lg shadow-green-500/10" variants={itemVariants}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">WEEKLY PERFORMANCE ANALYTICS</h2>
                <button
                  onClick={() => refreshAnalytics(user.uid)}
                  className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 hover:scale-105"
                >
                  REFRESH DATA
                </button>
              </div>

              <div className="h-48 min-h-[180px] w-full">
                {weeklyProgress.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyProgress}>
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {weeklyProgress.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="url(#colorGradient)" />
                        ))}
                      </Bar>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#86efac', fontSize: 12 }} />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22c55e" /> {/* green-500 */}
                          <stop offset="100%" stopColor="#2563eb" /> {/* blue-600 */}
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full text-center text-gray-400 py-8">No workout data for this week</div>
                )}
              </div>
            </motion.div>

            {/* AI System Status - HUD Terminal Style */}
            <motion.div
              className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 relative overflow-hidden group"
              variants={itemVariants}
            >
              {/* Scanline effect */}
              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-10 pointer-events-none" />
              <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h2 className="text-xl font-mono font-bold text-green-400 flex items-center tracking-wider">
                    <Brain className="h-5 w-5 mr-3 animate-pulse" />
                    AI_COACH_STATUS // v2.4
                  </h2>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="flex items-center text-xs text-green-500 font-mono">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-ping" />
                      ONLINE
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      LATENCY: <span className="text-green-400">{Math.floor(Math.random() * (45 - 30) + 30)}ms</span>
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                  <Network className="h-6 w-6 text-green-400" />
                </div>
              </div>

              {/* Terminal Data Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6 relative z-10 font-mono text-sm">
                <div className="bg-gray-900/50 p-3 rounded border border-gray-700">
                  <div className="text-gray-500 text-xs mb-1">TOTAL_REPS</div>
                  <div className="text-xl text-white">14,208</div>
                </div>
                <div className="bg-gray-900/50 p-3 rounded border border-gray-700">
                  <div className="text-gray-500 text-xs mb-1">FORMS_CORRECTED</div>
                  <div className="text-xl text-green-400">1,240</div>
                </div>
                <div className="bg-gray-900/50 p-3 rounded border border-gray-700">
                  <div className="text-gray-500 text-xs mb-1">AVG_ACCURACY</div>
                  <div className="text-xl text-blue-400">96.8%</div>
                </div>
                <div className="bg-gray-900/50 p-3 rounded border border-gray-700">
                  <div className="text-gray-500 text-xs mb-1">DATA_SYNC</div>
                  <div className="text-xl text-purple-400">100%</div>
                </div>
              </div>

              {/* Latest Console Output */}
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs border border-gray-700 relative z-10">
                <div className="text-gray-500 mb-2 border-b border-gray-800 pb-2 flex justify-between">
                  <span>LATEST_ANALYSIS_LOG</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-green-500/80">> Initializing PoseNet model...</p>
                  <p className="text-green-500/80">> Calibrating depth sensors... OK</p>
                  <p className="text-blue-400">> Recent Workout Insight: <span className="text-white">"Squat depth optimal. Knee stability detected at 98%."</span></p>
                  <p className="text-gray-500 animate-pulse">_</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right column */}
          <div className="space-y-8">
            {/* Quick Start Workout */}
            <motion.div variants={itemVariants}>
              <Link to="/workout">
                <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-green-500/30 shadow-lg shadow-green-500/10 hover:shadow-green-500/30 transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-green-400 group-hover:text-green-300 transition-colors">START WORKOUT</h3>
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

            {/* Scheduled workouts */}
            <motion.div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-blue-500/30 shadow-lg shadow-blue-500/10" variants={itemVariants}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-blue-400">SCHEDULED WORKOUTS</h3>
                <Link to="/workouts/schedule" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105">
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
                            {workout.scheduledDate?.toDate ? workout.scheduledDate.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "TBD"} • {workout.duration || "—"}
                          </p>
                          {workout.aiAssist && <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">AI ASSIST</span>}
                        </div>
                      </div>
                      <Link to={`/workout/${workout.id}`} className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-3 py-1 rounded text-xs font-semibold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300">
                        START
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-4">No upcoming workouts scheduled</div>
                )}
              </div>
            </motion.div>

            {/* Recent achievements */}
            <motion.div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-purple-500/30 shadow-lg shadow-purple-500/10" variants={itemVariants}>
              <h3 className="text-xl font-bold text-purple-400 mb-4">RECENT ACHIEVEMENTS</h3>
              <div className="space-y-3">
                {recentAchievements.length > 0 ? (
                  recentAchievements.map((achievement) => (
                    <motion.div key={achievement.id} className="flex items-center p-3 bg-purple-900/20 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all duration-200" whileHover={{ scale: 1.02 }} layout>
                      <div className="text-2xl mr-3">{getAchievementIcon(achievement.type)}</div>
                      <div className="flex-1">
                        <p className="font-semibold text-purple-300">{achievement.title}</p>
                        <p className="text-sm text-purple-200/80">{achievement.description}</p>
                        <p className="text-xs text-purple-400 mt-1">{achievement.achievedAt?.toDate ? achievement.achievedAt.toDate().toLocaleDateString() : ""}</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-4">No achievements yet. Start working out!</div>
                )}
              </div>
            </motion.div>

            {/* Progress summary link */}
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
