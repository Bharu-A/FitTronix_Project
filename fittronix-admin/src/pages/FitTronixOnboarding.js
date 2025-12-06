import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, updateUserProfile } from '../firebase';

const FitTronixOnboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    fitnessLevel: '',
    focusArea: ''
  });
  const [loading, setLoading] = useState(false);

  const fitnessGoals = [
    'Weight Loss',
    'Muscle Building',
    'Endurance Training',
    'General Fitness',
    'Posture Correction',
    'Athletic Performance'
  ];

  const fitnessLevels = ['Beginner', 'Intermediate', 'Advanced'];
  const focusAreas = ['Upper Body', 'Lower Body', 'Core', 'Full Body', 'Flexibility', 'Cardio'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContinue = async () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Submit form
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (user) {
          await updateUserProfile(user.uid, formData);
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error saving profile:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return formData.name.trim().length >= 2;
      case 2: return formData.goal !== '';
      case 3: return formData.fitnessLevel !== '';
      case 4: return formData.focusArea !== '';
      default: return false;
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-cyan-900/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/5 via-gray-900 to-gray-900"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent mb-4">
            Welcome to FitTronix
          </h1>
          <p className="text-xl text-gray-300">Let's personalize your cyber fitness journey</p>
        </motion.div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex justify-between items-center mb-4">
            {[1, 2, 3, 4].map(step => (
              <div key={step} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  step <= currentStep 
                    ? 'bg-cyan-500 border-cyan-500 text-white' 
                    : 'border-gray-600 text-gray-400'
                } font-semibold`}>
                  {step}
                </div>
                <span className="text-sm text-gray-400 mt-2">
                  {step === 1 && 'Name'}
                  {step === 2 && 'Goal'}
                  {step === 3 && 'Level'}
                  {step === 4 && 'Focus'}
                </span>
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-800 rounded-full">
            <motion.div 
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${(currentStep - 1) * 33.33}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Form Steps */}
        <div className="max-w-2xl mx-auto">
          <motion.div
            key={currentStep}
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="backdrop-blur-md bg-gray-800/50 border border-cyan-500/20 rounded-2xl p-8"
          >
            {currentStep === 1 && (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">What's Your Name, Cyber Athlete?</h2>
                <p className="text-gray-300 mb-6">Enter your name to begin your transformation</p>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-gray-800/30 border border-cyan-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">What's Your Primary Goal?</h2>
                <p className="text-gray-300 mb-6">Choose your fitness objective</p>
                <div className="grid grid-cols-2 gap-4">
                  {fitnessGoals.map(goal => (
                    <motion.button
                      key={goal}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleInputChange('goal', goal)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        formData.goal === goal
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-200'
                          : 'border-gray-600 bg-gray-700/30 text-gray-300 hover:border-cyan-400'
                      }`}
                    >
                      {goal}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">What's Your Fitness Level?</h2>
                <p className="text-gray-300 mb-6">Help us customize your workouts</p>
                <div className="space-y-4">
                  {fitnessLevels.map(level => (
                    <motion.button
                      key={level}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleInputChange('fitnessLevel', level)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        formData.fitnessLevel === level
                          ? 'border-purple-500 bg-purple-500/10 text-purple-200'
                          : 'border-gray-600 bg-gray-700/30 text-gray-300 hover:border-purple-400'
                      }`}
                    >
                      {level}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Focus Area</h2>
                <p className="text-gray-300 mb-6">Where do you want to focus your training?</p>
                <div className="grid grid-cols-2 gap-4">
                  {focusAreas.map(area => (
                    <motion.button
                      key={area}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleInputChange('focusArea', area)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        formData.focusArea === area
                          ? 'border-pink-500 bg-pink-500/10 text-pink-200'
                          : 'border-gray-600 bg-gray-700/30 text-gray-300 hover:border-pink-400'
                      }`}
                    >
                      {area}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <motion.button
              whileHover={{ scale: isStepValid() && !loading ? 1.05 : 1 }}
              whileTap={{ scale: isStepValid() && !loading ? 0.95 : 1 }}
              onClick={handleContinue}
              disabled={!isStepValid() || loading}
              className={`w-full mt-8 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 ${
                isStepValid() && !loading 
                  ? 'hover:shadow-cyan-500/40 cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Setting up your profile...
                </div>
              ) : currentStep === 4 ? (
                'Complete Setup'
              ) : (
                'Continue'
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FitTronixOnboarding;