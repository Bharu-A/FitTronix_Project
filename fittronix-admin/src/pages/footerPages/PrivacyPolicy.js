// src/pages/PrivacyPolicy.js
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  Cpu,
  Network,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Globe,
  Server,
  Key,
  ShieldCheck
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, serverTimestamp, orderBy, query } from 'firebase/firestore';

const PrivacyPolicy = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [activeSection, setActiveSection] = useState(null);

  // Fetch policy content from Firestore
  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const q = query(collection(db, 'privacyPolicy'), orderBy('order', 'asc'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSections(data);
        
        // Set last updated date
        if (data.length > 0) {
          const latestUpdate = data.reduce((latest, section) => {
            const sectionDate = section.updatedAt?.toDate();
            return sectionDate > latest ? sectionDate : latest;
          }, new Date(0));
          setLastUpdated(latestUpdate.toLocaleDateString());
        }
      } catch (err) {
        console.error('Error fetching privacy policy:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, []);

  // Log page view
  useEffect(() => {
    const logView = async () => {
      try {
        await addDoc(collection(db, 'privacyPolicyViews'), {
          viewedAt: serverTimestamp(),
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error logging privacy policy view:', err);
      }
    };

    logView();
  }, []);

  // Default sections if Firestore is empty
  const defaultSections = [
    {
      id: '1',
      title: 'NEURAL DATA PROTECTION PROTOCOL',
      icon: Shield,
      content: `Our cyber fitness platform implements advanced quantum encryption to safeguard your biometric data, neural patterns, and training metrics. All data transmissions are secured through military-grade encryption protocols.

KEY SECURITY FEATURES:
• Real-time neural data encryption
• Biometric authentication layers
• Quantum-resistant algorithms
• Continuous security monitoring
• Automated threat detection systems

Your fitness journey is protected by our AI-driven security matrix that operates 24/7 to ensure complete data integrity and privacy.`
    },
    {
      id: '2',
      title: 'DATA COLLECTION MATRIX',
      icon: Database,
      content: `We collect essential data to optimize your cyber fitness experience while maintaining strict privacy boundaries.

DATA CATEGORIES COLLECTED:
• Biometric Measurements (heart rate, muscle activation, form accuracy)
• Training Performance Metrics (workout intensity, progress tracking)
• Neural Network Interactions (AI feedback responses, adaptation patterns)
• Device Information (camera feeds, sensor data for form analysis)
• Usage Analytics (training frequency, preference settings)

All data collection follows the principle of minimal necessary information to provide optimal AI-driven fitness guidance.`
    },
    {
      id: '3',
      title: 'AI PROCESSING SYSTEMS',
      icon: Cpu,
      content: `Our neural networks process your fitness data to deliver personalized training experiences through advanced machine learning algorithms.

PROCESSING PROTOCOLS:
• Real-time form analysis and correction
• Predictive performance modeling
• Adaptive workout difficulty scaling
• Personalized recovery recommendations
• Progress trend analysis and forecasting

All AI processing occurs within our secure cyber infrastructure with multiple layers of data anonymization and protection.`
    },
    {
      id: '4',
      title: 'THIRD-PARTY SECURITY INTEGRATIONS',
      icon: Network,
      content: `We maintain strict control over data sharing and only integrate with verified security-certified partners.

INTEGRATION STANDARDS:
• Zero-knowledge data sharing protocols
• End-to-end encryption for all external communications
• Regular security audits of third-party services
• Limited data exposure based on specific functionality requirements
• Immediate revocation capabilities for all external access

Your data remains protected even when interacting with our certified partner ecosystem.`
    },
    {
      id: '5',
      title: 'USER RIGHTS & CONTROL SYSTEMS',
      icon: Users,
      content: `Maintain complete control over your cyber fitness data with our comprehensive rights management system.

USER CONTROL FEATURES:
• Real-time data access and export capabilities
• Granular privacy preference settings
• One-click data deletion protocols
• Training history management tools
• Communication preference controls

Exercise your data sovereignty rights through our intuitive control panel accessible 24/7.`
    }
  ];

  const displaySections = sections.length > 0 ? sections : defaultSections;

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full"
      />
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
              CYBER SECURITY PROTOCOL
            </motion.h1>
            <nav className="flex space-x-6">
              {['Home', 'About', 'Blog', 'Contact'].map((item) => (
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

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <motion.section 
            className="text-center mb-16"
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
              QUANTUM PRIVACY MATRIX
            </motion.h1>
            <motion.p 
              className="text-xl text-cyan-200 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Advanced data protection protocols for your cyber fitness journey. 
              Our multi-layered security infrastructure ensures complete privacy and control over your neural training data.
            </motion.p>
            
            {/* Last Updated */}
            <motion.div 
              className="mt-6 flex items-center justify-center gap-4 text-cyan-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Clock className="h-5 w-5" />
              <span className="font-mono">PROTOCOL UPDATED: {lastUpdated || new Date().toLocaleDateString()}</span>
            </motion.div>
          </motion.section>

          {/* Security Status Banner */}
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="bg-gradient-to-r from-green-900/30 to-cyan-900/30 backdrop-blur-md rounded-2xl border border-green-500/30 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <ShieldCheck className="h-8 w-8 text-green-400" />
                  <div>
                    <h3 className="text-xl font-bold text-green-300">SECURITY MATRIX: ACTIVE</h3>
                    <p className="text-green-200">All privacy protocols operating at optimal levels</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-green-400 font-bold">256-bit</div>
                    <div className="text-green-300">ENCRYPTION</div>
                  </div>
                  <div className="text-center">
                    <div className="text-cyan-400 font-bold">99.99%</div>
                    <div className="text-cyan-300">UPTIME</div>
                  </div>
                  <div className="text-center">
                    <div className="text-purple-400 font-bold">24/7</div>
                    <div className="text-purple-300">MONITORING</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Table of Contents */}
            <motion.div 
              className="lg:col-span-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <div className="bg-gray-800/30 backdrop-blur-md rounded-2xl border border-purple-500/20 p-6 sticky top-6">
                <h3 className="text-lg font-bold text-purple-300 mb-4 flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  PROTOCOL SECTIONS
                </h3>
                <nav className="space-y-2">
                  {displaySections.map((section, index) => (
                    <motion.button
                      key={section.id}
                      onClick={() => setActiveSection(activeSection === index ? null : index)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-3 ${
                        activeSection === index
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'text-gray-400 hover:text-cyan-300 hover:bg-cyan-500/10'
                      }`}
                      whileHover={{ scale: 1.02, x: 5 }}
                    >
                      <section.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{section.title}</span>
                    </motion.button>
                  ))}
                </nav>

                {/* Quick Security Info */}
                <div className="mt-8 pt-6 border-t border-cyan-500/20">
                  <h4 className="text-sm font-bold text-cyan-300 mb-3">SECURITY STATUS</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-200">Data Encryption</span>
                      <span className="text-green-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        ACTIVE
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-200">AI Monitoring</span>
                      <span className="text-green-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        OPTIMAL
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-200">Threat Detection</span>
                      <span className="text-green-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        ENABLED
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Policy Content */}
            <motion.div 
              className="lg:col-span-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
            >
              <AnimatePresence mode="wait">
                {activeSection !== null ? (
                  <motion.div
                    key={activeSection}
                    className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-8 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-cyan-500/20 rounded-xl border border-cyan-500/30">
                    {React.createElement(displaySections[activeSection].icon, {
                      className: "h-6 w-6 text-cyan-400"
                    })}
                  </div>
                  <h2 className="text-3xl font-bold text-cyan-300">
                    {displaySections[activeSection].title}
                  </h2>
                </div>

                    
                    <div className="prose prose-invert max-w-none">
                      <div className="text-cyan-200 leading-relaxed text-lg whitespace-pre-line">
                        {displaySections[activeSection].content}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-12 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Shield className="h-16 w-16 text-cyan-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-cyan-300 mb-4">
                      SELECT SECURITY PROTOCOL
                    </h3>
                    <p className="text-cyan-200 text-lg max-w-md mx-auto">
                      Choose a section from the navigation panel to explore our comprehensive 
                      privacy and security protocols for your cyber fitness data.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Additional Security Information */}
              <motion.div 
                className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                {/* Compliance */}
                <div className="bg-gray-800/30 backdrop-blur-md rounded-2xl border border-green-500/20 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 className="h-6 w-6 text-green-400" />
                    <h4 className="text-lg font-bold text-green-300">COMPLIANCE STANDARDS</h4>
                  </div>
                  <p className="text-green-200 text-sm">
                    Our security protocols exceed industry standards including GDPR, CCPA, 
                    and international data protection regulations.
                  </p>
                </div>

                {/* Updates */}
                <div className="bg-gray-800/30 backdrop-blur-md rounded-2xl border border-purple-500/20 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="h-6 w-6 text-purple-400" />
                    <h4 className="text-lg font-bold text-purple-300">PROTOCOL UPDATES</h4>
                  </div>
                  <p className="text-purple-200 text-sm">
                    Security measures are continuously enhanced through AI-driven threat analysis 
                    and regular security audits.
                  </p>
                </div>
              </motion.div>

              {/* Contact Security */}
              <motion.div 
                className="mt-8 bg-gradient-to-r from-cyan-900/30 to-purple-900/30 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
              >
                <AlertTriangle className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-cyan-300 mb-4">
                  SECURITY CONCERNS?
                </h3>
                <p className="text-cyan-200 text-lg mb-6 max-w-2xl mx-auto">
                  Our dedicated security team is available 24/7 to address any privacy concerns 
                  or security-related inquiries.
                </p>
                <motion.a
                  href="/contact"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Shield className="h-5 w-5" />
                  CONTACT SECURITY TEAM
                </motion.a>
              </motion.div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PrivacyPolicy;