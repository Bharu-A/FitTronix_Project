// src/components/Navbar.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  getIdTokenResult,
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
  writeBatch,
} from "firebase/firestore";
import { scrollToHash } from "../utils/scrollToHash";

/* -------------------------
  Custom hooks (kept inside file for single-file option)
   - useAuth: handles auth state, creates user doc if missing, sets role
   - useNotifications: subscribes to unread notifications for current user
   These are memoized/async-safe to reduce re-renders and race conditions.
   ------------------------- */

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return;
      setLoading(true);

      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Refresh token to get latest custom claims
        const tokenResult = await getIdTokenResult(firebaseUser, true);
        let role = "user";

        const userRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          await setDoc(userRef, {
            email: firebaseUser.email,
            name: firebaseUser.displayName || "User",
            role: "user",
            photoURL: firebaseUser.photoURL || "/profile.png",
            profileCompleted: false,
            createdAt: new Date(),
            lastLogin: new Date(),
            preferences: { theme: "light", notifications: true },
          });
        } else {
          // Update lastLogin non-blocking
          updateDoc(userRef, { lastLogin: new Date() }).catch(() => {});
        }

        if (tokenResult?.claims?.admin) {
          role = "admin";
        } else {
          const freshSnap = await getDoc(userRef);
          if (freshSnap.exists() && freshSnap.data().role === "admin") {
            role = "admin";
          }
        }

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || "User",
          photoURL: firebaseUser.photoURL || "/profile.png",
          role,
          profileCompleted: false,
        });
      } catch (err) {
        console.error("useAuth error:", err);
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return useMemo(() => ({ user, loading }), [user, loading]);
};

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

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setNotifications(data);
        setLoading(false);
      },
      (err) => {
        console.error("notifications snapshot error:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await updateDoc(doc(db, "notifications", notificationId), {
        read: true,
        readAt: new Date(),
      });
    } catch (err) {
      console.error("markAsRead error:", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!notifications.length) return;
    const batch = writeBatch(db);
    notifications.forEach((n) => {
      const ref = doc(db, "notifications", n.id);
      batch.update(ref, { read: true, readAt: new Date() });
    });
    try {
      await batch.commit();
    } catch (err) {
      console.error("markAllAsRead error:", err);
    }
  }, [notifications]);

  return { notifications, loading, markAsRead, markAllAsRead };
};

/* -------------------------
  Small presentational subcomponents:
  - ModalOverlay, FormInput, SubmitButton, LoadingSpinner, small icons
  Keep them simple and pure to avoid re-renders.
  ------------------------- */

const ModalOverlay = ({ children, onClick }) => (
  <div
    className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[999]"
    onMouseDown={onClick}
  >
    {children}
  </div>
);

const ErrorMessage = ({ message }) =>
  message ? (
    <p className="text-red-500 mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm">
      {message}
    </p>
  ) : null;

const SuccessMessage = ({ message }) =>
  message ? (
    <p className="text-green-500 mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm">
      {message}
    </p>
  ) : null;

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
      autoComplete={type === "password" ? "current-password" : "email"}
    />
  </div>
);

const LoadingSpinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
  </svg>
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

/* -------------------------
  AuthModal: consolidated, uses callbacks, prevents stale state
  ------------------------- */

