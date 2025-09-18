// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { 
  Activity, Target, Salad, Smile, Settings, 
  TrendingUp, Calendar, Clock, Award, Heart,
  ChevronRight, Users, BarChart3, Plus
} from "lucide-react";

function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("overview");
  const [userData, setUserData] = useState({
    name: "Bharath",
    streak: 12,
    level: "Intermediate",
    points: 1250
  });

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Sample data for charts and progress
  const weeklyProgress = [
    { day: "Mon", value: 75 },
    { day: "Tue", value: 90 },
    { day: "Wed", value: 60 },
    { day: "Thu", value: 85 },
    { day: "Fri", value: 70 },
    { day: "Sat", value: 95 },
    { day: "Sun", value: 80 }
  ];

  const upcomingWorkouts = [
    { id: 1, name: "Chest & Triceps", time: "7:00 AM", duration: "45 min" },
    { id: 2, name: "Cardio Session", time: "6:00 PM", duration: "30 min" }
  ];

  const recentAchievements = [
    { id: 1, title: "5K Run", description: "Completed your first 5K", date: "2 days ago" },
    { id: 2, title: "Consistency", description: "7 days streak", date: "5 days ago" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 ">
      {/* Header Section */}
      <header className="mb-6 pt-[70px]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Good {currentTime.getHours() < 12 ? "Morning" : currentTime.getHours() < 17 ? "Afternoon" : "Evening"}, {userData.name}!
            </h1>
            <p className="text-gray-600 mt-1">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center mt-4 md:mt-0 space-x-3">
            <div className="bg-white rounded-xl shadow-sm p-2 flex items-center">
              <Clock className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="bg-blue-100 rounded-xl p-2 flex items-center">
              <Award className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-700">{userData.points} pts</span>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white rounded-2xl shadow-md border-0 overflow-hidden">
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Workouts</p>
              <p className="text-xl font-bold">45/60</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-md border-0 overflow-hidden">
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Streak</p>
              <p className="text-xl font-bold">{userData.streak} days</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-md border-0 overflow-hidden">
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-purple-100 p-3 mr-4">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Goals</p>
              <p className="text-xl font-bold">80%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-md border-0 overflow-hidden">
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-orange-100 p-3 mr-4">
              <Heart className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Calories</p>
              <p className="text-xl font-bold">12.4k</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width on large screens */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Progress Chart */}
          <Card className="bg-white rounded-2xl shadow-md border-0 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-blue-500" />
                  Weekly Progress
                </h2>
                <Button variant="ghost" size="sm" className="text-blue-600">
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-end justify-between h-32 mt-4">
                {weeklyProgress.map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="text-xs text-gray-500 mb-2">{item.day}</div>
                    <div
                      className="w-8 rounded-t-lg bg-gradient-to-t from-blue-500 to-blue-300"
                      style={{ height: `${item.value}%` }}
                    ></div>
                    <div className="text-xs mt-1 font-medium">{item.value}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Workout Feedback */}
          <Card className="bg-white rounded-2xl shadow-md border-0 overflow-hidden">
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold flex items-center mb-4">
                <Activity className="mr-2 h-5 w-5 text-green-500" />
                Workout Feedback
              </h2>
              <div className="bg-green-50 p-4 rounded-xl">
                <p className="text-green-800 font-medium">Great job on your form!</p>
                <p className="text-green-700 text-sm mt-1">
                  Your squat depth has improved by 15% compared to last week. Keep focusing on keeping your back straight.
                </p>
              </div>
              <div className="mt-4 bg-blue-50 p-4 rounded-xl">
                <p className="text-blue-800 font-medium">Next focus area:</p>
                <p className="text-blue-700 text-sm mt-1">
                  Try increasing your running pace gradually during cardio sessions for better endurance.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - 1/3 width on large screens */}
        <div className="space-y-6">
          {/* Nutrition Summary */}
          <Link to="/nutrition">
            <Card className="bg-white rounded-2xl shadow-md border-0 overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer">
              <CardContent className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold flex items-center">
                    <Salad className="mr-2 h-5 w-5 text-orange-500" />
                    Nutrition & Diet
                  </h2>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Protein</span>
                      <span className="font-medium">60g / 100g</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Calories</span>
                      <span className="font-medium">1200 / 1800</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Carbs</span>
                      <span className="font-medium">150g / 200g</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Upcoming Workouts */}
          <Card className="bg-white rounded-2xl shadow-md border-0 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-purple-500" />
                  Upcoming Workouts
                </h2>
                <Button variant="ghost" size="sm" className="text-purple-600">
                  <Plus className="mr-1 h-4 w-4" /> Add
                </Button>
              </div>
              <div className="space-y-3">
                {upcomingWorkouts.map(workout => (
                  <div key={workout.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{workout.name}</p>
                      <p className="text-xs text-gray-500">{workout.time} • {workout.duration}</p>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs">
                      Start
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card className="bg-white rounded-2xl shadow-md border-0 overflow-hidden">
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold flex items-center mb-4">
                <Award className="mr-2 h-5 w-5 text-yellow-500" />
                Recent Achievements
              </h2>
              <div className="space-y-3">
                {recentAchievements.map(achievement => (
                  <div key={achievement.id} className="flex items-start p-3 bg-yellow-50 rounded-lg">
                    <div className="bg-yellow-100 p-2 rounded-full mr-3">
                      <Award className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{achievement.title}</p>
                      <p className="text-xs text-gray-600">{achievement.description}</p>
                      <p className="text-xs text-yellow-600 mt-1">{achievement.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Motivation Zone */}
          <Card className="bg-white rounded-2xl shadow-md border-0 overflow-hidden">
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold flex items-center mb-4">
                <Smile className="mr-2 h-5 w-5 text-pink-500" />
                Daily Motivation
              </h2>
              <blockquote className="p-4 bg-pink-50 rounded-xl italic text-pink-800 border-l-4 border-pink-400">
                "Strength doesn't come from what you can do. It comes from overcoming the things you once thought you couldn't."
              </blockquote>
            </CardContent>
          </Card>

          {/* Quick Settings */}
          <Link to="/profile">
            <Card className="bg-white rounded-2xl shadow-md border-0 overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-gray-100 p-3 rounded-full mr-4">
                    <Settings className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Settings & Profile</h3>
                    <p className="text-sm text-gray-500">Customize your experience</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;