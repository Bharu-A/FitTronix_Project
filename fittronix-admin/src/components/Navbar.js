import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,getIdTokenResult 
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  onSnapshot,
  writeBatch
} from "firebase/firestore";
import { scrollToHash } from "../utils/scrollToHash";
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // 🔹 1. Force refresh token so we get latest custom claims
          const tokenResult = await getIdTokenResult(firebaseUser, true);

          // 🔹 2. Default role is "user"
          let role = "user";

          if (tokenResult.claims.admin) {
            role = "admin"; // from custom claim
          } else {
            // 🔹 3. Fallback to Firestore role if available
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            if (userDoc.exists() && userDoc.data().role === "admin") {
              role = "admin";
            }
          }

          // 🔹 4. Merge all user info
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || "User",
            photoURL: firebaseUser.photoURL || "/profile.png",
            role,
            profileCompleted: false,
          });
        } catch (error) {
          console.error("Error fetching user/claims:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
};
// Custom hook for notifications
const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("read", "==", false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(notificationsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, "notifications", notificationId), {
        read: true,
        readAt: new Date()
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (notifications.length === 0) return;

    const batch = writeBatch(db);
    notifications.forEach(notification => {
      const notificationRef = doc(db, "notifications", notification.id);
      batch.update(notificationRef, {
        read: true,
        readAt: new Date()
      });
    });

    try {
      await batch.commit();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return { notifications, loading, markAsRead, markAllAsRead };
};

// Auth Modal Component
const AuthModal = ({ 
  showModal, 
  setShowModal, 
  isLogin, 
  setIsLogin, 
  showForgotPassword, 
  setShowForgotPassword 
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: ""
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = useCallback(() => {
    setFormData({ email: "", password: "", name: "" });
    setError("");
    setMessage("");
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError("");
    if (message) setMessage("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      await updateProfile(userCredential.user, {
        displayName: formData.name
      });
      
      const userData = {
        email: formData.email,
        name: formData.name,
        role: "user",
        profileCompleted: false,
        createdAt: new Date(),
        lastLogin: new Date(),
        preferences: {
          theme: "light",
          notifications: true
        }
      };

      await setDoc(doc(db, "users", userCredential.user.uid), userData);
      
      navigate("/complete-profile");
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(getAuthErrorMessage(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      await updateDoc(doc(db, "users", userCred.user.uid), {
        lastLogin: new Date()
      });
      
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(getAuthErrorMessage(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError("Please enter your email address first.");
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth, formData.email);
      setMessage("Password reset email sent! Check your inbox.");
      setError("");
      setTimeout(() => {
        setShowForgotPassword(false);
        setMessage("");
      }, 3000);
    } catch (err) {
      setError(getAuthErrorMessage(err.code));
      setMessage("");
    }
  };

  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowModal(false);
      setShowForgotPassword(false);
      resetForm();
    }
  };

  const getAuthErrorMessage = (errorCode) => {
    const errorMessages = {
      "auth/email-already-in-use": "An account with this email already exists.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/weak-password": "Password should be at least 6 characters.",
      "auth/user-not-found": "No account found with this email.",
      "auth/wrong-password": "Incorrect password.",
      "auth/too-many-requests": "Too many attempts. Please try again later.",
      "auth/network-request-failed": "Network error. Please check your connection."
    };
    return errorMessages[errorCode] || "An error occurred. Please try again.";
  };

  if (showForgotPassword) {
    return (
      <ModalOverlay onClick={handleModalClick}>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center text-cyan-600 dark:text-cyan-400">
            Reset Password
          </h2>
          {error && <ErrorMessage message={error} />}
          {message && <SuccessMessage message={message} />}
          
          <div className="space-y-4">
            <FormInput
              label="Email Address"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(value) => handleInputChange("email", value)}
              required
            />
            
            <SubmitButton
              onClick={handleForgotPassword}
              loading={isLoading}
              text="Send Reset Link"
            />
          </div>
          
          <button
            className="mt-4 w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            onClick={() => setShowForgotPassword(false)}
          >
            Back to Login
          </button>
        </div>
      </ModalOverlay>
    );
  }

  if (!showModal) return null;

  return (
    <ModalOverlay onClick={handleModalClick}>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center text-cyan-600 dark:text-cyan-400">
          {isLogin ? "Login to FitTronix" : "Create an Account"}
        </h2>
        {error && <ErrorMessage message={error} />}
        {message && <SuccessMessage message={message} />}
        
        <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
          {!isLogin && (
            <FormInput
              label="Full Name"
              type="text"
              placeholder="Your Name"
              value={formData.name}
              onChange={(value) => handleInputChange("name", value)}
              required={!isLogin}
            />
          )}
          
          <FormInput
            label="Email Address"
            type="email"
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={(value) => handleInputChange("email", value)}
            required
          />
          
          <FormInput
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(value) => handleInputChange("password", value)}
            required
          />
          
          <SubmitButton
            type="submit"
            loading={isLoading}
            text={isLogin ? "Login" : "Create Account"}
          />
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
        
        <AuthSwitch
          isLogin={isLogin}
          setIsLogin={setIsLogin}
          setError={setError}
          setMessage={setMessage}
        />
        
        <button
          className="mt-4 w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          onClick={() => {
            setShowModal(false);
            resetForm();
          }}
        >
          Close
        </button>
      </div>
    </ModalOverlay>
  );
};