const AuthModal = ({ showModal, setShowModal, isLogin, setIsLogin, showForgotPassword, setShowForgotPassword }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // reset form when modal opens/closes
  useEffect(() => {
    if (!showModal && !showForgotPassword) {
      setFormData({ email: "", password: "", name: "" });
      setError("");
      setMessage("");
      setIsLoading(false);
    }
  }, [showModal, showForgotPassword]);

  const handleInputChange = useCallback((field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
    if (error) setError("");
    if (message) setMessage("");
  }, [error, message]);

  const getAuthErrorMessage = useCallback((errorCode) => {
    const errorMessages = {
      "auth/email-already-in-use": "An account with this email already exists.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/weak-password": "Password should be at least 6 characters.",
      "auth/user-not-found": "No account found with this email.",
      "auth/wrong-password": "Incorrect password.",
      "auth/too-many-requests": "Too many attempts. Please try again later.",
      "auth/network-request-failed": "Network error. Please check your connection.",
    };
    return errorMessages[errorCode] || "An error occurred. Please try again.";
  }, []);

  const handleSignup = useCallback(
    async (e) => {
      e?.preventDefault();
      setError("");
      setMessage("");
      setIsLoading(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(userCredential.user, { displayName: formData.name });
        const userData = {
          email: formData.email,
          name: formData.name,
          role: "user",
          profileCompleted: false,
          createdAt: new Date(),
          lastLogin: new Date(),
          preferences: { theme: "light", notifications: true },
        };
        await setDoc(doc(db, "users", userCredential.user.uid), userData);
        navigate("/complete-profile");
        setShowModal(false);
      } catch (err) {
        setError(getAuthErrorMessage(err.code));
      } finally {
        setIsLoading(false);
      }
    },
    [formData, navigate, getAuthErrorMessage, setShowModal]
  );

  const handleLogin = useCallback(
    async (e) => {
      e?.preventDefault();
      setError("");
      setMessage("");
      setIsLoading(true);
      try {
        const userCred = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        // Update lastLogin
        updateDoc(doc(db, "users", userCred.user.uid), { lastLogin: new Date() }).catch(() => {});
        setShowModal(false);
      } catch (err) {
        setError(getAuthErrorMessage(err.code));
      } finally {
        setIsLoading(false);
      }
    },
    [formData, getAuthErrorMessage, setShowModal]
  );

  const handleForgotPassword = useCallback(async () => {
    if (!formData.email) {
      setError("Please enter your email address first.");
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, formData.email);
      setMessage("Password reset email sent! Check your inbox.");
      setError("");
      setTimeout(() => {
        setShowForgotPassword(false);
        setMessage("");
      }, 2500);
    } catch (err) {
      setError(getAuthErrorMessage(err.code));
      setMessage("");
    } finally {
      setIsLoading(false);
    }
  }, [formData.email, getAuthErrorMessage, setShowForgotPassword]);

  const handleModalClick = (e) => {
    // close only when clicking overlay (not inner content)
    if (e.target === e.currentTarget) {
      setShowModal(false);
      setShowForgotPassword(false);
    }
  };

  if (showForgotPassword) {
    return (
      <ModalOverlay onClick={handleModalClick}>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center text-cyan-600 dark:text-cyan-400">Reset Password</h2>
          <ErrorMessage message={error} />
          <SuccessMessage message={message} />
          <div className="space-y-4">
            <FormInput
              label="Email Address"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(v) => handleInputChange("email", v)}
              required
            />
            <SubmitButton onClick={handleForgotPassword} loading={isLoading} text="Send Reset Link" />
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
        <ErrorMessage message={error} />
        <SuccessMessage message={message} />

        <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
          {!isLogin && (
            <FormInput
              label="Full Name"
              type="text"
              placeholder="Your Name"
              value={formData.name}
              onChange={(v) => handleInputChange("name", v)}
              required={!isLogin}
            />
          )}

          <FormInput
            label="Email Address"
            type="email"
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={(v) => handleInputChange("email", v)}
            required
          />

          <FormInput
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(v) => handleInputChange("password", v)}
            required
          />

          <SubmitButton type="submit" loading={isLoading} text={isLogin ? "Login" : "Create Account"} />
        </form>

        {isLogin && (
          <div className="mt-4 text-center">
            <button className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline" onClick={() => setShowForgotPassword(true)}>
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
          }}
        >
          Close
        </button>
      </div>
    </ModalOverlay>
  );
};

/* -------------------------
  Main Navbar component (default export)
  - preserves layout and features
  - reduces re-renders using useMemo and stable callbacks
  ------------------------- */

