import React, { useState, useEffect, useMemo,useRef } from "react";
import { 
  Home, 
  Info, 
  Dumbbell, 
  Phone, 
  BarChart3, 
  User, 
  X, 
  Settings, 
  Heart, 
  Calendar,
  Award,
  BookOpen,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  Activity,
  Users,
  ChevronDown,
  ChevronUp,
  Star,
  Target
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";



// Move constants outside component for better performance
const QUICK_STATS = [
  { label: "Workouts", value: "12", change: "+2", positive: true },
  { label: "Active Days", value: "5/7", change: "+1", positive: true },
  { label: "Calories", value: "12.4k", change: "-0.8k", positive: false },
];

const RECENT_ACTIVITIES = [
  { action: "Completed", item: "Upper Body Workout", time: "2 hours ago" },
  { action: "Logged", item: "Breakfast: 450 cal", time: "4 hours ago" },
  { action: "Set a new", item: "Personal Record", time: "1 day ago" },
];

function Sidebar({ isOpen, setIsOpen, user, onLogout }) {
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const sidebarRef = useRef(null);
  
  // Sync dark mode with localStorage and document class
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Apply dark mode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);
useEffect(() => {
  function handleClickOutside(event) {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      // Clicked outside the sidebar
      setIsOpen(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [setIsOpen]);

 

  // Memoize navigation items for better performance
  const navItems = useMemo(() => [
    { label: "Home", href: "/", icon: <Home size={20} />, type: "link" },
    { label: "About", href: "#about", icon: <Info size={20} />, type: "link" },
    { label: "Features", href: "#features", icon: <Dumbbell size={20} />, type: "link" },
    { label: "Contact", href: "#contact", icon: <Phone size={20} />, type: "link" },
  ], []);

  const routeItems = useMemo(() => [
    { label: "Dashboard", to: "/dashboard", icon: <BarChart3 size={20} />, type: "route" },
    { label: "Profile", to: "/profile", icon: <User size={20} />, type: "route" },
    { label: "Workouts", to: "/workouts", icon: <Activity size={20} />, type: "route" },
    { label: "Nutrition", to: "/nutrition", icon: <Heart size={20} />, type: "route" },
    { label: "Schedule", to: "/schedule", icon: <Calendar size={20} />, type: "route" },
    { label: "Goals", to: "/goals", icon: <Target size={20} />, type: "route" },
  ], []);

  const communityItems = useMemo(() => [
    { label: "Community", to: "/community", icon: <Users size={20} />, type: "route" },
    { label: "Challenges", to: "/challenges", icon: <Award size={20} />, type: "route" },
  ], []);

  const resourcesItems = useMemo(() => [
    { label: "Blog", to: "/blog", icon: <BookOpen size={20} />, type: "route" },
    { label: "Help Center", to: "/help", icon: <HelpCircle size={20} />, type: "route" },
  ], []);

  const toggleSubmenu = (menuName) => {
    setActiveSubmenu(activeSubmenu === menuName ? null : menuName);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const handleItemClick = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      

      {/* Sidebar */}
      <div
  ref={sidebarRef}  // <- Add this
  className={`fixed top-0 left-0 h-full text-white shadow-2xl flex flex-col 
    transition-all duration-300 z-40 overflow-y-auto
    bg-gradient-to-b from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900
    border-r border-gray-700
    ${isOpen ? "translate-x-0 w-80" : "-translate-x-full w-80"}`}
  onClick={(e) => e.stopPropagation()} // Prevent click propagation to overlay
>

        {/* Header with close button */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-lg">
              <Dumbbell size={24} />
            </div>
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
              FitTronix
            </h2>
          </div>
          <button
            onClick={closeSidebar}
            className="p-1 rounded-full hover:bg-gray-700 transition-colors lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Profile Section */}
        {user ? (
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <img 
                  src={user.photoURL || "/profile.png"} 
                  alt={user.name || "User"} 
                  className="h-12 w-12 rounded-full border-2 border-cyan-500"
                />
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{user.name || "User"}</p>
                <p className="text-sm text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {QUICK_STATS.map((stat, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-400">{stat.label}</p>
                  <p className="font-bold text-sm">{stat.value}</p>
                  <p className={`text-xs ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.change}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Premium Status */}
            <div className="bg-gradient-to-r from-amber-600 to-amber-800 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star size={16} className="text-amber-200" />
                <span className="text-sm font-medium">Premium Member</span>
              </div>
              <button 
                className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
                aria-label="Upgrade account"
              >
                Upgrade
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 border-b border-gray-700 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-12 w-12 bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="flex-1 py-6 px-4 overflow-y-auto">
          {/* Primary Navigation */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-3 mb-3">Navigation</h3>
            <div className="space-y-1">
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  onClick={handleItemClick}
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg 
                    hover:bg-gray-700/50 transition-all duration-200 group"
                >
                  <div className="text-cyan-400 group-hover:text-cyan-300">
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* App Sections */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-3 mb-3">My Fitness</h3>
            <div className="space-y-1">
              {routeItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.to}
                  onClick={handleItemClick}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg 
                    transition-all duration-200 group
                    ${location.pathname === item.to 
                      ? 'bg-gradient-to-r from-cyan-700/30 to-pink-700/30 border-l-4 border-cyan-400' 
                      : 'hover:bg-gray-700/50'}`}
                >
                  <div className={`${location.pathname === item.to ? 'text-cyan-400' : 'text-gray-400 group-hover:text-cyan-300'}`}>
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Community Section with expandable submenu */}
          <div className="mb-6">
            <button
              onClick={() => toggleSubmenu('community')}
              className="flex items-center justify-between w-full px-3 py-3 rounded-lg hover:bg-gray-700/50 transition-all duration-200"
              aria-label="Toggle Community Submenu"
            >
              <div className="flex items-center space-x-3">
                <Users size={20} className="text-gray-400" />
                <span className="font-medium">Community</span>
              </div>
              {activeSubmenu === 'community' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            <div className={`ml-9 mt-1 space-y-1 transition-all duration-300 ease-in-out ${activeSubmenu === 'community' ? 'max-h-96' : 'max-h-0 overflow-hidden'}`}>
              {communityItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.to}
                  onClick={handleItemClick}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg 
                    transition-all duration-200 block text-sm
                    ${location.pathname === item.to 
                      ? "bg-cyan-700/30 text-cyan-400" 
                      : "hover:bg-gray-700/50 text-gray-300"}`}
                >
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Resources Section with expandable submenu */}
          <div className="mb-6">
            <button
              onClick={() => toggleSubmenu('resources')}
              className="flex items-center justify-between w-full px-3 py-3 rounded-lg hover:bg-gray-700/50 transition-all duration-200"
              aria-label="Toggle Resources Submenu"
            >
              <div className="flex items-center space-x-3">
                <BookOpen size={20} className="text-gray-400" />
                <span className="font-medium">Resources</span>
              </div>
              {activeSubmenu === 'resources' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            <div className={`ml-9 mt-1 space-y-1 transition-all duration-300 ease-in-out ${activeSubmenu === 'resources' ? 'max-h-96' : 'max-h-0 overflow-hidden'}`}>
              {resourcesItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.to}
                  onClick={handleItemClick}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg 
                    transition-all duration-200 block text-sm
                    ${location.pathname === item.to 
                      ? "bg-cyan-700/30 text-cyan-400" 
                      : "hover:bg-gray-700/50 text-gray-300"}`}
                >
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-3 mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {RECENT_ACTIVITIES.map((activity, index) => (
                <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="text-cyan-400">{activity.action} </span>
                        <span>{activity.item}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </nav>

        {/* Footer Section */}
<div className="p-2 border-t border-gray-700 flex justify-between items-center">
  {/* Settings */}
  <Link
    to="/settings"
    onClick={handleItemClick}
    className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-700/50 transition text-sm"
    aria-label="Settings"
  >
    <Settings size={16} />
    <span>Settings</span>
  </Link>

  {/* Logout/Login */}
  {user ? (
    <button
      onClick={onLogout}
      className="flex items-center space-x-1 px-4 py-2 rounded hover:bg-red-900/50 transition text-sm text-red-400"
      aria-label="Logout"
    >
      <LogOut size={17} />
      <span>Logout</span>
    </button>
  ) : (
    <Link
      to="/login"
      onClick={handleItemClick}
      className="flex items-center space-x-1 px-4 py-1=2 rounded hover:bg-cyan-900/50 transition text-sm text-cyan-400"
      aria-label="Login"
    >
      <User size={17} />
      <span>Login</span>
    </Link>
  )}
</div>

      </div>
    </>
  );
}

export default Sidebar;