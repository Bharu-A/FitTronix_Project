import React, { useState, useEffect, useRef } from "react";
import { 
  Home, 
  Dumbbell, 
  Calendar, 
  Utensils, 
  BarChart3, 
  Trophy, 
  User, 
  Bot, 
  Settings, 
  LogOut,
  Users,
  Target,
  Brain,
  X,
  ChevronDown,
  ChevronRight,
  Moon,
  Sun,
  Star,
  Activity
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
// Close sidebar on mobile when clicking a link
const handleItemClick = () => {
  if (window.innerWidth < 1024) {
    setIsOpen(false);
  }
};
<FitTronixSidebar
  isOpen={isSidebarOpen}
  setIsOpen={setIsSidebarOpen}   // <-- Must pass this
  user={user}
  onLogout={handleLogout}
/>


const FitTronixSidebar = ({ isOpen, setIsOpen, user, onLogout }) => {
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const location = useLocation();
  const sidebarRef = useRef(null);

  // Sample data
  const quickStats = [
    { label: "Workouts", value: "12", change: "+2", positive: true },
    { label: "Active Days", value: "5/7", change: "+1", positive: true },
    { label: "Calories", value: "12.4k", change: "-0.8k", positive: false },
  ];

  const recentActivities = [
    { action: "Completed", item: "Upper Body Workout", time: "2 hours ago" },
    { action: "Logged", item: "Breakfast: 450 cal", time: "4 hours ago" },
    { action: "Set a new", item: "Personal Record", time: "1 day ago" },
  ];

  // Navigation items
  const mainSections = [
    { label: "Home", to: "/", icon: <Home size={20} /> },
    { label: "Workout", to: "/workouts", icon: <Dumbbell size={20} /> },
    { label: "Schedule", to: "/schedule", icon: <Calendar size={20} /> },
    { label: "Nutrition", to: "/nutrition", icon: <Utensils size={20} /> },
    { label: "Progress", to: "/progress", icon: <BarChart3 size={20} /> },
    { label: "Challenges", to: "/challenges", icon: <Trophy size={20} /> },
    { label: "Profile", to: "/profile", icon: <User size={20} /> },
    { label: "AI Coach", to: "/ai-coach", icon: <Bot size={20} /> },
    { label: "Settings", to: "/settings", icon: <Settings size={20} /> },
  ];

  const gamificationSections = [
    { label: "Arena Mode", to: "/arena", icon: <Users size={20} /> },
    { label: "Goals", to: "/goals", icon: <Target size={20} /> },
    { label: "Mindfulness", to: "/mindfulness", icon: <Brain size={20} /> },
  ];

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // You would typically update your app's theme context here
  };
  // Toggle the community submenu open/close
const toggleSubmenu = (menu) => {
  setActiveSubmenu(activeSubmenu === menu ? null : menu);
};
useEffect(() => {
  const handleClickOutside = (event) => {
    if (!sidebarRef.current) return;
    if (!sidebarRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside, true); // capture phase
  return () => {
    document.removeEventListener("mousedown", handleClickOutside, true);
  };
}, [setIsOpen]);


  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 h-full w-80 z-50 flex flex-col
          bg-gray-900 bg-opacity-90 backdrop-blur-md
          border-r border-cyan-500/30
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          shadow-2xl shadow-cyan-500/10
        `}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-6 border-b border-cyan-500/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg neon-glow">
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

        {/* User Profile Section */}
        <div className="p-6 border-b border-cyan-500/20">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              <img
                src={user?.photoURL || "/default-avatar.png"}
                alt={user?.name || "User"}
                className="h-12 w-12 rounded-full border-2 border-cyan-500"
              />
              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
            </div>
            <div>
              <p className="font-semibold text-white">{user?.name || "User"}</p>
              <p className="text-sm text-cyan-300">{user?.email || "user@fittronix.com"}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {quickStats.map((stat, index) => (
              <div
                key={index}
                className="bg-gray-800 bg-opacity-60 rounded-lg p-2 text-center border border-cyan-500/20"
              >
                <p className="text-xs text-cyan-300">{stat.label}</p>
                <p className="font-bold text-white text-sm">{stat.value}</p>
                <p
                  className={`text-xs ${
                    stat.positive ? "text-green-400" : "text-pink-400"
                  }`}
                >
                  {stat.change}
                </p>
              </div>
            ))}
          </div>

          {/* Premium Badge */}
          <div className="bg-gradient-to-r from-amber-600 to-amber-800 rounded-lg p-3 flex items-center justify-between neon-glow-amber">
            <div className="flex items-center space-x-2">
              <Star size={16} className="text-amber-200" />
              <span className="text-sm font-medium text-amber-100">Premium Member</span>
            </div>
            <button className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors text-amber-100">
              Upgrade
            </button>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* Main Sections */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider px-6 mb-3">
              Main Sections
            </h3>
            <div className="space-y-1 px-3">
              {mainSections.map((item, index) => (
                <Link
                  key={index}
                  to={item.to}
                  onClick={handleItemClick}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                    location.pathname === item.to
                      ? "bg-gradient-to-r from-cyan-700/30 to-pink-700/30 border-l-4 border-cyan-400"
                      : "hover:bg-gray-800/50"
                  }`}
                >
                  <div
                    className={
                      location.pathname === item.to
                        ? "text-cyan-400"
                        : "text-gray-400 group-hover:text-cyan-300"
                    }
                  >
                    {item.icon}
                  </div>
                  <span
                    className={`font-medium ${
                      location.pathname === item.to
                        ? "text-cyan-300"
                        : "text-gray-300 group-hover:text-white"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Gamification Sections */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider px-6 mb-3">
              Gamification
            </h3>
            <div className="space-y-1 px-3">
              {gamificationSections.map((item, index) => (
                <Link
                  key={index}
                  to={item.to}
                  onClick={handleItemClick}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                    location.pathname === item.to
                      ? "bg-gradient-to-r from-cyan-700/30 to-pink-700/30 border-l-4 border-cyan-400"
                      : "hover:bg-gray-800/50"
                  }`}
                >
                  <div
                    className={
                      location.pathname === item.to
                        ? "text-cyan-400"
                        : "text-gray-400 group-hover:text-cyan-300"
                    }
                  >
                    {item.icon}
                  </div>
                  <span
                    className={`font-medium ${
                      location.pathname === item.to
                        ? "text-cyan-300"
                        : "text-gray-300 group-hover:text-white"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Expandable Community Section */}
          <div className="mb-6">
            <button
              onClick={() => toggleSubmenu('community')}
              className="flex items-center justify-between w-full px-6 py-3 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span className="text-xs font-semibold uppercase tracking-wider">Community</span>
              {activeSubmenu === 'community' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            
            {activeSubmenu === 'community' && (
              <div className="mt-2 px-3 space-y-1">
                <Link
                  to="/groups"
                  onClick={handleItemClick}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-cyan-300 transition-all duration-200 text-sm"
                >
                  <Users size={16} />
                  <span>Groups</span>
                </Link>
                <Link
                  to="/leaderboards"
                  onClick={handleItemClick}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-cyan-300 transition-all duration-200 text-sm"
                >
                  <Trophy size={16} />
                  <span>Leaderboards</span>
                </Link>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider px-6 mb-3">
              Recent Activity
            </h3>
            <div className="space-y-2 px-3">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="bg-gray-800 bg-opacity-40 rounded-lg p-3 border border-cyan-500/10"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="text-cyan-400">{activity.action} </span>
                        <span className="text-gray-300">{activity.item}</span>
                      </p>
                      <p className="text-xs text-cyan-300/70 mt-1">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="p-4 border-t border-cyan-500/20">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={toggleDarkMode}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800/50 transition-colors text-cyan-400 hover:text-cyan-300"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              <span className="text-sm">{darkMode ? "Light Mode" : "Dark Mode"}</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800/50 transition-colors text-pink-400 hover:text-pink-300"
            >
              <LogOut size={18} />
              <span className="text-sm">Logout</span>
            </button>
          </div>
          
          <div className="text-center text-xs text-cyan-500/60">
            FitTronix v2.0 • Cyber Edition
          </div>
        </div>
      </div>

      {/* Custom styles for neon effects */}
      <style jsx>{`
        .neon-glow {
          box-shadow: 0 0 5px rgba(34, 211, 238, 0.5),
                      0 0 10px rgba(34, 211, 238, 0.3),
                      0 0 15px rgba(34, 211, 238, 0.2);
        }
        
        .neon-glow-amber {
          box-shadow: 0 0 5px rgba(245, 158, 11, 0.5),
                      0 0 10px rgba(245, 158, 11, 0.3);
        }
        
        .sidebar-item:hover {
          box-shadow: inset 0 0 10px rgba(34, 211, 238, 0.2);
        }
      `}</style>
    </>
  );
};

export default FitTronixSidebar;