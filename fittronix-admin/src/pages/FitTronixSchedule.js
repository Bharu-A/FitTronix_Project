import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FitTronixSchedule = () => {
  const [darkMode] = useState(true);

  // -----------------------------
  // CORE SCHEDULE DATA ONLY
  // -----------------------------
  const [schedule, setSchedule] = useState({
    Monday: {
      workouts: [{ id: 1, name: "Push Day – Chest + Triceps", time: "7:00 AM", completed: false }],
      meals: [{ id: 2, name: "Oats + 3 Eggs + Fruit", time: "8:00 AM", completed: false }],
      tasks: [{ id: 3, name: "10 min Stretching", time: "6:00 PM", completed: false }],
    },
    Tuesday: { workouts: [], meals: [], tasks: [] },
    Wednesday: { workouts: [], meals: [], tasks: [] },
    Thursday: {},
    Friday: {},
    Saturday: {},
    Sunday: {},
  });

  const [selectedDay, setSelectedDay] = useState("Monday");
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  // -----------------------------
  // BASIC PROGRESS + STREAK
  // -----------------------------
  const calculateProgress = () => {
    let all = [], done = [];
    Object.values(schedule).forEach((day) => {
      ["workouts", "meals", "tasks"].forEach((key) => {
        if (day[key]) {
          all.push(...day[key]);
          done.push(...day[key].filter((i) => i.completed));
        }
      });
    });
    if (!all.length) return 0;
    return Math.round((done.length / all.length) * 100);
  };

  const [streak] = useState(3);
  const progress = calculateProgress();

  // -----------------------------
  // TOGGLE COMPLETE
  // -----------------------------
  const toggleComplete = (day, type, id) => {
    setSchedule((prev) => {
      return {
        ...prev,
        [day]: {
          ...prev[day],
          [type]: prev[day][type].map((item) =>
            item.id === id ? { ...item, completed: !item.completed } : item
          ),
        },
      };
    });
  };

  // -----------------------------
  // ADD NEW ITEM
  // -----------------------------
  const addNewItem = (type) => {
    const name = prompt(`Enter ${type} name:`);
    if (!name) return;

    setSchedule((prev) => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        [type]: [
          ...(prev[selectedDay][type] || []),
          {
            id: Date.now(),
            name,
            time: "Not set",
            completed: false,
          },
        ],
      },
    }));
  };

  // -----------------------------
  // UI COMPONENTS
  // -----------------------------

  const ItemCard = ({ item, type }) => (
    <motion.div
      className={`p-4 rounded-lg border ${
        item.completed ? "border-green-400 bg-green-900/20" : "border-cyan-400 bg-gray-800/40"
      }`}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold">{item.name}</h3>
          <p className="text-cyan-300 text-sm">{item.time}</p>
        </div>

        <motion.button
          onClick={() => toggleComplete(selectedDay, type, item.id)}
          whileTap={{ scale: 0.9 }}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            item.completed ? "bg-green-400 border-green-400" : "border-cyan-400"
          }`}
        >
          {item.completed && "✓"}
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      
      {/* ---------------------- HEADER ---------------------- */}
      <section className="text-center py-10">
        <h1 className="text-4xl font-bold text-cyan-400">Your Schedule</h1>
        <p className="text-gray-400 mt-2">Workouts • Meals • Tasks</p>
      </section>

      {/* ---------------------- WEEK DAYS ---------------------- */}
      <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-7 gap-3 mb-10">
        {Object.keys(schedule).map((day) => (
          <motion.div
            key={day}
            whileHover={{ scale: 1.05 }}
            className={`py-3 text-center rounded-xl cursor-pointer border ${
              selectedDay === day
                ? "border-cyan-400 bg-cyan-900/30"
                : "border-gray-600 bg-gray-800/40"
            }`}
            onClick={() => setSelectedDay(day)}
          >
            {day}
          </motion.div>
        ))}
      </div>

      {/* ---------------------- DAILY TIMELINE ---------------------- */}
      <div className="container mx-auto px-4 space-y-10">
        {["workouts", "meals", "tasks"].map((type) => (
          <div key={type}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-2xl font-bold capitalize text-cyan-300">{type}</h2>
              <button
                onClick={() => addNewItem(type)}
                className="px-3 py-1 bg-cyan-600 rounded-lg"
              >
                + Add
              </button>
            </div>

            <div className="space-y-3">
              {(schedule[selectedDay][type] || []).length ? (
                schedule[selectedDay][type].map((item) => (
                  <ItemCard key={item.id} item={item} type={type} />
                ))
              ) : (
                <p className="text-gray-500 text-sm">No {type} added yet.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ---------------------- PROGRESS ---------------------- */}
      <div className="container mx-auto px-4 mt-16 mb-16">
        <div className="p-6 rounded-xl border border-cyan-400 bg-gray-800/40">
          <p className="text-lg font-bold mb-2">Weekly Progress</p>

          <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden mb-2">
            <motion.div
              className="h-full bg-cyan-400"
              animate={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-right text-cyan-300">{progress}%</p>
        </div>

        <div className="p-6 mt-4 rounded-xl border border-purple-400 bg-gray-800/40 text-center">
          <div className="text-5xl mb-2">🔥</div>
          <p className="text-3xl font-bold">{streak} Day Streak</p>
        </div>
      </div>
    </div>
  );
};

export default FitTronixSchedule;
