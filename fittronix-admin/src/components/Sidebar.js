// src/components/Sidebar.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Home,
  Dumbbell,
  Calendar,
  Utensils,
  User,
  Bot,
  Settings,
  LogOut,
  X,
  Star,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged, getIdToken } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const Sidebar = ({ isOpen, setIsOpen, onLogout }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const sidebarRef = useRef(null);

  // ------------------------------------------------
  // Firebase User Loader
  // ------------------------------------------------
  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser?.uid) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        await getIdToken(firebaseUser, true);
        await new Promise((r) => setTimeout(r, 600));

        const userRef = doc(db, "users", firebaseUser.uid);
        let snap = await getDoc(userRef);

        if (!snap.exists()) {
          await setDoc(userRef, {
            email: firebaseUser.email,
            name: firebaseUser.displayName || "User",
            photoURL: firebaseUser.photoURL || "/default-avatar.png",
            role: "user",
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
          });
          snap = await getDoc(userRef);
        }

        setUser({ ...firebaseUser, ...snap.data() });
      } catch (err) {
        console.error("Firebase error:", err);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Auto-close on outside click
  useEffect(() => {
    const closeSidebar = (e) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", closeSidebar);
    return () => document.removeEventListener("mousedown", closeSidebar);
  }, [isOpen, setIsOpen]);

  const handleItemClick = () => {
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  // ------------------------------------------------
  // Navigation Items (Updated)
  // ------------------------------------------------
  const mainSections = [
    { label: "Home", to: "/", icon: <Home size={20} /> },
    { label: "Dashboard", to: "/dashboard", icon: <Home size={20} /> },
    { label: "Workout", to: "/workoutPage", icon: <Dumbbell size={20} /> },
    { label: "Schedule", to: "/schedule", icon: <Calendar size={20} /> },
    { label: "Nutrition", to: "/nutrition", icon: <Utensils size={20} /> },
    { label: "Profile", to: "/profile", icon: <User size={20} /> },
    { label: "AI Coach", to: "/aICoachPage", icon: <Bot size={20} /> },
    { label: "Settings", to: "/fitTronixSettings", icon: <Settings size={20} /> },
  ];

  return (
    <div
  ref={sidebarRef}
  className={`
    fixed 
    top-[75px] 
    left-0 
    h-[calc(100%-60px)] 
    bg-gray-900 
    w-[300px] 
    shadow-lg 
    transition-transform 
    duration-300 
    z-40
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
  `}
>

      {/* ---------------- Header ---------------- */}
      <div className="flex items-center justify-between p-6 border-b border-cyan-500/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg">
            <Dumbbell size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
            FitTronix
          </h1>
        </div>
        <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 rounded-full hover:bg-gray-800">
          <X size={20} className="text-cyan-400" />
        </button>
      </div>

      {/* ---------------- Profile ---------------- */}
      <div className="p-6 border-b border-cyan-500/20">
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : user ? (
          <div className="flex items-center space-x-4">
            <img
              src={user.photoURL}
              className="h-12 w-12 rounded-full border-2 border-cyan-500"
              alt=""
            />
            <div>
              <p className="font-semibold text-white">{user.name}</p>
              <p className="text-sm text-cyan-300">{user.email}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-400">Not logged in</p>
        )}

        
      </div>

      {/* ---------------- Navigation ---------------- */}
      <div className="flex-1 overflow-y-auto py-4">
        <h3 className="text-xs font-semibold text-cyan-400 uppercase px-6 mb-3">Main Sections</h3>
        <div className="space-y-1 px-3">
          {mainSections.map((item, i) => (
            <Link
              key={i}
              to={item.to}
              onClick={handleItemClick}
              className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 
              ${
                location.pathname === item.to
                  ? "bg-gradient-to-r from-cyan-700/30 to-pink-700/30 border-l-4 border-cyan-400"
                  : "hover:bg-gray-800/50"
              }`}
            >
              <div className={location.pathname === item.to ? "text-cyan-400" : "text-gray-400"}>
                {item.icon}
              </div>
              <span className={location.pathname === item.to ? "text-cyan-300" : "text-gray-300"}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ---------------- Footer ---------------- */}
      <div className="p-4 border-t border-cyan-500/20">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800/50 text-pink-400 hover:text-pink-300"
        >
          <LogOut size={18} />
          <span className="text-sm">Logout</span>
        </button>

        <div className="text-center text-xs text-cyan-500/60 mt-3">
          FitTronix v2.0 • Cyber Edition
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
