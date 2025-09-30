// src/components/Sidebar.js
import React, { useState, useEffect, useRef } from "react";
import { 
  Home, Dumbbell, Calendar, Utensils, BarChart3, Trophy, User, Bot, Settings, LogOut,
  X, Moon, Sun, Star
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // adjust path

const Sidebar = ({ isOpen, setIsOpen, onLogout }) => {
  const [darkMode, setDarkMode] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const sidebarRef = useRef(null);

  // Auto fetch user from Firebase + Firestore
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setUser({
              ...firebaseUser,
              ...docSnap.data()
            });
          } else {
            // fallback if no Firestore doc
            setUser({
              name: firebaseUser.displayName || "User",
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL || "/default-avatar.png",
            });
          }
        } catch (err) {
          console.error("❌ Error fetching user profile:", err);
          setUser({
            name: firebaseUser.displayName || "User",
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL || "/default-avatar.png",
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Close sidebar on mobile when clicking a link
  const handleItemClick = () => {
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  const quickStats = [
    { label: "Workouts", value: "12", change: "+2", positive: true },
    { label: "Active Days", value: "5/7", change: "+1", positive: true },
    { label: "Calories", value: "12.4k", change: "-0.8k", positive: false },
  ];

  const mainSections = [
    { label: "Home", to: "/", icon: <Home size={20} /> },
    { label: "Dashboard", to: "/dashboard", icon: <Home size={20} /> },
    { label: "Workout", to: "/workoutPage", icon: <Dumbbell size={20} /> },
    { label: "Schedule", to: "/schedule", icon: <Calendar size={20} /> },
    { label: "Nutrition", to: "/nutrition", icon: <Utensils size={20} /> },
    { label: "Progress", to: "/dashboard", icon: <BarChart3 size={20} /> },
    { label: "Challenges", to: "/dashboard", icon: <Trophy size={20} /> },
    { label: "Profile", to: "/profile", icon: <User size={20} /> },
    { label: "AI Coach", to: "/aICoachPage", icon: <Bot size={20} /> },
    { label: "Settings", to: "/fitTronixSettings", icon: <Settings size={20} /> },
  ];

  return (
    <div
  ref={sidebarRef}
  className={`fixed top-0 left-0 h-full bg-gray-900 shadow-lg transform transition-transform duration-300 z-40 w-[300px] ${
    isOpen ? "translate-x-0" : "-translate-x-full"
  }`}
>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-cyan-500/20">
        <div className="flex items-center space-x-3" >
          <div className="p-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg">
            <Dumbbell size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
            FitTronix
          </h1>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 rounded-full hover:bg-gray-800 transition-colors lg:hidden"
        >
          <X size={20} className="text-cyan-400" />
        </button>
      </div>

      {/* Profile */}
      <div className="p-6 border-b border-cyan-500/20">
        {loading ? (
          <p className="text-gray-400 text-sm">Loading user...</p>
        ) : user ? (
          <>
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={user.photoURL || "/default-avatar.png"}
                alt={user.name || "User"}
                className="h-12 w-12 rounded-full border-2 border-cyan-500"
              />
              <div>
                <p className="font-semibold text-white">{user.name || "User"}</p>
                <p className="text-sm text-cyan-300">{user.email || "user@fittronix.com"}</p>
              </div>
            </div>
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {quickStats.map((stat, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-2 text-center border border-cyan-500/20">
                  <p className="text-xs text-cyan-300">{stat.label}</p>
                  <p className="font-bold text-white text-sm">{stat.value}</p>
                  <p className={`text-xs ${stat.positive ? "text-green-400" : "text-pink-400"}`}>{stat.change}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-sm">Not logged in</p>
        )}

        {/* Premium */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-800 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star size={16} className="text-amber-200" />
            <span className="text-sm font-medium text-amber-100">Premium Member</span>
          </div>
          <button className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-amber-100">
            Upgrade
          </button>
        </div>
      </div>

      {/* Main Nav */}
      <div className="flex-1 overflow-y-auto py-4">
        <h3 className="text-xs font-semibold text-cyan-400 uppercase px-6 mb-3">Main Sections</h3>
        <div className="space-y-1 px-3">
          {mainSections.map((item, i) => (
            <Link
              key={i}
              to={item.to}
              onClick={handleItemClick}
              className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                location.pathname === item.to
                  ? "bg-gradient-to-r from-cyan-700/30 to-pink-700/30 border-l-4 border-cyan-400"
                  : "hover:bg-gray-800/50"
              }`}
            >
              <div className={location.pathname === item.to ? "text-cyan-400" : "text-gray-400 group-hover:text-cyan-300"}>
                {item.icon}
              </div>
              <span className={`font-medium ${location.pathname === item.to ? "text-cyan-300" : "text-gray-300 group-hover:text-white"}`}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
            
      {/* Footer */}
      <div className="p-4 border-t border-cyan-500/20">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800/50 text-cyan-400 hover:text-cyan-300"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span className="text-sm">{darkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800/50 text-pink-400 hover:text-pink-300"
          >
            <LogOut size={18} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
        <div className="text-center text-xs text-cyan-500/60">FitTronix v2.0 • Cyber Edition</div>
      </div>
    </div>
  );
};

export default Sidebar;
