import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const FitTronixProPlan = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  const handleActivatePro = async () => {
    setLoading(true);
    try {
      // 1️⃣ Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 2️⃣ Calculate dates
      const startDate = new Date();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30); // 30 days from now

      // 3️⃣ Update user membership in Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          membership: {
            plan: "Pro",
            price: 499,
            duration: "1 Month",
            startDate: startDate.toISOString(),
            expiryDate: expiryDate.toISOString(),
            status: "active",
            features: [
              "AI Posture Analysis",
              "Personalized Workouts",
              "Progress Tracking Dashboard",
              "Leaderboard Access",
              "Priority Support",
              "Unlimited Workouts"
            ]
          },
          lastUpdated: serverTimestamp()
        },
        { merge: true } // merges with existing data, doesn't overwrite
      );

      // 4️⃣ Show success alert
      alert("✅ Payment successful! Your Pro Plan is now active.");

      // 5️⃣ Redirect to dashboard
      navigate("/dashboard");

      // 6️⃣ Reload page to update Sidebar instantly
      window.location.reload();

    } catch (error) {
      console.error("Error activating Pro plan:", error);
      alert("❌ Failed to activate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: "🤖",
      title: "AI Posture Analysis",
      description: "Real-time feedback on your form using advanced computer vision"
    },
    {
      icon: "📊",
      title: "Personalized Workouts",
      description: "Custom training plans adapted to your progress and goals"
    },
    {
      icon: "🏆",
      title: "Progress Tracking",
      description: "Detailed analytics and performance metrics"
    },
    {
      icon: "👥",
      title: "Leaderboard Access",
      description: "Compete with other cyber athletes worldwide"
    },
    {
      icon: "⚡",
      title: "Priority Support",
      description: "24/7 access to our fitness experts"
    },
    {
      icon: "🎯",
      title: "Unlimited Workouts",
      description: "Access to all premium workout modules"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden pt-[90px]">
      {/* Enhanced Background for Pro Plan */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-cyan-900/20 to-purple-900/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500/15 via-gray-900 to-gray-900"></div>
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.2) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(6, 182, 212, 0.2) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        ></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-600"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            PRO PLAN ACTIVATION
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-6">
            Unlock Pro Features
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Elevate your fitness with AI-powered training, advanced analytics, and exclusive features.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -5 }}
                className="backdrop-blur-md bg-gray-800/50 border border-cyan-500/30 rounded-xl p-6 hover:shadow-cyan-500/20 hover:shadow-xl transition-all duration-300"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Activation Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="backdrop-blur-md bg-gray-800/50 border border-cyan-500/40 rounded-2xl p-8 relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-30"></div>
            <div className="relative">
              <div className="text-center mb-8">
                <div className="text-4xl font-bold bg-gradient-to-r from-cyan-200 to-purple-200 bg-clip-text text-transparent mb-2">
                  ₹499<span className="text-lg text-gray-400">/month</span>
                </div>
                <p className="text-gray-300">Cancel anytime • 7-day money back guarantee</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between py-3 border-b border-gray-700">
                  <span className="text-gray-300">AI Training Features</span>
                  <span className="text-cyan-400">✓</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-700">
                  <span className="text-gray-300">Advanced Analytics</span>
                  <span className="text-cyan-400">✓</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-700">
                  <span className="text-gray-300">Priority Support</span>
                  <span className="text-cyan-400">✓</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-700">
                  <span className="text-gray-300">Exclusive Content</span>
                  <span className="text-cyan-400">✓</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: loading ? 1 : 1.05 }}
                whileTap={{ scale: loading ? 1 : 0.95 }}
                onClick={handleActivatePro}
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold uppercase py-4 px-6 rounded-lg text-lg transition-all duration-300 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Processing...
                  </div>
                ) : (
                  'Activate Now'
                )}
              </motion.button>

              <p className="text-center text-gray-400 text-sm mt-4">
                Secure payment • Encrypted data • No hidden fees
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FitTronixProPlan;