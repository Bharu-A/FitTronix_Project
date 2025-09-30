import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { 
  collection, 
  getDocs, 
  orderBy, 
  query, 
  limit, 
  doc, 
  getDoc,
  where,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Loader2,
  Shield,
  User,
  BarChart3,
  Search,
  Edit,
  Trash2,
  Plus,
  Eye,
  Ban,
  RefreshCw,
  Download,
  LogOut,
  Award,
  Target,
  PieChart,
  LineChart,
  BarChart,
  X,
  Save,
  UserPlus,
  Activity as ActivityIcon,
  Shield as ShieldIcon,
  Zap,
  Cpu,
  Network,
  Database,
  Server,FileText,
} from "lucide-react";
import BlogManagement from "../components/admin/BlogManagement";
import ContactMessages from "../components/admin/ContactMessages";

// Main Admin Dashboard Component
function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check admin role and authentication
  useEffect(() => {
    const checkAdminRole = async (user) => {
      if (!user) {
        navigate("/login?error=Please log in to access admin dashboard");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists() || userDoc.data().role !== "admin") {
          navigate("/login?error=Unauthorized: Admin access required");
          return;
        }
        // User is admin, proceed
        setUser(user);
        setAuthLoading(false);
      } catch (err) {
        console.error("Error checking admin role:", err);
        navigate("/login?error=Authentication failed");
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      checkAdminRole(user);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center ">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
          </motion.div>
          <p className="text-cyan-200 neon-text-cyan">INITIALIZING ADMIN ACCESS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex pt-[75px]">
      {/* Cyber Sidebar */}
      <div className="w-64 bg-gray-800/50 backdrop-blur-md border-r border-cyan-500/20 z-10">
        <div className="p-6 border-b border-cyan-500/20">
          <motion.h1 
            className="text-xl font-bold flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="p-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              FITTRONIX ADMIN
            </span>
          </motion.h1>
          <p className="text-cyan-300 text-sm mt-2">CYBER CONTROL PANEL</p>
        </div>

        <nav className="p-4 space-y-2">
          {[
            { id: "dashboard", label: "DASHBOARD", icon: BarChart3 },
            { id: "users", label: "USER MANAGEMENT", icon: Users },
            { id: "workouts", label: "WORKOUT SYSTEMS", icon: Activity },
            { id: "activity", label: "ACTIVITY FEED", icon: ActivityIcon },
            { id: "analytics", label: "ANALYTICS", icon: PieChart },
            { id: "security", label: "SECURITY", icon: ShieldIcon },
            { id: "blog", label: "BLOGS", icon: FileText },
            { id: "messages", label: "MESSAGES", icon: FileText },
            { id: "content", label: "CONTENTS", icon: FileText },
          ].map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-300 ${
                activeTab === item.id
                  ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/20"
                  : "text-gray-400 hover:text-cyan-300 hover:bg-gray-700/50 border border-transparent"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium text-sm">{item.label}</span>
            </motion.button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-cyan-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-cyan-300 truncate">
                {user?.email}
              </p>
              <p className="text-xs text-cyan-400">SYSTEM ADMINISTRATOR</p>
            </div>
          </div>
          <motion.button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-cyan-300 hover:text-white hover:bg-red-500/20 rounded-lg transition-all duration-300 border border-red-500/30"
            whileHover={{ scale: 1.02 }}
          >
            <LogOut className="h-4 w-4" />
            <span className="font-medium">LOGOUT</span>
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-900 via-purple-900/20 to-cyan-900/10">
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "dashboard" && <DashboardStats />}
              {activeTab === "users" && <UserManagement />}
              {activeTab === "workouts" && <WorkoutManagement />}
              {activeTab === "activity" && <ActivityFeed />}
              {activeTab === "analytics" && <AnalyticsDashboard />}
              {activeTab === "content" && <ContentManagement />}
              {activeTab === "security" && <SecurityLogs />}
              {activeTab === "blog" && <BlogManagement />}
              {activeTab === "messages" && <ContactMessages />}
              
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Dashboard Stats Component
function DashboardStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalWorkouts: 0,
    avgFormScore: 0,
    trendingExercises: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch users
      const usersSnap = await getDocs(collection(db, "users"));
      const totalUsers = usersSnap.size;
      
      // Calculate active users (users with workouts in last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const workoutsQuery = query(
        collection(db, "workouts"),
        where("timestamp", ">", weekAgo)
      );
      const workoutsSnap = await getDocs(workoutsQuery);
      const activeUserIds = new Set(workoutsSnap.docs.map(doc => doc.data().uid));
      
      // Fetch all workouts for averages
      const allWorkoutsSnap = await getDocs(collection(db, "workouts"));
      const workouts = allWorkoutsSnap.docs.map(doc => doc.data());
      
      // Calculate average form score
      const validScores = workouts
        .filter(w => w.form_score || w.formScore)
        .map(w => w.form_score || w.formScore);
      const avgFormScore = validScores.length > 0 
        ? validScores.reduce((a, b) => a + b, 0) / validScores.length 
        : 0;

      // Get trending exercises (most frequent in last week)
      const exerciseCount = {};
      workoutsSnap.docs.forEach(doc => {
        const exercise = doc.data().exercise || doc.data().name;
        if (exercise) {
          exerciseCount[exercise] = (exerciseCount[exercise] || 0) + 1;
        }
      });
      
      const trendingExercises = Object.entries(exerciseCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      setStats({
        totalUsers,
        activeUsers: activeUserIds.size,
        totalWorkouts: allWorkoutsSnap.size,
        avgFormScore: Math.round(avgFormScore),
        trendingExercises
      });

    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-8 w-8 text-cyan-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <motion.h1 
            className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            SYSTEM DASHBOARD
          </motion.h1>
          <p className="text-cyan-200">Real-time platform analytics and performance metrics</p>
        </div>
        <motion.button 
          onClick={fetchDashboardStats}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-lg hover:from-cyan-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className="h-4 w-4" />
          SYNC DATA
        </motion.button>
      </div>

      {error && (
        <motion.div 
          className="mb-6 bg-red-900/50 backdrop-blur-md border border-red-500/30 rounded-xl p-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-200">{error}</span>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="TOTAL USERS"
          value={stats.totalUsers}
          icon={Users}
          color="cyan"
          description="Registered in system"
        />
        <StatCard
          title="ACTIVE USERS"
          value={stats.activeUsers}
          icon={User}
          color="purple"
          description="Last 7 days"
        />
        <StatCard
          title="WORKOUTS"
          value={stats.totalWorkouts}
          icon={Activity}
          color="pink"
          description="Total completed"
        />
        <StatCard
          title="FORM SCORE"
          value={`${stats.avgFormScore}%`}
          icon={Target}
          color="green"
          description="Average accuracy"
        />
      </div>

      {/* Trending Exercises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-cyan-500/20 p-6 hover:border-cyan-500/40 transition-all duration-300"
          whileHover={{ y: -5 }}
        >
          <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            TRENDING EXERCISES
          </h3>
          <div className="space-y-3">
            {stats.trendingExercises.map((exercise, index) => (
              <motion.div 
                key={exercise.name}
                className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{index + 1}</span>
                  </div>
                  <span className="font-medium text-cyan-100">{exercise.name}</span>
                </div>
                <span className="text-sm text-purple-300 font-mono">{exercise.count} workouts</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-purple-500/20 p-6 hover:border-purple-500/40 transition-all duration-300"
          whileHover={{ y: -5 }}
        >
          <h3 className="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            QUICK ACTIONS
          </h3>
          <div className="space-y-3">
            <motion.button 
              className="w-full flex items-center gap-3 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/20 transition-all duration-300 group"
              whileHover={{ scale: 1.02 }}
            >
              <UserPlus className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-cyan-300">ADD NEW USER</span>
            </motion.button>
            <motion.button 
              className="w-full flex items-center gap-3 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg hover:bg-purple-500/20 transition-all duration-300 group"
              whileHover={{ scale: 1.02 }}
            >
              <Plus className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-purple-300">CREATE WORKOUT</span>
            </motion.button>
            <motion.button 
              className="w-full flex items-center gap-3 p-4 bg-pink-500/10 border border-pink-500/30 rounded-lg hover:bg-pink-500/20 transition-all duration-300 group"
              whileHover={{ scale: 1.02 }}
            >
              <Download className="h-5 w-5 text-pink-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-pink-300">EXPORT DATA</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, color, description }) {
  const colorClasses = {
    cyan: { 
      bg: "bg-cyan-500/20", 
      text: "text-cyan-400",
      border: "border-cyan-500/30",
      gradient: "from-cyan-500 to-blue-600"
    },
    purple: { 
      bg: "bg-purple-500/20", 
      text: "text-purple-400",
      border: "border-purple-500/30",
      gradient: "from-purple-500 to-pink-600"
    },
    pink: { 
      bg: "bg-pink-500/20", 
      text: "text-pink-400",
      border: "border-pink-500/30",
      gradient: "from-pink-500 to-purple-600"
    },
    green: { 
      bg: "bg-green-500/20", 
      text: "text-green-400",
      border: "border-green-500/30",
      gradient: "from-green-500 to-cyan-600"
    },
  };

  return (
    <motion.div 
      className={`bg-gray-800/50 backdrop-blur-md rounded-xl border ${colorClasses[color].border} p-6 hover:shadow-lg hover:shadow-${color.split('-')[0]}-500/20 transition-all duration-300`}
      whileHover={{ scale: 1.05, y: -5 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color].bg}`}>
          <Icon className={`h-6 w-6 ${colorClasses[color].text}`} />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm text-gray-400">
        <span>{description}</span>
      </div>
    </motion.div>
  );
}

// User Management Component
function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const usersSnap = await getDocs(usersQuery);
      const usersData = usersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        role: newRole,
        updatedAt: serverTimestamp()
      });
      await fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const suspendUser = async (userId) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        status: "suspended",
        suspendedAt: serverTimestamp()
      });
      await fetchUsers();
    } catch (error) {
      console.error("Error suspending user:", error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            USER MANAGEMENT
          </h1>
          <p className="text-cyan-200 mt-2">Manage system users and access permissions</p>
        </div>
        <motion.button 
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-lg hover:from-cyan-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-cyan-500/30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <UserPlus className="h-4 w-4" />
          ADD USER
        </motion.button>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-cyan-500/20 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-400" />
            <input
              type="text"
              placeholder="Search users by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-400"
            />
          </div>
          <select className="px-4 py-3 bg-gray-700/50 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white">
            <option value="" className="bg-gray-800">All Roles</option>
            <option value="user" className="bg-gray-800">User</option>
            <option value="admin" className="bg-gray-800">Admin</option>
          </select>
          <select className="px-4 py-3 bg-gray-700/50 border border-pink-500/30 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-white">
            <option value="" className="bg-gray-800">All Status</option>
            <option value="active" className="bg-gray-800">Active</option>
            <option value="suspended" className="bg-gray-800">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-cyan-500/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                  USER
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-purple-400 uppercase tracking-wider">
                  ROLE
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-pink-400 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                  WORKOUTS
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-yellow-400 uppercase tracking-wider">
                  LAST ACTIVE
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-700 rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-700 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-700 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-700 rounded w-12"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-700 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-700 rounded w-20"></div>
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                    <User className="h-12 w-12 mx-auto mb-3 text-gray-600" />
                    <p className="text-lg font-medium text-gray-300">No users found</p>
                    <p className="text-sm">No users match your search criteria</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <motion.tr 
                    key={user.id} 
                    className={`hover:bg-gray-700/30 transition-all duration-200 ${
                      index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/10'
                    }`}
                    whileHover={{ scale: 1.01 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-cyan-100">
                            {user.displayName || "No Name"}
                          </div>
                          <div className="text-sm text-cyan-300">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role || "user"}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className={`text-sm px-3 py-1 rounded border bg-gray-700 ${
                          user.role === "admin" 
                            ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                            : "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                        }`}
                      >
                        <option value="user">USER</option>
                        <option value="admin">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        user.status === "suspended"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "bg-green-500/20 text-green-300 border border-green-500/30"
                      }`}>
                        {user.status === "suspended" ? "SUSPENDED" : "ACTIVE"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-cyan-100 font-mono">
                      {user.workoutsCompleted || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-300">
                      {user.lastLogin ? new Date(user.lastLogin.toDate()).toLocaleDateString() : "NEVER"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <motion.button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="text-cyan-400 hover:text-cyan-300 p-2 hover:bg-cyan-500/20 rounded-lg transition-all duration-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Eye className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          onClick={() => suspendUser(user.id)}
                          className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Ban className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setShowUserModal(false)}
          onUpdate={fetchUsers}
        />
      )}
    </div>
  );
}

// User Detail Modal Component
function UserDetailModal({ user, onClose, onUpdate }) {
  const [userData, setUserData] = useState(user);

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "users", user.id), {
        ...userData,
        updatedAt: serverTimestamp()
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-800 rounded-xl border border-cyan-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex justify-between items-center p-6 border-b border-cyan-500/20">
          <h2 className="text-xl font-semibold text-cyan-300">USER DETAILS</h2>
          <button onClick={onClose} className="text-cyan-400 hover:text-cyan-300">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-cyan-100">{userData.displayName || "No Name"}</h3>
              <p className="text-cyan-300">{userData.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-1">ROLE</label>
              <select
                value={userData.role || "user"}
                onChange={(e) => setUserData({...userData, role: e.target.value})}
                className="w-full bg-gray-700 border border-cyan-500/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white"
              >
                <option value="user">USER</option>
                <option value="admin">ADMIN</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-1">STATUS</label>
              <select
                value={userData.status || "active"}
                onChange={(e) => setUserData({...userData, status: e.target.value})}
                className="w-full bg-gray-700 border border-purple-500/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white"
              >
                <option value="active">ACTIVE</option>
                <option value="suspended">SUSPENDED</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              <div className="text-2xl font-bold text-cyan-300">{userData.workoutsCompleted || 0}</div>
              <div className="text-sm text-cyan-400">WORKOUTS</div>
            </div>
            <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-300">{userData.totalScore || 0}</div>
              <div className="text-sm text-purple-400">TOTAL SCORE</div>
            </div>
            <div className="text-center p-4 bg-pink-500/10 rounded-lg border border-pink-500/20">
              <div className="text-2xl font-bold text-pink-300">
                {userData.lastLogin ? new Date(userData.lastLogin.toDate()).toLocaleDateString() : "NEVER"}
              </div>
              <div className="text-sm text-pink-400">LAST LOGIN</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-cyan-500/20">
          <motion.button
            onClick={onClose}
            className="px-4 py-2 text-cyan-300 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/10 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            CANCEL
          </motion.button>
          <motion.button
            onClick={handleSave}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-lg hover:from-cyan-700 hover:to-purple-700 transition-all duration-300 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Save className="h-4 w-4" />
            SAVE CHANGES
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Workout Management Component
function WorkoutManagement() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const workoutsQuery = query(collection(db, "workouts"), orderBy("timestamp", "desc"));
      const workoutsSnap = await getDocs(workoutsQuery);
      const workoutsData = workoutsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWorkouts(workoutsData);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
            WORKOUT SYSTEMS
          </h1>
          <p className="text-cyan-200 mt-2">Manage exercise programs and training modules</p>
        </div>
        <motion.button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-pink-600 text-white rounded-lg hover:from-cyan-700 hover:to-pink-700 transition-all duration-300 shadow-lg shadow-cyan-500/30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="h-4 w-4" />
          CREATE WORKOUT
        </motion.button>
      </div>

      {/* Workouts Table */}
      <div className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-cyan-500/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                  EXERCISE
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-purple-400 uppercase tracking-wider">
                  USER
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-pink-400 uppercase tracking-wider">
                  REPS/SETS
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                  FORM SCORE
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-yellow-400 uppercase tracking-wider">
                  DATE
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-700 rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-700 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-700 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-700 rounded w-12"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-700 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-700 rounded w-20"></div>
                    </td>
                  </tr>
                ))
              ) : workouts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                    <Activity className="h-12 w-12 mx-auto mb-3 text-gray-600" />
                    <p className="text-lg font-medium text-gray-300">No workouts found</p>
                    <p className="text-sm">Create your first workout to get started</p>
                  </td>
                </tr>
              ) : (
                workouts.map((workout) => (
                  <WorkoutRow key={workout.id} workout={workout} onUpdate={fetchWorkouts} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <CreateWorkoutModal onClose={() => setShowCreateModal(false)} onSuccess={fetchWorkouts} />
      )}
    </div>
  );
}

// Workout Row Component
function WorkoutRow({ workout, onUpdate }) {
  const deleteWorkout = async () => {
    if (window.confirm("Are you sure you want to delete this workout?")) {
      try {
        await deleteDoc(doc(db, "workouts", workout.id));
        onUpdate();
      } catch (error) {
        console.error("Error deleting workout:", error);
      }
    }
  };

  return (
    <motion.tr 
      className="hover:bg-gray-700/30 transition-all duration-200"
      whileHover={{ scale: 1.01 }}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-cyan-100">
          {workout.exercise || workout.name || "Unknown Exercise"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-purple-300 font-mono">
          {workout.uid ? `${workout.uid.substring(0, 8)}...` : "SYSTEM"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-pink-300">
          {workout.reps || 0} reps × {workout.sets || 1} sets
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {workout.form_score || workout.formScore ? (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
            (workout.form_score || workout.formScore) >= 90 
              ? 'bg-green-500/20 text-green-300 border-green-500/30'
              : (workout.form_score || workout.formScore) >= 80
              ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
              : 'bg-red-500/20 text-red-300 border-red-500/30'
          }`}>
            {workout.form_score || workout.formScore}%
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
            -
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-300">
        {workout.timestamp ? new Date(workout.timestamp.toDate()).toLocaleDateString() : "UNKNOWN"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center gap-2">
          <motion.button 
            className="text-cyan-400 hover:text-cyan-300 p-2 hover:bg-cyan-500/20 rounded-lg transition-all duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Edit className="h-4 w-4" />
          </motion.button>
          <motion.button 
            onClick={deleteWorkout}
            className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/20 rounded-lg transition-all duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Trash2 className="h-4 w-4" />
          </motion.button>
        </div>
      </td>
    </motion.tr>
  );
}

// Create Workout Modal Component
function CreateWorkoutModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "strength",
    difficulty: "beginner",
    description: "",
    reps: 10,
    sets: 3,
    duration: 30
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "workouts"), {
        ...formData,
        createdAt: serverTimestamp(),
        isTemplate: true
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating workout:", error);
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-800 rounded-xl border border-cyan-500/30 max-w-md w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex justify-between items-center p-6 border-b border-cyan-500/20">
          <h2 className="text-xl font-semibold text-cyan-300">CREATE WORKOUT</h2>
          <button onClick={onClose} className="text-cyan-400 hover:text-cyan-300">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-1">EXERCISE NAME</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-gray-700 border border-cyan-500/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-400"
              placeholder="e.g., Push-ups, Squats, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-1">TYPE</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full bg-gray-700 border border-purple-500/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white"
              >
                <option value="strength">STRENGTH</option>
                <option value="cardio">CARDIO</option>
                <option value="flexibility">FLEXIBILITY</option>
                <option value="balance">BALANCE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-1">DIFFICULTY</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                className="w-full bg-gray-700 border border-pink-500/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-white"
              >
                <option value="beginner">BEGINNER</option>
                <option value="intermediate">INTERMEDIATE</option>
                <option value="advanced">ADVANCED</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-1">REPS</label>
              <input
                type="number"
                value={formData.reps}
                onChange={(e) => setFormData({...formData, reps: parseInt(e.target.value)})}
                className="w-full bg-gray-700 border border-cyan-500/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-1">SETS</label>
              <input
                type="number"
                value={formData.sets}
                onChange={(e) => setFormData({...formData, sets: parseInt(e.target.value)})}
                className="w-full bg-gray-700 border border-purple-500/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-1">DURATION (MIN)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                className="w-full bg-gray-700 border border-pink-500/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-1">DESCRIPTION</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full bg-gray-700 border border-cyan-500/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-400"
              placeholder="Describe the exercise and proper form..."
            />
          </div>
        </form>

        <div className="flex justify-end gap-3 p-6 border-t border-cyan-500/20">
          <motion.button
            onClick={onClose}
            className="px-4 py-2 text-cyan-300 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/10 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            CANCEL
          </motion.button>
          <motion.button
            onClick={handleSubmit}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-lg hover:from-cyan-700 hover:to-purple-700 transition-all duration-300 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="h-4 w-4" />
            CREATE WORKOUT
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Placeholder components for other sections with cyber theme
function ActivityFeed() {
  return (
    <div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-2">
        ACTIVITY FEED
      </h1>
      <p className="text-cyan-200 mb-8">Real-time system activity and user events</p>
      <div className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-cyan-500/20 p-8 text-center">
        <ActivityIcon className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
        <p className="text-cyan-300 text-lg">ACTIVITY FEED MODULE</p>
        <p className="text-gray-400">Real-time monitoring system coming soon...</p>
      </div>
    </div>
  );
}

function AnalyticsDashboard() {
  return (
    <div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
        ANALYTICS DASHBOARD
      </h1>
      <p className="text-cyan-200 mb-8">Advanced data visualization and insights</p>
      <div className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-purple-500/20 p-8 text-center">
        <PieChart className="h-16 w-16 text-purple-400 mx-auto mb-4" />
        <p className="text-purple-300 text-lg">ANALYTICS MODULE</p>
        <p className="text-gray-400">Advanced analytics dashboard coming soon...</p>
      </div>
    </div>
  );
}

function ContentManagement() {
  return (
    <div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-cyan-500 bg-clip-text text-transparent mb-2">
        CONTENT MANAGEMENT
      </h1>
      <p className="text-cyan-200 mb-8">Manage platform content and announcements</p>
      <div className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-pink-500/20 p-8 text-center">
        <FileText className="h-16 w-16 text-pink-400 mx-auto mb-4" />
        <p className="text-pink-300 text-lg">CONTENT MODULE</p>
        <p className="text-gray-400">Content management system coming soon...</p>
      </div>
    </div>
  );
}

function SecurityLogs() {
  return (
    <div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-cyan-500 bg-clip-text text-transparent mb-2">
        SECURITY & LOGS
      </h1>
      <p className="text-cyan-200 mb-8">System security monitoring and audit logs</p>
      <div className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-green-500/20 p-8 text-center">
        <ShieldIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
        <p className="text-green-300 text-lg">SECURITY MODULE</p>
        <p className="text-gray-400">Security monitoring system coming soon...</p>
      </div>
    </div>
  );
}

// Custom CSS for neon effects
const styles = `
  .neon-text-cyan {
    text-shadow: 0 0 5px rgba(34, 211, 238, 0.5), 0 0 10px rgba(34, 211, 238, 0.5), 0 0 15px rgba(34, 211, 238, 0.5);
    color: #22d3ee;
  }
  
  .neon-glow-cyan {
    box-shadow: 0 0 5px #22d3ee, 0 0 10px #22d3ee, 0 0 15px #22d3ee;
  }
`;

export default AdminDashboardPage;