export default function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { notifications, markAsRead, markAllAsRead } = useNotifications(user?.uid);

  // UI state
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

  // initialize theme only once
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved || (systemDark ? "dark" : "light");
    setDarkMode(theme === "dark");
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, []);

  // scroll hide/show - throttle via requestAnimationFrame
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > lastScrollY.current && window.scrollY > 100) {
            setIsVisible(false);
          } else {
            setIsVisible(true);
          }
          lastScrollY.current = window.scrollY;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDarkMode = useCallback(() => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    if (user?.uid) {
      updateDoc(doc(db, "users", user.uid), { "preferences.theme": newDark ? "dark" : "light" }).catch(() => {});
    }
  }, [darkMode, user?.uid]);

  const handleLogout = useCallback(() => {
    signOut(auth).catch((err) => console.error("signOut error:", err));
    setShowProfileMenu(false);
  }, []);

  const handleNotificationClick = useCallback(
    (notification) => {
      markAsRead(notification.id);
      if (notification.link) navigate(notification.link);
      setShowNotifications(false);
    },
    [markAsRead, navigate]
  );

  const unreadNotificationsCount = notifications?.filter((n) => !n.read).length || 0;

  // nav links click helper (keeps previous behavior)
  const handleNavigation = (path, hash) => {
  if (location.pathname === path) {
    scrollToHash(hash);
    return;
  }

  navigate(path, { state: { scrollTo: hash } });
};


  // small skeleton while auth initialises
  if (authLoading) {
    return (
      <nav className="fixed top-0 left-0 w-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-32 rounded"></div>
        </div>
      </nav>
    );
  }

  const isAuthenticated = Boolean(user);

  return (
    <>
      <nav
  className={`fixed top-0 left-0 w-full flex items-center justify-between px-4 md:px-6 py-3 
    bg-[#0A0F1F] shadow-lg border-b border-cyan-500/20 z-50 transition-all duration-500 ${
      isVisible ? "translate-y-0" : "-translate-y-full"
    }`}
>

        {/* Left: sidebar toggle + logo */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-bold shadow-md hover:scale-105 transition"
            aria-label="Toggle sidebar"
          >
            ☰
          </button>

          <div className="flex items-center space-x-2 md:space-x-3 px-4 h-12 md:h-16">
            <img src="/assests/logo.png" alt="FitTronix Logo" className="h-8 w-8 md:h-10 md:w-10 drop-shadow-[0_0_6px_cyan]" />
            <h1 className="text-lg md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 whitespace-nowrap">
              FitTronix
            </h1>
          </div>
        </div>

        {/* Center search (hidden on small screens) */}
        <div className="hidden lg:flex items-center flex-1 max-w-xl mx-6">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search workouts, nutrition, etc..."
              className="w-full px-4 py-2 pl-10 bg-gray-100 dark:bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Right: links + actions */}
        <div className="flex items-center space-x-4">
          <ul className="hidden md:flex space-x-6 font-medium">
            <li>
              <button className="text-gray-700 dark:text-gray-300 hover:text-cyan-500 transition" onClick={() => handleNavigation("/", "#home")}>
                Home
              </button>
            </li>
            <li>
              <button className="text-gray-700 dark:text-gray-300 hover:text-cyan-500 transition" onClick={() => handleNavigation("/", "#about")}>
                About
              </button>
            </li>
            <li>
              <button className="text-gray-700 dark:text-gray-300 hover:text-cyan-500 transition" onClick={() => handleNavigation("/", "#features")}>
                Features
              </button>
            </li>
            <li>
              <button className="text-gray-700 dark:text-gray-300 hover:text-cyan-500 transition" onClick={() => handleNavigation("/", "#contact")}>
                Contact
              </button>
            </li>
          </ul>

          {/* Mobile search toggle */}
          <button className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-cyan-500" onClick={() => setShowSearch((s) => !s)} aria-label="Toggle search">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Theme toggle */}
          <button className="p-2 text-gray-700 dark:text-gray-300 hover:text-cyan-500" onClick={toggleDarkMode} aria-label="Toggle dark mode">
            {darkMode ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Notifications */}
          {isAuthenticated && (
            <div className="relative">
              <button className="p-2 text-gray-700 dark:text-gray-300 hover:text-cyan-500 relative" onClick={() => setShowNotifications((s) => !s)} aria-label="Notifications">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 dark:text-white">Notifications</h3>
                    {notifications.length > 0 && (
                      <button className="text-sm text-cyan-500 hover:text-cyan-600" onClick={() => markAllAsRead()}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-gray-500 text-center">No notifications</p>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 ${
                            notification.read ? "bg-gray-50 dark:bg-gray-750" : "bg-blue-50 dark:bg-blue-900/20"
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-800 dark:text-white">{notification.title}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
                            </div>
                            <span className="text-xs text-gray-500">
                              {notification.createdAt?.toDate ? new Date(notification.createdAt.toDate()).toLocaleDateString() : ""}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Auth/Profile */}
          {!isAuthenticated ? (
            <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-xl shadow-md font-bold hover:scale-105 transition text-white">
              Sign In
            </button>
          ) : (
            <div className="relative">
              <button
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                onClick={() => setShowProfileMenu((s) => !s)}
                aria-label="Profile menu"
              >
                <img src={user?.photoURL || "/profile.png"} alt="Profile" className="h-8 w-8 rounded-full border-2 border-cyan-400" />
                <span className="hidden md:inline text-gray-700 dark:text-gray-300">{user?.name || (user?.role === "admin" ? "Admin" : "User")}</span>
                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50">
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{user?.name || "User"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <button onClick={() => { setShowProfileMenu(false); navigate(user?.role === "admin" ? "/admin/dashboard" : "/dashboard"); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Dashboard</button>
                    <button onClick={() => { setShowProfileMenu(false); navigate("/profile"); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">My Profile</button>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">Logout</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Search Bar */}
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
            <svg className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      )}

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
