import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, getUserData } from '../firebase';

const FitTronixPlans = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Free',
      price: '$0',
      features: [
        'Basic workout tracking',
        '3 AI form analyses per week',
        'Standard exercise library',
        'Community support',
        'Progress dashboard'
      ],
      gradient: 'from-green-500 to-cyan-600',
      borderColor: 'border-green-500/30'
    },
    {
      name: 'Pro',
      price: '$19.99',
      features: [
        'Unlimited AI form analysis',
        'Personalized workout plans',
        'Advanced analytics',
        'Priority support',
        'Custom exercise creation',
        'Real-time coaching'
      ],
      gradient: 'from-cyan-500 to-purple-600',
      borderColor: 'border-cyan-500/30'
    },
    {
      name: 'Elite',
      price: '$39.99',
      features: [
        'Everything in Pro',
        '1-on-1 virtual trainer',
        'Nutrition planning',
        'Early feature access',
        'Dedicated success manager',
        'Custom AI model training',
        '24/7 premium support'
      ],
      gradient: 'from-pink-500 to-purple-600',
      borderColor: 'border-pink-500/30'
    }
  ];

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      fetchUserData(currentUser.uid);
    }
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const data = await getUserData(userId);
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };


const handleSelectPlan = async (planName) => {
  // 🔹 Skip Firebase update since database is not used yet
  setUpdating(true);

  try {
    setSuccess(true);

    // Redirect to the correct hardcoded page after short animation
    setTimeout(() => {
      if (planName === 'Pro') {
  navigate('/fitronixProPlan');
} else if (planName === 'Elite') {
  navigate('/fitronixElitePlan');
} else {
  navigate('/dashboard');
}

    }, 1500);
  } catch (error) {
    console.error('Error navigating:', error);
  } finally {
    setUpdating(false);
  }
};



  const isCurrentPlan = (planName) => {
    return userData?.subscription?.plan === planName;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-300">Loading cyber plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden ">
      {/* Cyber-futuristic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-cyan-900/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-gray-900 to-gray-900"></div>
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }}
        ></div>
        
        {/* Animated Grid Lines */}
        <motion.div
          className="absolute inset-0 opacity-5"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%']
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={{
            backgroundImage: `linear-gradient(45deg, transparent 45%, rgba(6, 182, 212, 0.3) 50%, transparent 55%)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/FitTronixDashboard')}
            className="mb-6 px-6 py-2 bg-gray-800/50 backdrop-blur-md border border-cyan-500/30 rounded-full text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/50 transition-all duration-300"
          >
            ← Back to Dashboard
          </motion.button>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
            Upgrade Your Cyber Fitness
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
            Choose your path to peak performance. Unleash the full potential of AI-powered fitness.
          </p>

          {userData?.subscription?.plan && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block mt-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full text-white text-sm font-semibold"
            >
              Current Plan: {userData.subscription.plan}
            </motion.div>
          )}
        </motion.div>

        {/* Success Animation */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-50"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="bg-gray-800 border border-cyan-500/30 rounded-2xl p-8 text-center"
              >
                <motion.div
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="w-16 h-16 mx-auto mb-4"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="text-green-500">
                    <motion.path
                      d="M20 6L9 17L4 12"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    />
                  </svg>
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">Plan Activated!</h3>
                <p className="text-gray-300">Redirecting to your dashboard...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className={`relative backdrop-blur-md bg-gray-800/30 border-2 rounded-2xl p-6 ${
                isCurrentPlan(plan.name) 
                  ? 'border-cyan-500 shadow-lg shadow-cyan-500/20' 
                  : plan.borderColor
              } hover:shadow-xl hover:shadow-${plan.name === 'Elite' ? 'pink' : plan.name === 'Pro' ? 'cyan' : 'green'}-500/20 transition-all duration-300`}
            >
              {/* Current Plan Badge */}
              {isCurrentPlan(plan.name) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                >
                  <div className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    Current Plan
                  </div>
                </motion.div>
              )}

              {/* Plan Header */}
              <div className={`bg-gradient-to-r ${plan.gradient} rounded-xl p-6 mb-6 text-white text-center`}>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold">{plan.price}</div>
                <div className="text-white/80 text-sm mt-1">
                  {plan.name === 'Free' ? 'forever' : 'per month'}
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <motion.li
                    key={featureIndex}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + featureIndex * 0.05 }}
                    className="flex items-center text-gray-300"
                  >
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${plan.gradient} mr-3`}></div>
                    {feature}
                  </motion.li>
                ))}
              </ul>

              {/* Select Button */}
              <motion.button
                whileHover={{ scale: isCurrentPlan(plan.name) ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => !isCurrentPlan(plan.name) && handleSelectPlan(plan.name)}
                disabled={updating || isCurrentPlan(plan.name)}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isCurrentPlan(plan.name)
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-lg hover:shadow-${plan.name === 'Elite' ? 'pink' : plan.name === 'Pro' ? 'cyan' : 'green'}-500/30`
                }`}
              >
                {updating ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Activating...
                  </div>
                ) : isCurrentPlan(plan.name) ? (
                  'Current Plan'
                ) : (
                  'Select Plan'
                )}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12 text-gray-400"
        >
          <p>All plans include our core AI fitness technology. Upgrade anytime.</p>
          <p className="text-sm mt-2">Secure payment powered by Firebase</p>
        </motion.div>
      </div>
    </div>
  );
};

export default FitTronixPlans;