// Reusable Components
const ModalOverlay = ({ children, onClick }) => (
  <div 
    className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[999]"
    onClick={onClick}
  >
    {children}
  </div>
);

const ErrorMessage = ({ message }) => (
  <p className="text-red-500 mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm">
    {message}
  </p>
);

const SuccessMessage = ({ message }) => (
  <p className="text-green-500 mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm">
    {message}
  </p>
);

const FormInput = ({ label, type, placeholder, value, onChange, required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
    />
  </div>
);

const SubmitButton = ({ type = "button", loading, text, onClick }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={loading}
    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-lg font-bold text-white shadow-md hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {loading ? (
      <div className="flex items-center justify-center">
        <LoadingSpinner />
        {text}...
      </div>
    ) : (
      text
    )}
  </button>
);

const LoadingSpinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const AuthSwitch = ({ isLogin, setIsLogin, setError, setMessage }) => (
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
);

// Main Navbar Component
function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { notifications, markAsRead, markAllAsRead } = useNotifications(user?.uid);
  
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const lastScrollY = useRef(0);

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    const theme = savedTheme || (systemDark ? "dark" : "light");
    setDarkMode(theme === "dark");
    
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Scroll behavior
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

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    // Update user preference if logged in
    if (user) {
      updateDoc(doc(db, "users", user.uid), {
        "preferences.theme": newDarkMode ? "dark" : "light"
      }).catch(console.error);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setShowProfileMenu(false);
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
    setShowNotifications(false);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  if (authLoading) {
    return (
      <nav className="fixed top-0 left-0 w-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-32 rounded"></div>
        </div>
      </nav>
    );
  }

  const isAuthenticated = !!user;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full flex items-center justify-between px-4 md:px-6 py-3 
        bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg shadow-lg border-b border-gray-200 dark:border-gray-700 z-50 transition-all duration-500 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-bold shadow-md hover:scale-105 transition"
            aria-label="Toggle sidebar"
          >
            ☰
          </button>

          <Logo />
        </div>

        {/* Center: Search Bar */}
        <SearchBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showSearch={showSearch}
          setShowSearch={setShowSearch}
        />

        {/* Right section */}
        <div className="flex items-center space-x-4">
          <NavigationLinks />
          
          <SearchToggle 
            setShowSearch={setShowSearch}
            showSearch={showSearch}
          />
          
          <ThemeToggle 
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />
          
          {isAuthenticated && (
            <Notifications 
              notifications={notifications}
              showNotifications={showNotifications}
              setShowNotifications={setShowNotifications}
              unreadCount={unreadNotificationsCount}
              onNotificationClick={handleNotificationClick}
              onMarkAllAsRead={markAllAsRead}
            />
          )}
          
          <AuthProfile 
            isAuthenticated={isAuthenticated}
            user={user}
            showProfileMenu={showProfileMenu}
            setShowProfileMenu={setShowProfileMenu}
            setShowModal={setShowModal}
            handleLogout={handleLogout}
          />
        </div>
      </nav>

      {/* Mobile Search Bar */}
      <MobileSearch 
        showSearch={showSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Auth Modal */}
      <AuthModal
        showModal={showModal}
        setShowModal={setShowModal}
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        showForgotPassword={showForgotPassword}
        setShowForgotPassword={setShowForgotPassword}
      />
    </>
  );
}

