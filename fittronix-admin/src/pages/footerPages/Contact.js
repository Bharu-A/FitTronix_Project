// src/pages/Contact.js
import React, { useState } from 'react';
import { motion, AnimatePresence  } from 'framer-motion';
import { 
  Send, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Cpu,
  Network,
  MessageSquare,
  Zap,
  Shield,
  Brain,
  Satellite,
  User,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'IDENTIFICATION REQUIRED';
    if (!formData.email.trim()) {
      newErrors.email = 'COMMUNICATION FREQUENCY REQUIRED';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'INVALID FREQUENCY PATTERN';
    }
    if (!formData.subject.trim()) newErrors.subject = 'TRANSMISSION SUBJECT REQUIRED';
    if (!formData.message.trim()) newErrors.message = 'MESSAGE CONTENT REQUIRED';
    else if (formData.message.length < 10) newErrors.message = 'MESSAGE MUST CONTAIN MINIMUM 10 CHARACTERS';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('');

    try {
      await addDoc(collection(db, 'contactMessages'), {
        ...formData,
        createdAt: serverTimestamp(),
        status: 'new',
        priority: 'normal'
      });

      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('Error adding document: ', err);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Enhanced Cyber Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-cyan-900/10 pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500/10 via-gray-900 to-purple-900/20 pointer-events-none"></div>
      
      {/* Main Content */}
      <div className="relative z-10">
        

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-[87px]">
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
              INITIATE CONTACT PROTOCOL
            </motion.h1>
            <motion.p 
              className="text-xl text-cyan-200 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Establish neural link with our cyber fitness network. Your message will be processed 
              through our AI communication matrix and routed to the appropriate neural unit.
            </motion.p>
          </motion.section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div 
              className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-8 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="h-8 w-8 text-cyan-400" />
                <h2 className="text-3xl font-bold text-cyan-300">TRANSMISSION FORM</h2>
              </div>

              {/* Status Messages */}
              <AnimatePresence>
                {submitStatus === 'success' && (
                  <motion.div 
                    className="bg-green-900/30 border border-green-500/50 text-green-300 px-6 py-4 rounded-xl mb-6 flex items-center gap-3"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    <span>TRANSMISSION SUCCESSFUL! Neural response unit activated.</span>
                  </motion.div>
                )}
                
                {submitStatus === 'error' && (
                  <motion.div 
                    className="bg-red-900/30 border border-red-500/50 text-red-300 px-6 py-4 rounded-xl mb-6 flex items-center gap-3"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <AlertCircle className="h-5 w-5" />
                    <span>TRANSMISSION FAILED! Please recalibrate and retry.</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-cyan-400 mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    OPERATOR IDENTIFICATION *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-4 bg-gray-700/50 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-cyan-300/40 font-mono ${
                      errors.name ? 'border-red-500/50 bg-red-900/20' : 'border-cyan-500/30'
                    }`}
                    placeholder="ENTER YOUR DESIGNATION"
                  />
                  {errors.name && (
                    <motion.p 
                      className="text-red-400 text-sm mt-2 flex items-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errors.name}
                    </motion.p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-cyan-400 mb-3 flex items-center gap-2">
                    <Satellite className="h-4 w-4" />
                    COMMUNICATION FREQUENCY *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-4 bg-gray-700/50 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-cyan-300/40 font-mono ${
                      errors.email ? 'border-red-500/50 bg-red-900/20' : 'border-purple-500/30'
                    }`}
                    placeholder="OPERATOR@DOMAIN.NET"
                  />
                  {errors.email && (
                    <motion.p 
                      className="text-red-400 text-sm mt-2 flex items-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                {/* Subject Field */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-cyan-400 mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    TRANSMISSION SUBJECT *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`w-full px-4 py-4 bg-gray-700/50 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-cyan-300/40 font-mono ${
                      errors.subject ? 'border-red-500/50 bg-red-900/20' : 'border-pink-500/30'
                    }`}
                    placeholder="SPECIFY TRANSMISSION PURPOSE"
                  />
                  {errors.subject && (
                    <motion.p 
                      className="text-red-400 text-sm mt-2 flex items-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errors.subject}
                    </motion.p>
                  )}
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-cyan-400 mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    MESSAGE CONTENT *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full px-4 py-4 bg-gray-700/50 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-cyan-300/40 font-mono resize-none ${
                      errors.message ? 'border-red-500/50 bg-red-900/20' : 'border-cyan-500/30'
                    }`}
                    placeholder="INPUT YOUR MESSAGE FOR NEURAL PROCESSING..."
                  />
                  {errors.message && (
                    <motion.p 
                      className="text-red-400 text-sm mt-2 flex items-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errors.message}
                    </motion.p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  whileHover={{ scale: isSubmitting ? 1 : 1.02, y: isSubmitting ? 0 : -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>INITIATING TRANSMISSION...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>ACTIVATE TRANSMISSION PROTOCOL</span>
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>

            {/* Contact Information */}
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-6">
                  NEURAL NETWORK ACCESS
                </h2>
                <p className="text-cyan-200 text-lg mb-8 leading-relaxed">
                  Multiple communication channels available for establishing neural link. 
                  Our AI systems monitor all frequencies 24/7 for immediate response protocols.
                </p>
              </div>

              <div className="space-y-6">
                {/* Location */}
                <motion.div 
                  className="flex items-start p-6 bg-gray-800/30 backdrop-blur-md rounded-2xl border border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="bg-cyan-500/20 rounded-xl p-4 mr-4 border border-cyan-500/30">
                    <MapPin className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-cyan-300 mb-2 text-lg">NEURAL COMMAND CENTER</h3>
                    <p className="text-cyan-200">
                      Cyber Fitness District<br />
                      Neural Network Sector 7<br />
                      San Francisco, CA 94107
                    </p>
                  </div>
                </motion.div>

                {/* Phone */}
                <motion.div 
                  className="flex items-start p-6 bg-gray-800/30 backdrop-blur-md rounded-2xl border border-purple-500/20 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="bg-purple-500/20 rounded-xl p-4 mr-4 border border-purple-500/30">
                    <Phone className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-purple-300 mb-2 text-lg">VOICE COMMUNICATION</h3>
                    <p className="text-purple-200">
                      +1 (555) 901-NEURAL<br />
                      <span className="text-purple-300/70">Active: 06:00 - 22:00 UTC</span>
                    </p>
                  </div>
                </motion.div>

                {/* Email */}
                <motion.div 
                  className="flex items-start p-6 bg-gray-800/30 backdrop-blur-md rounded-2xl border border-pink-500/20 hover:border-pink-500/40 hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="bg-pink-500/20 rounded-xl p-4 mr-4 border border-pink-500/30">
                    <Mail className="h-6 w-6 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-pink-300 mb-2 text-lg">DIGITAL TRANSMISSION</h3>
                    <p className="text-pink-200">
                      neural.support@fittronix.ai<br />
                      protocol.assist@fittronix.ai
                    </p>
                  </div>
                </motion.div>

                {/* Response Time */}
                <motion.div 
                  className="flex items-start p-6 bg-gray-800/30 backdrop-blur-md rounded-2xl border border-green-500/20 hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="bg-green-500/20 rounded-xl p-4 mr-4 border border-green-500/30">
                    <Clock className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-300 mb-2 text-lg">RESPONSE PROTOCOL</h3>
                    <p className="text-green-200">
                      Average Response: <span className="text-green-400">2.7 hours</span><br />
                      Priority Support: <span className="text-green-400">24/7 Active</span>
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* System Status */}
              <motion.div 
                className="bg-gradient-to-br from-cyan-900/30 to-purple-900/30 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Cpu className="h-6 w-6 text-cyan-400" />
                  <h3 className="text-xl font-bold text-cyan-300">SYSTEM STATUS</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-200">Neural Network</span>
                    <span className="text-green-400 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      OPERATIONAL
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
              </motion.div>

              {/* Security Notice */}
              <motion.div 
                className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-md rounded-2xl border border-purple-500/30 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="h-5 w-5 text-purple-400" />
                  <h4 className="font-bold text-purple-300">SECURITY PROTOCOL</h4>
                </div>
                <p className="text-purple-200 text-sm">
                  All transmissions are encrypted using quantum-safe algorithms. 
                  Your neural data is protected by our advanced cyber security matrix.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Contact;