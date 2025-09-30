// src/pages/FAQ.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  HelpCircle, 
  MessageSquare, 
  Zap, 
  Cpu,
  Brain,
  Network,
  Shield,
  Rocket,
  Search,
  Filter,
  AlertCircle,
  Lightbulb,
  Target
} from 'lucide-react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [openItems, setOpenItems] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const q = query(collection(db, 'faqs'), orderBy('order', 'asc'));
        const querySnapshot = await getDocs(q);
        const faqData = [];
        querySnapshot.forEach(doc => {
          faqData.push({ id: doc.id, ...doc.data() });
        });
        setFaqs(faqData);
        extractCategories(faqData);
      } catch (err) {
        console.error('Error fetching FAQs:', err);
        setError('NEURAL NETWORK ERROR: Failed to load knowledge base');
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const extractCategories = (faqs) => {
    const uniqueCategories = [...new Set(faqs.map(faq => faq.category || 'general'))];
    setCategories(['all', ...uniqueCategories]);
  };

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  // Filter FAQs based on search and category
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
              NEURAL KNOWLEDGE BASE
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
              CYBER INTELLIGENCE MATRIX
            </motion.h1>
            <motion.p 
              className="text-xl text-cyan-200 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Access our neural knowledge database for instant solutions to common cyber fitness protocols, 
              AI training systems, and neural network operations.
            </motion.p>
          </motion.section>

          {/* Search and Filters */}
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cyan-400" />
                  <input
                    type="text"
                    placeholder="SCAN KNOWLEDGE DATABASE..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-700/50 border border-cyan-500/30 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-cyan-300/60 font-mono"
                  />
                </div>
                
                {/* Category Filter */}
                <div className="flex items-center gap-4">
                  <Filter className="h-5 w-5 text-purple-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-gray-700/50 border border-purple-500/30 rounded-xl px-4 py-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white"
                  >
                    {categories.map(category => (
                      <option key={category} value={category} className="bg-gray-800">
                        {category.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.section>

          {/* FAQ Grid */}
          <motion.section
            className="mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Quick Stats */}
              <motion.div 
                className="lg:col-span-3 bg-gradient-to-br from-cyan-900/30 to-purple-900/30 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 mb-8"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: 'NEURAL ENTRIES', value: faqs.length, icon: Brain, color: 'cyan' },
                    { label: 'ACTIVE CATEGORIES', value: categories.length - 1, icon: Network, color: 'purple' },
                    { label: 'RESOLUTION RATE', value: '99.8%', icon: Target, color: 'green' },
                    { label: 'RESPONSE TIME', value: '<2.3s', icon: Zap, color: 'pink' }
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      className="text-center p-4 bg-gray-800/30 rounded-xl border border-cyan-500/20"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.1 + index * 0.1 }}
                    >
                      <stat.icon className={`h-8 w-8 text-${stat.color}-400 mx-auto mb-3`} />
                      <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                      <div className={`text-sm text-${stat.color}-300`}>{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* FAQ List */}
              <div className="lg:col-span-2">
                <AnimatePresence>
                  {filteredFaqs.length === 0 ? (
                    <motion.div 
                      className="text-center py-16 bg-gray-800/30 backdrop-blur-md rounded-2xl border border-purple-500/20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <HelpCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-gray-400 mb-2">NO NEURAL PATTERNS FOUND</h3>
                      <p className="text-gray-500">
                        No FAQs match your current search parameters. Try adjusting your filters.
                      </p>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      {filteredFaqs.map((faq, index) => (
                        <motion.div
                          key={faq.id}
                          className="bg-gray-800/30 backdrop-blur-md rounded-2xl border border-cyan-500/20 overflow-hidden hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.2 + index * 0.1 }}
                          whileHover={{ scale: 1.01 }}
                        >
                          <motion.button
                            className="w-full px-6 py-6 text-left flex justify-between items-center group"
                            onClick={() => toggleItem(index)}
                            whileHover={{ x: 5 }}
                          >
                            <div className="flex items-start gap-4 flex-1">
                              <div className={`p-2 rounded-lg bg-${getCategoryColor(faq.category)}/20 border border-${getCategoryColor(faq.category)}/30 mt-1`}>
                                <HelpCircle className={`h-5 w-5 text-${getCategoryColor(faq.category)}-400`} />
                              </div>
                              <div className="flex-1 text-left">
                                <h3 className="text-lg font-semibold text-cyan-100 group-hover:text-cyan-50 transition-colors pr-4">
                                  {faq.question}
                                </h3>
                                {faq.category && (
                                  <span className={`inline-block mt-2 px-3 py-1 bg-${getCategoryColor(faq.category)}/20 text-${getCategoryColor(faq.category)}-300 text-xs rounded-full border border-${getCategoryColor(faq.category)}/30`}>
                                    {faq.category.toUpperCase()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <motion.span 
                              className={`transform transition-transform duration-300 ${openItems.has(index) ? 'rotate-180' : ''}`}
                              animate={{ rotate: openItems.has(index) ? 180 : 0 }}
                            >
                              <ChevronDown className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" />
                            </motion.span>
                          </motion.button>
                          
                          <AnimatePresence>
                            {openItems.has(index) && (
                              <motion.div
                                className="px-6 pb-6"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="pl-12">
                                  <p className="text-cyan-200 leading-relaxed text-lg">{faq.answer}</p>
                                  {faq.tips && (
                                    <div className="mt-4 p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Lightbulb className="h-4 w-4 text-yellow-400" />
                                        <span className="text-yellow-400 font-semibold">PRO TIP</span>
                                      </div>
                                      <p className="text-yellow-200 text-sm">{faq.tips}</p>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sidebar - Quick Help */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 }}
              >
                {/* Quick Actions */}
                <div className="bg-gray-800/30 backdrop-blur-md rounded-2xl border border-purple-500/20 p-6">
                  <h3 className="text-xl font-bold text-purple-300 mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    QUICK ACTIONS
                  </h3>
                  <div className="space-y-3">
                    <motion.a
                      href="/contact"
                      className="flex items-center gap-3 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/20 transition-all duration-300 group"
                      whileHover={{ scale: 1.02, x: 5 }}
                    >
                      <MessageSquare className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold text-cyan-300">NEURAL SUPPORT</span>
                    </motion.a>
                    <motion.button
                      className="w-full flex items-center gap-3 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl hover:bg-purple-500/20 transition-all duration-300 group"
                      whileHover={{ scale: 1.02, x: 5 }}
                    >
                      <Rocket className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold text-purple-300">LIVE CHAT</span>
                    </motion.button>
                  </div>
                </div>

                {/* System Status */}
                <div className="bg-gray-800/30 backdrop-blur-md rounded-2xl border border-green-500/20 p-6">
                  <h3 className="text-xl font-bold text-green-300 mb-4 flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    SYSTEM STATUS
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-200">Knowledge Base</span>
                      <span className="text-green-400 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        ONLINE
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-200">AI Processing</span>
                      <span className="text-green-400 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        OPTIMAL
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-200">Response Matrix</span>
                      <span className="text-green-400 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        ACTIVE
                      </span>
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-gray-800/30 backdrop-blur-md rounded-2xl border border-pink-500/20 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-pink-400" />
                    <h4 className="font-bold text-pink-300">NEURAL SECURITY</h4>
                  </div>
                  <p className="text-pink-200 text-sm">
                    All knowledge entries are verified through our AI security matrix. 
                    Your data remains protected by quantum encryption protocols.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.section
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
          >
            <motion.div 
              className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-12 hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-500"
              whileHover={{ scale: 1.02 }}
            >
              <Brain className="h-16 w-16 text-cyan-400 mx-auto mb-6" />
              <h3 className="text-4xl font-bold text-cyan-300 mb-6">
                NEED ADVANCED NEURAL ASSISTANCE?
              </h3>
              <p className="text-cyan-200 text-xl mb-8 max-w-2xl mx-auto">
                Our AI support matrix is ready to provide personalized solutions for your unique cyber fitness challenges.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href="/contact"
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 flex items-center justify-center gap-3"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MessageSquare className="h-5 w-5" />
                  ACTIVATE SUPPORT PROTOCOL
                </motion.a>
                <motion.button
                  className="border border-cyan-500 text-cyan-300 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-cyan-500/10 transition-all duration-300 flex items-center justify-center gap-3"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Rocket className="h-5 w-5" />
                  INITIATE LIVE CHAT
                </motion.button>
              </div>
            </motion.div>
          </motion.section>
        </main>
      </div>
    </div>
  );
};

// Helper function to get category colors
const getCategoryColor = (category) => {
  const colorMap = {
    'general': 'cyan',
    'technical': 'purple',
    'billing': 'pink',
    'account': 'green',
    'workouts': 'yellow',
    'ai': 'blue'
  };
  return colorMap[category] || 'cyan';
};

export default FAQ;