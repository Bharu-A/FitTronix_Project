// src/pages/About.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Target, 
  Users, 
  Calendar, 
  Award, 
  Cpu,
  Network,
  Shield,
  Rocket,
  Globe,
  HeartPulse,
  Brain,
  Activity,
  TrendingUp
} from 'lucide-react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';

const About = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeMission, setActiveMission] = useState('mission');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch team members
      const teamRef = collection(db, 'teamMembers');
      const teamQuery = query(teamRef, orderBy('id'));
      const teamSnapshot = await getDocs(teamQuery);
      const teamData = teamSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setTeamMembers(teamData);

      // Fetch timeline events
      const timelineRef = collection(db, 'timeline');
      const timelineQuery = query(timelineRef, orderBy('year'));
      const timelineSnapshot = await getDocs(timelineQuery);
      const timelineData = timelineSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setTimeline(timelineData);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Error fetching About page data');
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full"
      />
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-red-400 text-xl bg-red-900/20 p-8 rounded-2xl border border-red-500/30"
      >
        {error}
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Enhanced Cyber Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-cyan-900/10 pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500/10 via-gray-900 to-purple-900/20 pointer-events-none"></div>
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <motion.header 
          className="bg-gray-800/50 backdrop-blur-md border-b border-cyan-500/20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
            <motion.h1 
              className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
            >
              ABOUT FITTRONIX
            </motion.h1>
            <nav className="flex space-x-6">
              {['Home', 'Blog', 'Contact', 'Dashboard'].map((item) => (
                <motion.a
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  className="text-cyan-300 hover:text-cyan-100 transition-all duration-300 hover:bg-cyan-500/10 px-4 py-2 rounded-lg border border-cyan-500/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item}
                </motion.a>
              ))}
            </nav>
          </div>
        </motion.header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <motion.section 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-8"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              CYBER FITNESS EVOLUTION
            </motion.h1>
            <motion.p 
              className="text-xl text-cyan-200 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              We are the architects of human potential, merging cutting-edge AI technology with 
              revolutionary fitness science to create the ultimate training experience.
            </motion.p>
          </motion.section>

          {/* Mission & Vision Toggle */}
          <motion.section 
            className="mb-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex justify-center mb-8">
              <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-2 border border-cyan-500/20">
                {[
                  { id: 'mission', label: 'OUR MISSION', icon: Target },
                  { id: 'vision', label: 'OUR VISION', icon: Rocket },
                  { id: 'philosophy', label: 'AI PHILOSOPHY', icon: Brain }
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveMission(tab.id)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                      activeMission === tab.id
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/20'
                        : 'text-gray-400 hover:text-cyan-300 hover:bg-gray-700/50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span className="font-semibold">{tab.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeMission}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-800/30 backdrop-blur-md rounded-2xl border border-purple-500/30 p-8 hover:border-purple-500/50 transition-all duration-300"
              >
                {activeMission === 'mission' && (
                  <div className="text-center">
                    <Target className="h-16 w-16 text-cyan-400 mx-auto mb-6" />
                    <h3 className="text-3xl font-bold text-cyan-300 mb-4">CYBERNETIC MISSION</h3>
                    <p className="text-cyan-200 text-lg leading-relaxed">
                      To augment human physical capabilities through AI-driven training systems that adapt in real-time, 
                      providing personalized workout experiences that push beyond conventional limits and redefine 
                      what's possible in fitness evolution.
                    </p>
                  </div>
                )}
                {activeMission === 'vision' && (
                  <div className="text-center">
                    <Rocket className="h-16 w-16 text-purple-400 mx-auto mb-6" />
                    <h3 className="text-3xl font-bold text-purple-300 mb-4">FUTURE VISION</h3>
                    <p className="text-purple-200 text-lg leading-relaxed">
                      A world where every individual achieves their peak physical form through seamless integration 
                      of neural networks, biometric feedback, and adaptive algorithms—creating a new era of 
                      superhuman fitness capabilities.
                    </p>
                  </div>
                )}
                {activeMission === 'philosophy' && (
                  <div className="text-center">
                    <Brain className="h-16 w-16 text-pink-400 mx-auto mb-6" />
                    <h3 className="text-3xl font-bold text-pink-300 mb-4">AI PHILOSOPHY</h3>
                    <p className="text-pink-200 text-lg leading-relaxed">
                      We believe artificial intelligence should enhance, not replace, human potential. Our neural 
                      networks learn from your movements, predict your limits, and guide you toward breakthroughs 
                      you never thought possible.
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.section>

          {/* Impact Stats */}
          <motion.section 
            className="mb-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <div className="bg-gradient-to-br from-cyan-900/30 to-purple-900/30 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-8 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
              <h3 className="text-3xl font-bold text-cyan-300 text-center mb-8">SYSTEM IMPACT METRICS</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { value: '1M+', label: 'CYBER ATHLETES', icon: Users, color: 'cyan' },
                  { value: '50+', label: 'NEURAL NETWORKS', icon: Cpu, color: 'purple' },
                  { value: '99.9%', label: 'SYSTEM UPTIME', icon: Shield, color: 'green' },
                  { value: '24/7', label: 'AI MONITORING', icon: Activity, color: 'pink' }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="text-center p-6 bg-gray-800/50 rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <stat.icon className={`h-8 w-8 text-${stat.color}-400 mx-auto mb-3`} />
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className={`text-sm text-${stat.color}-300`}>{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Team Section */}
          <motion.section 
            className="mb-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <motion.h2 
              className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent text-center mb-12"
              whileHover={{ scale: 1.02 }}
            >
              NEURAL ENGINEERING TEAM
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-cyan-500/20 overflow-hidden hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 group"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <div className="relative overflow-hidden">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                      <h3 className="text-xl font-bold text-cyan-100">{member.name}</h3>
                      <p className="text-cyan-300 font-semibold">{member.role}</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-300 leading-relaxed">{member.bio}</p>
                    <div className="flex items-center gap-2 mt-4">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                      <span className="text-cyan-400 text-sm">ACTIVE NEURAL LINK</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Timeline */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            <motion.h2 
              className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent text-center mb-12"
              whileHover={{ scale: 1.02 }}
            >
              EVOLUTION TIMELINE
            </motion.h2>
            <div className="max-w-4xl mx-auto relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-purple-500 to-pink-500"></div>
              
              {timeline.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="flex items-start mb-8 relative"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 + index * 0.1 }}
                >
                  {/* Timeline dot */}
                  <div className="relative z-10">
                    <motion.div 
                      className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/30"
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.3 }}
                    >
                      {item.year}
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-purple-500/30 p-6 ml-8 flex-1 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
                    whileHover={{ scale: 1.01, x: 10 }}
                  >
                    <p className="text-cyan-100 text-lg leading-relaxed">{item.event}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      <span className="text-yellow-400 text-sm">BREAKTHROUGH ACHIEVED</span>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.section
            className="text-center mt-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <motion.div 
              className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-12 hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-500"
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-4xl font-bold text-cyan-300 mb-6">
                READY FOR CYBERNETIC EVOLUTION?
              </h3>
              <p className="text-cyan-200 text-xl mb-8 max-w-2xl mx-auto">
                Join the revolution and experience the future of fitness today. 
                Your journey to peak physical performance starts now.
              </p>
              <motion.button
                className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                INITIATE TRAINING PROTOCOL
              </motion.button>
            </motion.div>
          </motion.section>
        </main>
      </div>
    </div>
  );
};

export default About;