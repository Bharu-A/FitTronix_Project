import React, { useEffect } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default function HealthTracker() {
  useEffect(() => {
    // Weekly Progress Chart
    const ctx = document.getElementById("weeklyProgressChart");
    if (ctx) {
      new Chart(ctx, {
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
                callback: function (value) {
                  return value + "%";
                },
              },
            },
          },
        },
      });
    }
  }, []);

  const openScanner = () => {
    document.getElementById("scannerModal").classList.remove("hidden");
  };

  const closeScanner = () => {
    document.getElementById("scannerModal").classList.add("hidden");
  };

  const addScannedFood = () => {
    alert("Food added to your log!");
    closeScanner();
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">
            Health & Nutrition Goals
          </h1>
          <p className="text-gray-600">
            Track your progress and achieve your health objectives
          </p>
        </header>

        {/* Navigation */}
        <div className="flex border-b mb-6 overflow-x-auto">
          <div className="py-2 px-4 cursor-pointer border-b-2 border-blue-500 text-blue-600 font-medium">
            Goals Dashboard
          </div>
          <div className="py-2 px-4 cursor-pointer text-gray-500">
            Food Scanner
          </div>
          <div className="py-2 px-4 cursor-pointer text-gray-500">
            Progress History
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Goals Overview */}
          <div className="lg:col-span-2">
            {/* Weekly Progress */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Weekly Progress</h2>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">4/7</p>
                  <p className="text-sm text-gray-600">Active Days</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">72%</p>
                  <p className="text-sm text-gray-600">Goal Completion</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">12</p>
                  <p className="text-sm text-gray-600">Meals Logged</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">28</p>
                  <p className="text-sm text-gray-600">Glasses of Water</p>
                </div>
              </div>
              <div className="h-64">
                <canvas id="weeklyProgressChart"></canvas>
              </div>
            </div>

            {/* Current Goals */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Your Goals</h2>
                <button className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm">
                  + Add Goal
                </button>
              </div>

              <div className="space-y-4">
                {/* Goal 1 */}
                <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r">
                  <div className="flex justify-between">
                    <h3 className="font-medium">Reach Target Weight (70kg)</h3>
                    <span className="text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
                      4 weeks left
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Current: 73.5kg | Target: 70kg
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: "65%" }}
                    ></div>
                  </div>
                </div>

                {/* Goal 2 */}
                <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 rounded-r">
                  <div className="flex justify-between">
                    <h3 className="font-medium">Daily Protein Intake (120g)</h3>
                    <span className="text-sm bg-green-100 text-green-800 py-1 px-2 rounded-full">
                      Daily
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Achieved: 95g today
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: "79%" }}
                    ></div>
                  </div>
                </div>

                {/* Goal 3 */}
                <div className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50 rounded-r">
                  <div className="flex justify-between">
                    <h3 className="font-medium">Workout 5x per Week</h3>
                    <span className="text-sm bg-purple-100 text-purple-800 py-1 px-2 rounded-full">
                      3/5 this week
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Cardio and strength training
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: "60%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div>
            {/* Quick Log */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Quick Log</h2>

              <div className="mb-4">
                <button className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 py-3 rounded-lg mb-3 flex items-center justify-center">
                  <i className="fas fa-utensils mr-2"></i> Log Meal
                </button>
                <button className="w-full bg-green-100 hover:bg-green-200 text-green-700 py-3 rounded-lg mb-3 flex items-center justify-center">
                  <i className="fas fa-weight mr-2"></i> Log Weight
                </button>
                <button className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 py-3 rounded-lg flex items-center justify-center">
                  <i className="fas fa-running mr-2"></i> Log Workout
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Water Intake</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Today: 5/8 glasses</span>
                  <span className="text-blue-600 font-medium">63%</span>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1/8 h-2 bg-blue-400 rounded"
                    ></div>
                  ))}
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1/8 h-2 bg-gray-300 rounded"
                    ></div>
                  ))}
                </div>
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-sm">
                  + Add Glass of Water
                </button>
              </div>
            </div>

            {/* Nutrition Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Today's Nutrition</h2>

              <div className="space-y-3">
                {/* Calories */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Calories</span>
                    <span className="font-medium">1450/1800</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: "80%" }}
                    ></div>
                  </div>
                </div>

                {/* Protein */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Protein</span>
                    <span className="font-medium">95/120g</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: "79%" }}
                    ></div>
                  </div>
                </div>

                {/* Carbs */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Carbs</span>
                    <span className="font-medium">180/220g</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: "82%" }}
                    ></div>
                  </div>
                </div>

                {/* Fats */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Fats</span>
                    <span className="font-medium">55/60g</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: "92%" }}
                    ></div>
                  </div>
                </div>
              </div>

              <button className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded text-sm">
                View Detailed Report
              </button>
            </div>
          </div>
        </div>

        {/* Food Scanner Modal */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden"
          id="scannerModal"
        >
          <div className="bg-white rounded-lg shadow-xl w-11/12 md:w-2/3 lg:w-1/2 max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Scan or Input Food</h3>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={closeScanner}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="mb-4">
                <div className="flex border-b">
                  <button className="py-2 px-4 border-b-2 border-blue-500 text-blue-600 font-medium">
                    Camera Scan
                  </button>
                  <button className="py-2 px-4 text-gray-500">
                    Manual Input
                  </button>
                  <button className="py-2 px-4 text-gray-500">
                    Search Database
                  </button>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center mb-4">
                <div className="text-center">
                  <i className="fas fa-camera text-4xl text-gray-400 mb-2"></i>
                  <p className="text-gray-500">Position food in the frame</p>
                  <button className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                    Start Camera
                  </button>
                </div>
              </div>

              <div
                className="bg-gray-50 p-4 rounded-lg mb-4 hidden"
                id="scanResults"
              >
                <h4 className="font-medium mb-2">Scan Results</h4>
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg mr-3"></div>
                  <div>
                    <p className="font-medium">Grilled Chicken Breast</p>
                    <p className="text-sm text-gray-600">
                      Estimated: 165g serving
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-3">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="font-bold">220</p>
                    <p className="text-xs text-gray-600">Calories</p>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="font-bold">41g</p>
                    <p className="text-xs text-gray-600">Protein</p>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="font-bold">0g</p>
                    <p className="text-xs text-gray-600">Carbs</p>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="font-bold">5g</p>
                    <p className="text-xs text-gray-600">Fat</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
                  onClick={closeScanner}
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
      </div>
    </div>
  );
}
