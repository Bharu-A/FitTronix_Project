import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Calendar, Activity, Utensils, Clock, X, Dumbbell } from "lucide-react";

// Modal Component for Adding Items
const AddItemModal = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("workout");
  const [time, setTime] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd({ title, type, time: time || "TBD" });
      setTitle("");
      setType("workout");
      setTime("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-[#161616] border border-gray-800 rounded-2xl p-6 shadow-2xl shadow-cyan-900/20"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Plus className="text-cyan-400" /> Add New Item
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning Jog"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="workout">Workout</option>
                <option value="meal">Meal</option>
                <option value="task">Task</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Time (Optional)</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g., 7:00 AM"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-white shadow-lg shadow-cyan-900/20 hover:shadow-cyan-500/40 transition-all active:scale-95"
          >
            Add to Schedule
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const FitTronixSchedule = () => {
  const [scheduleData, setScheduleData] = useState({
    "Monday": [
      { id: 1, type: "workout", title: "Push Day – Chest + Triceps", time: "07:00 AM", completed: false, duration: "60 min" },
      { id: 2, type: "meal", title: "Oats + 3 Eggs + Fruit", time: "08:30 AM", completed: true, calories: "450 kcal" },
      { id: 3, type: "task", title: "10 min Stretching", time: "06:00 PM", completed: false, duration: "10 min" }
    ],
    "Tuesday": [
      { id: 4, type: "workout", title: "Pull Day – Back + Biceps", time: "07:00 AM", completed: false, duration: "65 min" },
      { id: 5, type: "meal", title: "Grilled Chicken Salad + Quinoa", time: "01:00 PM", completed: false, calories: "550 kcal" },
      { id: 6, type: "task", title: "20 min Cardio / Jog", time: "06:30 PM", completed: false, duration: "20 min" }
    ],
    "Wednesday": [
      { id: 7, type: "workout", title: "Leg Day – Quads + Hamstrings", time: "07:00 AM", completed: false, duration: "70 min" },
      { id: 8, type: "meal", title: "Salmon + Asparagus", time: "08:00 PM", completed: false, calories: "500 kcal" }
    ],
    "Thursday": [
      { id: 9, type: "workout", title: "Active Recovery – Yoga Flow", time: "08:00 AM", completed: false, duration: "45 min" },
      { id: 10, type: "task", title: "Foam Rolling Session", time: "09:00 PM", completed: false, duration: "15 min" }
    ],
    "Friday": [
      { id: 11, type: "workout", title: "Upper Body Focus – Shoulders + Arms", time: "07:00 AM", completed: false, duration: "60 min" },
      { id: 12, type: "meal", title: "Protein Smoothie Bowl", time: "09:00 AM", completed: false, calories: "400 kcal" }
    ],
    "Saturday": [
      { id: 13, type: "workout", title: "Full Body HIIT Circuit", time: "09:00 AM", completed: false, duration: "50 min" },
      { id: 14, type: "task", title: "Weekly Weigh-In", time: "08:00 AM", completed: false, duration: "5 min" }
    ],
    "Sunday": [
      { id: 15, type: "task", title: "Rest Day & Meal Prep", time: "10:00 AM", completed: false, duration: "120 min" },
      { id: 16, type: "meal", title: "Sunday Cheat Meal", time: "07:00 PM", completed: false, calories: "1200 kcal" }
    ]
  });

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const [activeTab, setActiveTab] = useState(weekDays[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleComplete = (day, id) => {
    setScheduleData(prev => ({
      ...prev,
      [day]: prev[day].map(item => item.id === id ? { ...item, completed: !item.completed } : item)
    }));
  };

  const handleAddItem = (newItem) => {
    setScheduleData(prev => ({
      ...prev,
      [activeTab]: [
        ...prev[activeTab],
        ...((scheduleData[activeTab] || [])), // Prevent undefined error safely, though state is initialized
        { id: Date.now(), completed: false, ...newItem }
      ]
    }));
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 pt-28 pb-10 px-4 md:px-8">
      <AddItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddItem} />

      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Weekly Plan</span>
            </h1>
            <p className="text-gray-400 text-lg">Your roadmap to results.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 md:mt-0 flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl font-semibold text-white transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={20} className="text-cyan-400" />
            <span>Add Activity</span>
          </button>
        </div>

        {/* Days Navigation */}
        <div className="flex overflow-x-auto pb-4 mb-8 gap-4 no-scrollbar">
          {weekDays.map(day => (
            <button
              key={day}
              onClick={() => setActiveTab(day)}
              className={`flex-shrink-0 px-6 py-4 rounded-2xl font-bold text-lg transition-all relative overflow-hidden ${activeTab === day
                  ? "bg-gray-800 text-cyan-400 shadow-lg border border-cyan-500/20"
                  : "bg-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-900/50"
                }`}
            >
              {day.slice(0, 3)}
              {activeTab === day && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500"
                />
              )}
            </button>
          ))}
        </div>

        {/* Spacious Agenda View */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {scheduleData[activeTab]?.length > 0 ? (
                scheduleData[activeTab].map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    whileHover={{ scale: 1.01 }}
                    className={`group relative p-6 md:p-8 rounded-3xl border-2 transition-all duration-300 ${item.completed
                        ? "bg-[#0a0a0a] border-gray-800 opacity-60 grayscale"
                        : "bg-[#141414] border-gray-800 hover:border-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-900/10"
                      }`}
                  >
                    <div className="flex items-start md:items-center justify-between gap-6">

                      {/* Left: Icon & Info */}
                      <div className="flex items-start md:items-center gap-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${item.completed
                            ? "bg-gray-800 text-gray-500"
                            : "bg-gradient-to-br from-gray-800 to-gray-900 text-cyan-400 border border-gray-700"
                          }`}>
                          {item.type === 'workout' && <Dumbbell size={28} />}
                          {item.type === 'meal' && <Utensils size={28} />}
                          {item.type === 'task' && <Clock size={28} />}
                        </div>

                        <div>
                          <h3 className={`text-xl md:text-2xl font-bold mb-2 ${item.completed ? "text-gray-500 line-through" : "text-white"}`}>
                            {item.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold tracking-wide uppercase">
                            <span className={`px-3 py-1 rounded-lg ${item.completed ? "bg-gray-800 text-gray-600" : "bg-gray-800 text-cyan-400"}`}>
                              {item.time}
                            </span>
                            {(item.duration || item.calories) && (
                              <span className="text-gray-500 flex items-center gap-1">
                                <div className="w-1 h-1 bg-gray-600 rounded-full" />
                                {item.duration || item.calories}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Check Action */}
                      <button
                        onClick={() => toggleComplete(activeTab, item.id)}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all bg-[#0f0f0f] border-2 shadow-inner ${item.completed
                            ? "border-green-500 text-green-500 shadow-green-900/20"
                            : "border-gray-700 text-gray-600 hover:border-cyan-500 hover:text-cyan-400 group-hover:bg-gray-900"
                          }`}
                      >
                        <Check size={24} strokeWidth={3} />
                      </button>

                    </div>

                    {/* Decorative Corner Glow */}
                    {!item.completed && (
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-500/5 to-transparent rounded-tr-3xl pointer-events-none" />
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="py-32 text-center rounded-3xl border-2 border-dashed border-gray-800 bg-gray-900/20">
                  <div className="inline-flex p-5 rounded-full bg-gray-800/80 mb-6 text-gray-500">
                    <Calendar size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-300 mb-2">Rest Day</h3>
                  <p className="text-gray-500">No scheduled activities. Enjoy the recovery!</p>
                  <button onClick={() => setIsModalOpen(true)} className="mt-8 text-cyan-400 hover:text-cyan-300 font-bold hover:underline">
                    + Add Activity
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
export default FitTronixSchedule;
