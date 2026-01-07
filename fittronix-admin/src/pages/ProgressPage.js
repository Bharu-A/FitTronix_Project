import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from "recharts";
import {
    TrendingUp, Activity, Flame, Scale,
    Calendar, Award, Target, ChevronLeft
} from "lucide-react";
import { Link } from "react-router-dom";

// Mock Data (Replace with Firebase real data later)
const weeklyActivityData = [
    { day: "Mon", workouts: 1, calories: 320, duration: 45 },
    { day: "Tue", workouts: 1, calories: 410, duration: 60 },
    { day: "Wed", workouts: 0, calories: 0, duration: 0 },
    { day: "Thu", workouts: 1, calories: 350, duration: 50 },
    { day: "Fri", workouts: 1, calories: 450, duration: 65 },
    { day: "Sat", workouts: 2, calories: 600, duration: 90 },
    { day: "Sun", workouts: 0, calories: 0, duration: 0 },
];

const weightData = [
    { date: "Jan 1", weight: 185 },
    { date: "Jan 8", weight: 184 },
    { date: "Jan 15", weight: 182.5 },
    { date: "Jan 22", weight: 181 },
    { date: "Jan 29", weight: 180.5 },
];

const workoutDistribution = [
    { name: "Strength", value: 45, color: "#a855f7" }, // purple
    { name: "Cardio", value: 30, color: "#3b82f6" },   // blue
    { name: "HIIT", value: 15, color: "#ef4444" },     // red
    { name: "Yoga", value: 10, color: "#22c55e" },     // green
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-xl">
                <p className="text-gray-300 font-semibold mb-1">{label}</p>
                {payload.map((p, index) => (
                    <p key={index} style={{ color: p.color }} className="text-sm">
                        {p.name}: {p.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const ProgressPage = () => {
    const [timeRange, setTimeRange] = useState("week"); // week, month, year

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 pt-24">
            {/* Background Ambience */}
            <div className="fixed inset-0 bg-gradient-to-br from-purple-900/10 via-gray-900 to-blue-900/10 pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div className="flex items-center self-start md:self-auto mb-4 md:mb-0">
                        <Link to="/dashboard" className="mr-4 p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition">
                            <ChevronLeft className="h-6 w-6 text-gray-400" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                Progress Analytics
                            </h1>
                            <p className="text-gray-400 text-sm">Track your evolution over time</p>
                        </div>
                    </div>

                    <div className="flex bg-gray-800/50 p-1 rounded-lg backdrop-blur-sm border border-gray-700">
                        {['week', 'month', 'year'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${timeRange === range
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {range.charAt(0).toUpperCase() + range.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: "Total Workouts", value: "24", sub: "+3 this week", icon: Activity, color: "text-blue-400", border: "border-blue-500/20" },
                        { label: "Calories Burned", value: "12,450", sub: "kcal total", icon: Flame, color: "text-orange-400", border: "border-orange-500/20" },
                        { label: "Active Time", value: "18h 30m", sub: "Avg 45m/session", icon: Calendar, color: "text-green-400", border: "border-green-500/20" },
                        { label: "Current Streak", value: "5 Days", sub: "Keep it up!", icon: TrendingUp, color: "text-purple-400", border: "border-purple-500/20" },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`bg-gray-800/40 backdrop-blur-xl p-6 rounded-2xl border ${stat.border} hover:bg-gray-800/60 transition`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                                    <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
                                </div>
                                <div className={`p-3 rounded-xl bg-gray-900/50 ${stat.color}`}>
                                    <stat.icon size={24} />
                                </div>
                            </div>
                            <p className={`text-xs ${stat.color} font-medium`}>{stat.sub}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Main Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

                    {/* Main Activity Chart (Calories & Duration) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-2 bg-gray-800/40 backdrop-blur-xl p-6 rounded-2xl border border-gray-700 shadow-xl"
                    >
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                            <Activity className="h-5 w-5 mr-2 text-blue-400" /> Activity Trends
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={weeklyActivityData}>
                                    <defs>
                                        <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorDur" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="calories" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCal)" name="Calories" />
                                    <Area type="monotone" dataKey="duration" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorDur)" name="Duration (min)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Workout Distribution */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gray-800/40 backdrop-blur-xl p-6 rounded-2xl border border-gray-700 shadow-xl"
                    >
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                            <Target className="h-5 w-5 mr-2 text-purple-400" /> Focus Areas
                        </h3>
                        <div className="h-[300px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={workoutDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {workoutDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Legend */}
                            <div className="absolute bottom-0 w-full flex justify-center gap-4 text-xs text-gray-400">
                                {workoutDistribution.map(d => (
                                    <div key={d.name} className="flex items-center">
                                        <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: d.color }} />
                                        {d.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                </div>

                {/* Weight Tracker & Milestones */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gray-800/40 backdrop-blur-xl p-6 rounded-2xl border border-gray-700"
                    >
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                            <Scale className="h-5 w-5 mr-2 text-green-400" /> Weight Progress
                        </h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={weightData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                                    <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, fill: '#22c55e' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gray-800/40 backdrop-blur-xl p-6 rounded-2xl border border-gray-700"
                    >
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                            <Award className="h-5 w-5 mr-2 text-yellow-400" /> Recent Trophies
                        </h3>
                        <div className="space-y-4">
                            {[
                                { title: "Early Bird", desc: "Completed 5 workouts before 8AM", icon: "🌅", date: "Yesterday" },
                                { title: "Century Club", desc: "Burned 1000+ kcal in one week", icon: "🔥", date: "Jan 24" },
                                { title: "Consistency King", desc: "Logged food for 7 days straight", icon: "🥗", date: "Jan 20" }
                            ].map((achievement, i) => (
                                <div key={i} className="flex items-center p-3 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-yellow-500/30 transition">
                                    <div className="text-2xl mr-4">{achievement.icon}</div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-200">{achievement.title}</h4>
                                        <p className="text-xs text-gray-500">{achievement.desc}</p>
                                    </div>
                                    <span className="text-xs text-gray-600 font-mono">{achievement.date}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </div>

            </div>
        </div>
    );
};

export default ProgressPage;
