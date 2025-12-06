import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const FitTronixElitePlan = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  const handleActivateElite = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        alert("Please log in to continue");
        return;
      }

      // 1️⃣ Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 2️⃣ Update user membership in Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        membership: {
          plan: "Elite",
          status: "active",
          price: 999,
          duration: "monthly",
          startDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          features: [
            "1-on-1 AI trainer",
            "Advanced analytics",
            "Early access",
            "Premium support",
            "Custom nutrition plans",
            "Elite community access"
          ]
        },
        lastUpdated: serverTimestamp()
      });

      // 3️⃣ Show success alert
      alert("✅ Payment successful! Your Elite Plan is now active.");

      // 4️⃣ Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("❌ Error activating Elite plan:", error);
      alert("❌ Failed to activate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const eliteFeatures = [
    {
      icon: "👨‍💻",
      title: "1-on-1 Virtual AI Trainer",
      description: "Personal AI coach that adapts to your unique fitness journey"
    },
    {
      icon: "📈",
      title: "Advanced Biometric Analytics",
      description: "Deep insights into your performance and recovery metrics"
    },
    {
      icon: "🚀",
      title: "Early Access to New Modules",
      description: "Be the first to experience cutting-edge fitness technology"
    },
    {
      icon: "🎯",
      title: "Real-time AI Feedback",
      description: "Instant form correction and technique optimization"
    },
    {
      icon: "🍎",
      title: "Custom Nutrition Plans",
      description: "AI-generated meal plans tailored to your goals and preferences"
    },
    {
      icon: "🌟",
      title: "Exclusive Elite Community",
      description: "Network with top performers and fitness innovators"
    },
    {
      icon: "🛡️",
      title: "24/7 Premium Support",
      description: "Dedicated support team with instant response times"
    },
    {
      icon: "🔮",
      title: "Future Tech Preview",
      description: "Access to experimental features and beta programs"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden pt-[90px]">
      {/* Premium Background for Elite */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-pink-900/20 to-purple-900/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pink-500/20 via-gray-900 to-gray-900"></div>
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `linear-gradient(rgba(236, 72, 153, 0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(236, 72, 153, 0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        ></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-purple-600"></div>
        {/* Animated Orbs */}
        <div className="absolute top-20 right-20 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-gradient-to-r from-pink-500/30 to-purple-600/30 text-pink-300 border border-pink-500/40 px-6 py-3 rounded-full text-sm font-semibold mb-6">
            🚀 ELITE TIER ACCESS
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent mb-6">
            Enter Elite Mode
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Experience the pinnacle of cyber fitness with exclusive AI training and premium benefits.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Elite Features Grid */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {eliteFeatures.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -5 }}
                className="backdrop-blur-md bg-gray-800/50 border border-pink-500/40 rounded-xl p-6 hover:shadow-pink-500/30 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Elite Activation Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="backdrop-blur-md bg-gray-800/50 border border-pink-500/50 rounded-2xl p-8 relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl blur opacity-40 animate-pulse"></div>
            <div className="relative">
              <div className="text-center mb-8">
                <div className="text-5xl font-bold bg-gradient-to-r from-pink-200 to-purple-200 bg-clip-text text-transparent mb-2">
                  ₹999<span className="text-lg text-gray-400">/month</span>
                </div>
                <p className="text-gray-300">All Pro features included • VIP treatment</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between py-3 border-b border-gray-700">
                  <span className="text-gray-300">Personal AI Trainer</span>
                  <span className="text-pink-400 text-xl">⭐</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-700">
                  <span className="text-gray-300">Biometric Analytics</span>
                  <span className="text-pink-400 text-xl">⭐</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-700">
                  <span className="text-gray-300">Early Feature Access</span>
                  <span className="text-pink-400 text-xl">⭐</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-700">
                  <span className="text-gray-300">Nutrition Planning</span>
                  <span className="text-pink-400 text-xl">⭐</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-700">
                  <span className="text-gray-300">Elite Community</span>
                  <span className="text-pink-400 text-xl">⭐</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-300">24/7 Premium Support</span>
                  <span className="text-pink-400 text-xl">⭐</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: loading ? 1 : 1.05 }}
                whileTap={{ scale: loading ? 1 : 0.95 }}
                onClick={handleActivateElite}
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold uppercase py-4 px-6 rounded-lg text-lg transition-all duration-300 hover:shadow-pink-500/40 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                {loading ? (
                  <div className="flex items-center justify-center relative z-10">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Unlocking Elite...
                  </div>
                ) : (
                  <span className="relative z-10">Activate Elite Now</span>
                )}
              </motion.button>

              <div className="text-center mt-6 p-4 bg-gradient-to-r from-pink-500/10 to-purple-600/10 rounded-lg border border-pink-500/20">
                <p className="text-pink-300 text-sm font-semibold">
                  🎁 Includes 14-day free trial of all Elite features
                </p>
              </div>

              {/* Membership Details */}
              <div className="mt-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                <h4 className="text-white font-semibold mb-2">Membership Details:</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Plan: Elite Monthly</li>
                  <li>• Price: ₹999/month</li>
                  <li>• Duration: 30 days</li>
                  <li>• Auto-renewal: Enabled</li>
                  <li>• Cancel anytime</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="bg-gray-800/30 backdrop-blur-md border border-pink-500/20 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Why Choose Elite?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="text-center">
                <div className="text-3xl mb-2">🚀</div>
                <h4 className="text-white font-semibold mb-2">Cutting-Edge AI</h4>
                <p className="text-gray-300 text-sm">Most advanced fitness AI technology</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">💎</div>
                <h4 className="text-white font-semibold mb-2">Premium Experience</h4>
                <p className="text-gray-300 text-sm">VIP treatment and priority support</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🔮</div>
                <h4 className="text-white font-semibold mb-2">Future-Ready</h4>
                <p className="text-gray-300 text-sm">Access to upcoming features first</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FitTronixElitePlan;