// Sub-components for better organization
const Logo = () => (
  <div className="flex items-center space-x-2 md:space-x-3 px-4 h-12 md:h-16">
    <img
      src="/assests/logo.png"
      alt="FitTronix Logo"
      className="h-8 w-8 md:h-10 md:w-10 drop-shadow-[0_0_6px_cyan]"
    />
    <h1 className="text-lg md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 whitespace-nowrap">
      FitTronix
    </h1>
  </div>
);

const NavigationLinks = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path, hash) => {
    if (location.pathname === "/") {
      // Already on home page, just scroll
      scrollToHash(hash);
    } else {
      // Navigate to home page, then scroll after a slight delay
      navigate(path);
      setTimeout(() => scrollToHash(hash), 100); // wait for DOM
    }
  };
return (
    <ul className="hidden md:flex space-x-6 font-medium">
      <li>
        <button
          className="text-gray-700 dark:text-gray-300 hover:text-cyan-500 transition"
          onClick={() => handleNavigation("/", "#home")}
        >
          Home
        </button>
      </li>
      <li>
        <button
          className="text-gray-700 dark:text-gray-300 hover:text-cyan-500 transition"
          onClick={() => handleNavigation("/", "#about")}
        >
          About
        </button>
      </li>
      <li>
        <button
          className="text-gray-700 dark:text-gray-300 hover:text-cyan-500 transition"
          onClick={() => handleNavigation("/", "#features")}
        >
          Features
        </button>
      </li>
      <li>
        <button
          className="text-gray-700 dark:text-gray-300 hover:text-cyan-500 transition"
          onClick={() => handleNavigation("/", "#contact")}
        >
          Contact
        </button>
      </li>
    </ul>
  );
};
const SearchBar = ({ searchQuery, setSearchQuery, showSearch, setShowSearch }) => (
  <div className="hidden lg:flex items-center flex-1 max-w-xl mx-6">
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Search workouts, nutrition, etc..."
        className="w-full px-4 py-2 pl-10 bg-gray-100 dark:bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <SearchIcon />
    </div>
  </div>
);

const SearchToggle = ({ setShowSearch, showSearch }) => (
  <button 
    className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-cyan-500"
    onClick={() => setShowSearch(!showSearch)}
    aria-label="Toggle search"
  >
    <SearchIcon />
  </button>
);

const SearchIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ThemeToggle = ({ darkMode, toggleDarkMode }) => (
  <button 
    className="p-2 text-gray-700 dark:text-gray-300 hover:text-cyan-500"
    onClick={toggleDarkMode}
    aria-label="Toggle dark mode"
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
);

const Notifications = ({ 
  notifications, 
  showNotifications, 
  setShowNotifications, 
  unreadCount, 
  onNotificationClick,
  onMarkAllAsRead 
}) => (
  <div className="relative">
    <button 
      className="p-2 text-gray-700 dark:text-gray-300 hover:text-cyan-500 relative"
      onClick={() => setShowNotifications(!showNotifications)}
      aria-label="Notifications"
    >
      <NotificationIcon />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </button>

    {showNotifications && (
      <NotificationDropdown
        notifications={notifications}
        onNotificationClick={onNotificationClick}
        onMarkAllAsRead={onMarkAllAsRead}
        onClose={() => setShowNotifications(false)}
      />
    )}
  </div>
);

const NotificationIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const NotificationDropdown = ({ notifications, onNotificationClick, onMarkAllAsRead, onClose }) => (
  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl z-50">
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
      <h3 className="font-bold text-gray-800 dark:text-white">Notifications</h3>
      {notifications.length > 0 && (
        <button 
          className="text-sm text-cyan-500 hover:text-cyan-600"
          onClick={onMarkAllAsRead}
        >
          Mark all read
        </button>
      )}
    </div>
    <div className="max-h-96 overflow-y-auto">
      {notifications.length === 0 ? (
        <p className="p-4 text-gray-500 text-center">No notifications</p>
      ) : (
        notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClick={onNotificationClick}
          />
        ))
      )}
    </div>
  </div>
);

const NotificationItem = ({ notification, onClick }) => (
  <div 
    className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 ${
      notification.read ? 'bg-gray-50 dark:bg-gray-750' : 'bg-blue-50 dark:bg-blue-900/20'
    }`}
    onClick={() => onClick(notification)}
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="font-medium text-gray-800 dark:text-white">{notification.title}</p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
      </div>
      <span className="text-xs text-gray-500">
        {new Date(notification.createdAt?.toDate()).toLocaleDateString()}
      </span>
    </div>
  </div>
);

const AuthProfile = ({ 
  isAuthenticated, 
  user, 
  showProfileMenu, 
  setShowProfileMenu, 
  setShowModal, 
  handleLogout 
}) => {
  if (!isAuthenticated) {
    return (
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-xl shadow-md font-bold hover:scale-105 transition text-white"
      >
        Sign In
      </button>
    );
  }

  return (
    <div className="relative">
      <button 
        className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        onClick={() => setShowProfileMenu(!showProfileMenu)}
        aria-label="Profile menu"
      >
        <img 
          src={user?.photoURL || "/profile.png"} 
          alt="Profile" 
          className="h-8 w-8 rounded-full border-2 border-cyan-400" 
        />
        <span className="hidden md:inline text-gray-700 dark:text-gray-300">
          {user?.name || (user?.role === "admin" ? "Admin" : "User")}
        </span>
        <ChevronDownIcon />
      </button>
      
      {showProfileMenu && (
    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50">
    <div className="px-4 py-3">
      <p className="text-sm font-medium text-gray-800 dark:text-white">
        {user?.name || "User"}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
        {user?.email}
      </p>
    </div>
    <div className="border-t border-gray-200 dark:border-gray-700">
      <button
        onClick={() => {
          setShowProfileMenu(false);
          // Example: navigate to profile
          // navigate("/profile");
        }}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        My Profile
      </button>
      <button
        onClick={handleLogout}
        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        Logout
      </button>
    </div>
  </div>
)}

    </div>
  );
};

const ChevronDownIcon = () => (
  <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ProfileDropdown = ({ user, handleLogout, onClose }) => (
  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl z-50">
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <p className="font-medium text-gray-800 dark:text-white">{user?.name || "User"}</p>
      <p className="text-sm text-gray-500">{user?.email}</p>
      {user?.role === "admin" && (
        <span className="inline-block mt-1 px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full">
          Admin
        </span>
      )}
    </div>
    <div className="p-2">
      <DropdownLink href={user?.role === "admin" ? "/admin/dashboard" : "/dashboard"} onClick={onClose}>
        Dashboard
      </DropdownLink>
      <DropdownLink href="/profile" onClick={onClose}>
        Profile Settings
      </DropdownLink>
      <DropdownLink href="/help" onClick={onClose}>
        Help & Support
      </DropdownLink>
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
);

const DropdownLink = ({ href, onClick, children }) => (
  <a 
    href={href} 
    className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
    onClick={onClick}
  >
    {children}
  </a>
);

const MobileSearch = ({ showSearch, searchQuery, setSearchQuery }) => {
  if (!showSearch) return null;

  return (
    <div className="fixed top-16 left-0 right-0 bg-white dark:bg-gray-800 p-3 shadow-md z-40 lg:hidden">
      <div className="relative">
        <input
          type="text"
          placeholder="Search workouts, nutrition, etc..."
          className="w-full px-4 py-2 pl-10 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <SearchIcon />
      </div>
    </div>
  );
};

export default Navbar;