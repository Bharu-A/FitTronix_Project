import React, { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default function HealthTracker() {
  const chartRef = useRef(null);
  const [isScannerOpen, setScannerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("scan");

  useEffect(() => {
    if (!chartRef.current) return;

    const newChart = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Calories Goal %",
            data: [85, 92, 78, 95, 88, 65, 70],
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
          {
            label: "Protein Goal %",
            data: [75, 85, 90, 82, 79, 60, 85],
            backgroundColor: "rgba(75, 192, 192, 0.5)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: (v) => `${v}%`,
            },
          },
        },
      },
    });

    return () => newChart.destroy();
  }, []);

  const addScannedFood = () => {
    alert("Food added!");
    setScannerOpen(false);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* HEADER */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">
            Health & Nutrition Goals
          </h1>
          <p className="text-gray-600">
            Track your progress and achieve your health objectives
          </p>
        </header>

        {/* NAVIGATION */}
        <div className="flex border-b mb-6 overflow-x-auto">
          <div className="py-2 px-4 border-b-2 border-blue-500 text-blue-600 font-medium cursor-pointer">
            Goals Dashboard
          </div>
          <div
            className="py-2 px-4 cursor-pointer text-gray-500"
            onClick={() => setScannerOpen(true)}
          >
            Food Scanner
          </div>
          <div className="py-2 px-4 cursor-pointer text-gray-500">
            Progress History
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2">
            {/* WEEKLY PROGRESS */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Weekly Progress</h2>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                {[
                  ["4/7", "Active Days", "blue"],
                  ["72%", "Goal Completion", "green"],
                  ["12", "Meals Logged", "yellow"],
                  ["28", "Glasses of Water", "purple"],
                ].map(([value, label, color], idx) => (
                  <div
                    key={idx}
                    className={`text-center p-3 bg-${color}-50 rounded-lg`}
                  >
                    <p className={`text-2xl font-bold text-${color}-600`}>
                      {value}
                    </p>
                    <p className="text-sm text-gray-600">{label}</p>
                  </div>
                ))}
              </div>

              <div className="h-64">
                <canvas ref={chartRef}></canvas>
              </div>
            </div>

            {/* CURRENT GOALS */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Your Goals</h2>
                <button className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm">
                  + Add Goal
                </button>
              </div>

              <div className="space-y-4">
                {[
                  {
                    color: "blue",
                    title: "Reach Target Weight (70kg)",
                    tag: "4 weeks left",
                    desc: "Current: 73.5kg | Target: 70kg",
                    width: "65%",
                  },
                  {
                    color: "green",
                    title: "Daily Protein Intake (120g)",
                    tag: "Daily",
                    desc: "Achieved: 95g today",
                    width: "79%",
                  },
                  {
                    color: "purple",
                    title: "Workout 5x per Week",
                    tag: "3/5 this week",
                    desc: "Cardio and strength training",
                    width: "60%",
                  },
                ].map((goal, idx) => (
                  <div
                    key={idx}
                    className={`border-l-4 border-${goal.color}-500 pl-4 py-2 bg-${goal.color}-50 rounded-r`}
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium">{goal.title}</h3>
                      <span
                        className={`text-sm bg-${goal.color}-100 text-${goal.color}-800 py-1 px-2 rounded-full`}
                      >
                        {goal.tag}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{goal.desc}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`bg-${goal.color}-600 h-2 rounded-full`}
                        style={{ width: goal.width }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div>
            {/* QUICK LOG */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Quick Log</h2>

              <div className="mb-4">
                {[
                  ["Log Meal", "blue"],
                  ["Log Weight", "green"],
                  ["Log Workout", "purple"],
                ].map(([label, color], idx) => (
                  <button
                    key={idx}
                    className={`w-full bg-${color}-100 hover:bg-${color}-200 text-${color}-700 py-3 rounded-lg mb-3 flex items-center justify-center`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* WATER TRACKER */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Water Intake</h3>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Today: 5/8 glasses</span>
                  <span className="text-blue-600 font-medium">63%</span>
                </div>

                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-1/8 h-2 bg-blue-400 rounded"></div>
                  ))}
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-1/8 h-2 bg-gray-300 rounded"></div>
                  ))}
                </div>

                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-sm">
                  + Add Glass of Water
                </button>
              </div>
            </div>

            {/* NUTRITION SUMMARY */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Today's Nutrition</h2>

              {[
                ["Calories", "1450/1800", "red", "80%"],
                ["Protein", "95/120g", "blue", "79%"],
                ["Carbs", "180/220g", "yellow", "82%"],
                ["Fats", "55/60g", "green", "92%"],
              ].map(([name, value, color, width]) => (
                <div className="mb-3" key={name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">{name}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`bg-${color}-500 h-2 rounded-full`}
                      style={{ width }}
                    ></div>
                  </div>
                </div>
              ))}

              <button className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded text-sm">
                View Detailed Report
              </button>
            </div>
          </div>
        </div>

        {/* SCANNER MODAL */}
        {isScannerOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl w-11/12 md:w-2/3 lg:w-1/2 max-w-2xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Scan or Input Food</h3>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setScannerOpen(false)}
                  >
                    ✕
                  </button>
                </div>

                {/* SCANNER TABS */}
                <div className="flex border-b mb-4">
                  {["scan", "manual", "search"].map((tab) => (
                    <button
                      key={tab}
                      className={`py-2 px-4 ${
                        activeTab === tab
                          ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                          : "text-gray-500"
                      }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab === "scan"
                        ? "Camera Scan"
                        : tab === "manual"
                        ? "Manual Input"
                        : "Search Database"}
                    </button>
                  ))}
                </div>

                {/* TAB CONTENT */}
                {activeTab === "scan" && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center">
                      <i className="fas fa-camera text-4xl text-gray-400 mb-2"></i>
                      <p className="text-gray-500">Position food in the frame</p>
                      <button className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                        Start Camera
                      </button>
                    </div>
                  </div>
                )}

                {/* FOOTER */}
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
                    onClick={() => setScannerOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                    onClick={addScannedFood}
                  >
                    Add to Food Log
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
