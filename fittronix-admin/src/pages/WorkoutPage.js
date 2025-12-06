// src/pages/WorkoutPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

/**
 * Workout Library - single-file page (no AI / no camera)
 *
 * - Search, filter by level
 * - Click card to open modal with video + details
 * - Lightweight user status (optional)
 */

/* =========================
   Workout Data (configure)
   ========================= */
const ALL_WORKOUTS = [
  {
    id: "pushup",
    name: "Push-Ups",
    image: "/workouts/pushup.jpg",
    video: "https://www.youtube.com/embed/_l3ySVKYVJ8",
    benefits: [
      "Builds chest, shoulders & triceps",
      "Improves upper-body strength",
      "Enhances core stability",
      "Requires no equipment"
    ],
    level: "Beginner",
    description:
      "Push-ups are a compound upper-body exercise working the chest, shoulders and triceps. Keep a straight plank line and control your tempo."
  },
  {
    id: "squat",
    name: "Squats",
    image: "/workouts/squat.jpg",
    video: "https://www.youtube.com/embed/aclHkVaku9U",
    benefits: [
      "Strengthens legs & glutes",
      "Improves mobility",
      "Boosts calorie burn",
      "Builds functional lower-body strength"
    ],
    level: "Beginner",
    description:
      "Squats target the quadriceps, hamstrings, and glutes. Drive through your heels and keep the chest up for safe, deep squats."
  },
  {
    id: "plank",
    name: "Plank",
    image: "/workouts/plank.jpg",
    video: "https://www.youtube.com/embed/pSHjTRCQxIw",
    benefits: [
      "Strengthens core muscles",
      "Improves posture",
      "Reduces risk of back injuries",
      "Enhances balance & stability"
    ],
    level: "Beginner",
    description:
      "The plank is an isometric core hold. Keep hips level and shoulders stacked over elbows (or hands). Breathe evenly."
  },
  {
    id: "lunge",
    name: "Lunges",
    image: "/workouts/lunge.jpg",
    video: "https://www.youtube.com/embed/QOVaHwm-Q6U",
    benefits: [
      "Targets quads & glutes",
      "Improves balance",
      "Great for functional strength",
      "Helps correct muscle imbalance"
    ],
    level: "Intermediate",
    description:
      "Lunges develop single-leg strength and balance. Step forward (or backward), keep knee aligned over the ankle, and maintain upright posture."
  },
  {
    id: "burpee",
    name: "Burpees",
    image: "/workouts/burpee.jpg",
    video: "https://www.youtube.com/embed/1N9w7cK4YHg",
    benefits: [
      "Full-body conditioning",
      "High calorie burn",
      "Improves cardiovascular fitness",
      "Great for HIIT workouts"
    ],
    level: "Advanced",
    description:
      "Burpees are an intense full-body exercise combining a squat, plank and jump. Focus on form and pace yourself — they are taxing but effective."
  }
];

/* =========================
   Component
   ========================= */
export default function WorkoutPage() {
  // auth state (optional)
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // local UI state
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("All"); // All / Beginner / Intermediate / Advanced
  const [activeWorkout, setActiveWorkout] = useState(null); // workout object for modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // derived list
  const workouts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_WORKOUTS.filter((w) => {
      const passesLevel = levelFilter === "All" ? true : w.level === levelFilter;
      const passesQuery =
        !q ||
        w.name.toLowerCase().includes(q) ||
        (w.benefits || []).some((b) => b.toLowerCase().includes(q)) ||
        (w.description || "").toLowerCase().includes(q);
      return passesLevel && passesQuery;
    });
  }, [query, levelFilter]);

  // modal open
  const openWorkout = (workout) => {
    setActiveWorkout(workout);
    setIsModalOpen(true);
    // push modal into view on smaller screens
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // small timeout to clear activeWorkout after modal hide animation
    setTimeout(() => setActiveWorkout(null), 300);
  };

  

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-40 pb-16 ">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-500 mb-3">
          🔥 Workout Library
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Browse exercises with benefits, images and short video demonstrations. Tap a card to open a focused view.
        </p>
      </header>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 w-full md:w-1/2">
            <input
              type="search"
              aria-label="Search workouts"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, benefit or description..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            >
              <option value="All">All levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            
          </div>
        </div>
      </div>

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {workouts.map((workout, idx) => (
            <motion.article
              key={workout.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="bg-gray-800/40 rounded-2xl overflow-hidden shadow-lg border border-cyan-800/10 hover:shadow-xl cursor-pointer"
              onClick={() => openWorkout(workout)}
            >
              <div className="relative">
                <img
                  src={workout.image}
                  alt={workout.name}
                  className="w-full h-52 object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/workouts/placeholder.jpg";
                  }}
                />
                <div className="absolute top-3 left-3 bg-black/50 text-xs px-3 py-1 rounded-full text-white">
                  {workout.level}
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-xl font-semibold text-cyan-300 mb-2">{workout.name}</h3>
                <p className="text-sm text-gray-300 mb-3 line-clamp-3">{workout.description}</p>

                <ul className="text-gray-300 text-sm space-y-2 mb-4">
                  {workout.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✔</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openWorkout(workout);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-red-500 rounded-lg text-sm font-semibold"
                  >
                    View
                  </button>
                  <a
                    href={workout.video}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm text-cyan-300 underline"
                  >
                    Watch demo
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && activeWorkout && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeModal}
          />
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="relative bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden"
          >
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2">
                <img
                  src={activeWorkout.image}
                  alt={activeWorkout.name}
                  className="w-full h-72 object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/workouts/placeholder.jpg";
                  }}
                />
              </div>

              <div className="md:w-1/2 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-cyan-300 mb-1">{activeWorkout.name}</h3>
                    <p className="text-sm text-gray-400 mb-3">{activeWorkout.level} • {activeWorkout.benefits.length} benefits</p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-white text-lg"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-gray-300 mb-4">{activeWorkout.description}</p>

                <ul className="text-sm text-gray-300 space-y-2 mb-4">
                  {activeWorkout.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-green-400 mt-1">✔</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="rounded-lg overflow-hidden border border-cyan-700/20">
                  <iframe
                    src={activeWorkout.video}
                    title={`${activeWorkout.name} demo`}
                    width="100%"
                    height="275"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    className="block"
                  />
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => {
                      // placeholder for future "Add to plan" or "Start workout" actions
                      alert(`Added "${activeWorkout.name}" to your plan (placeholder).`);
                    }}
                    className="px-4 py-2 bg-cyan-600 rounded-lg text-sm font-semibold"
                  >
                    Add to plan
                  </button>

                  <a
                    href={activeWorkout.video}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 border rounded-lg text-sm text-cyan-300 border-cyan-700/30"
                  >
                    Open full demo
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* small footer / spacing */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} FitTronix — Workout Library
      </footer>
    </div>
  );
}
