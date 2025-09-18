import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

function Navbar({ toggleSidebar }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [message, setMessage] = useState("");
  const lastScrollY = useRef(0);

  // form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // check authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setIsAdmin(userData.role === "admin");
          setUserData(userData);
          
          // Generate mock notifications
          const mockNotifications = [
            {
              id: 1,
              title: "Welcome to FitTronix!",
              message: "Your account has been created successfully.",
              time: "2 hours ago",
              read: false,
              type: "info"
            },
            {
              id: 2,
              title: "New Workout Plan Available",
              message: "Check out your personalized workout plan.",
              time: "1 day ago",
              read: false,
              type: "workout"
            },
            {
              id: 3,
              title: "Weekly Progress Report",
              message: "You've completed 80% of your weekly goals!",
              time: "3 days ago",
              read: true,
              type: "progress"
            }
          ];
          setNotifications(mockNotifications);
        }
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUserData(null);
        setNotifications([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Check for saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      if (e.matches && !savedTheme) {
        setDarkMode(true);
        document.documentElement.classList.add("dark");
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // hide/show on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY.current && window.scrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = window.scrollY;
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with name
      await updateProfile(userCredential.user, {
        displayName: name
      });
      
      // Force all new users to "user" role for security
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        name,
        role: "user", // Force user role for all new signups
        createdAt: new Date(),
        lastLogin: new Date(),
        preferences: {
          theme: "light",
          notifications: true
        }
      });
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const docRef = doc(db, "users", userCred.user.uid);
      const docSnap = await getDoc(docRef);
      
      // Update last login time
      if (docSnap.exists()) {
        await updateDoc(docRef, {
          lastLogin: new Date()
        });
      }
      
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Check your inbox.");
      setError("");
      setTimeout(() => {
        setShowForgotPassword(false);
        setMessage("");
      }, 3000);
    } catch (err) {
      setError(err.message);
      setMessage("");
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setError("");
    setMessage("");
  };

  const handleLogout = () => {
    signOut(auth);
    setShowProfileMenu(false);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ 
      ...notification, 
      read: true 
    })));
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Close modal when clicking outside
  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowModal(false);
      setShowForgotPassword(false);
      resetForm();
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 w-full flex items-center justify-between px-4 md:px-6 py-3 
        bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg shadow-lg border-b border-gray-200 dark:border-gray-700 z-50 transition-all duration-500 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Left section: Hamburger & Logo */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-bold shadow-md hover:scale-105 transition"
          >
            ☰
          </button>

          <div className="flex items-center space-x-3">
            <img src="/logo192.png" alt="FitTronix Logo" className="h-8 w-8 drop-shadow-[0_0_6px_cyan]" />
            <h1 className="text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">
              FitTronix
            </h1>
          </div>
        </div>

        {/* Center: Search Bar (visible on larger screens) */}
        <div className="hidden lg:flex items-center flex-1 max-w-xl mx-6">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search workouts, nutrition, etc..."
              className="w-full px-4 py-2 pl-10 bg-gray-100 dark:bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg 
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Right section: Navigation & Auth */}
        <div className="flex items-center space-x-4">
          {/* Navigation Links (visible on medium screens and up) */}
          <ul className="hidden md:flex space-x-6 font-medium">
            <li><a href="#home" className="text-gray-700 dark:text-gray-300 hover:text-cyan-500 transition">Home</a></li>
            <li><a href="#about" className="text-gray-700 dark:text-gray-300 hover:text-cyan-500 transition">About</a></li>
            <li><a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-cyan-500 transition">Features</a></li>
            <li><a href="#contact" className="text-gray-700 dark:text-gray-300 hover:text-cyan-500 transition">Contact</a></li>
          </ul>

          {/* Search Button (visible on small screens) */}
          <button 
            className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-cyan-500"
            onClick={() => setShowSearch(!showSearch)}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Dark Mode Toggle */}
          <button 
            className="p-2 text-gray-700 dark:text-gray-300 hover:text-cyan-500"
            onClick={toggleDarkMode}
          >
            {darkMode ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Notifications */}
          {isAuthenticated && (
            <div className="relative">
              <button 
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-cyan-500 relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-gray-800 dark:text-white">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-gray-500 text-center">No notifications</p>
                    ) : (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 ${notification.read ? 'bg-gray-50 dark:bg-gray-750' : 'bg-blue-50 dark:bg-blue-900/20'}`}
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-800 dark:text-white">{notification.title}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
                            </div>
                            <span className="text-xs text-gray-500">{notification.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                    <button 
                      className="w-full text-center py-2 text-sm text-cyan-500 hover:text-cyan-600"
                      onClick={markAllAsRead}
                    >
                      Mark all as read
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Auth/Profile */}
          {!isAuthenticated ? (
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-xl shadow-md font-bold hover:scale-105 transition text-white"
            >
              Sign In
            </button>
          ) : (
            <div className="relative">
              <button 
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <img 
                  src={userData?.photoURL || "/profile.png"} 
                  alt="Profile" 
                  className="h-8 w-8 rounded-full border-2 border-cyan-400" 
                />
                <span className="hidden md:inline text-gray-700 dark:text-gray-300">
                  {userData?.name || (isAdmin ? "Admin" : "User")}
                </span>
                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <p className="font-medium text-gray-800 dark:text-white">{userData?.name || "User"}</p>
                    <p className="text-sm text-gray-500">{userData?.email}</p>
                  </div>
                  <div className="p-2">
                    <a href={isAdmin ? "/admin/dashboard" : "/dashboard"} className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                      Dashboard
                    </a>
                    <a href="/profile" className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                      Profile Settings
                    </a>
                    <a href="/help" className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                      Help & Support
                    </a>
                  </div>
                  <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Search Bar (appears below navbar when toggled) */}
      {showSearch && (
        <div className="fixed top-16 left-0 right-0 bg-white dark:bg-gray-800 p-3 shadow-md z-40 lg:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Search workouts, nutrition, etc..."
              className="w-full px-4 py-2 pl-10 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg 
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[999]"
          onClick={handleModalClick}
        >
          <div 
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4 text-center text-cyan-600 dark:text-cyan-400">
              {isLogin ? "Login to FitTronix" : "Create an Account"}
            </h2>
            {error && <p className="text-red-500 mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm">{error}</p>}
            {message && <p className="text-green-500 mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm">{message}</p>}
            
            <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-lg font-bold text-white shadow-md hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isLogin ? "Logging in..." : "Creating account..."}
                    </div>
                  ) : (
                    isLogin ? "Login" : "Create Account"
                  )}
                </button>
              </form>
              
              {isLogin && (
                <div className="mt-4 text-center">
                  <button 
                    className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot your password?
                  </button>
                </div>
              )}
              
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button 
                    className="text-cyan-600 dark:text-cyan-400 font-medium hover:underline" 
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError("");
                      setMessage("");
                    }}
                  >
                    {isLogin ? "Sign up now" : "Log in"}
                  </button>
                </p>
              </div>
              
              <button
                className="mt-4 w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                onClick={() => {
                  setShowModal(false);
                  setShowForgotPassword(false);
                  resetForm();
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div 
            className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[999]"
            onClick={() => {
              setShowForgotPassword(false);
              resetForm();
            }}
          >
            <div 
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4 text-center text-cyan-600 dark:text-cyan-400">Reset Password</h2>
              {error && <p className="text-red-500 mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm">{error}</p>}
              {message && <p className="text-green-500 mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm">{message}</p>}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <button
                  onClick={handleForgotPassword}
                  className="w-full py-3 bg-cyan-500 rounded-lg font-bold text-white shadow-md hover:scale-[1.02] transition"
                >
                  Send Reset Link
                </button>
              </div>
              
              <button
                className="mt-4 w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                onClick={() => setShowForgotPassword(false)}
              >
                Back to Login
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  export default Navbar;