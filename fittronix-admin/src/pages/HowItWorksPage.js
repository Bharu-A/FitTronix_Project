import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Activity, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HowItWorksPage = () => {
    const navigate = useNavigate();

    const steps = [
        {
            icon: UserPlus,
            title: "1. Create Profile",
            desc: "Set your goals, stats, and lifestyle.",
            color: "text-cyan-400"
        },
        {
            icon: Activity,
            title: "2. Track Activity",
            desc: "Log meals & workouts via AI or manual input.",
            color: "text-purple-400"
        },
        {
            icon: TrendingUp,
            title: "3. Evolve",
            desc: "Get AI insights and adapt your plan daily.",
            color: "text-pink-400"
        }
    ];

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-gray-300 flex flex-col items-center justify-center py-20 px-4 pt-[120px]">

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16 max-w-2xl"
            >
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
                    Simple. Intelligent. Yours.
                </h1>
                <p className="text-gray-500 text-lg">
                    FitTronix adapts to your life, not the other way around.
                </p>
            </motion.div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full mb-16">
                {steps.map((step, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 }}
                        className="group relative p-8 rounded-2xl bg-gray-900/40 border border-gray-800 hover:border-gray-700 transition-all hover:bg-gray-900/60"
                    >
                        <div className={`mb-6 ${step.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                            <step.icon size={40} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-200 mb-2">{step.title}</h3>
                        <p className="text-gray-500 leading-relaxed font-light">{step.desc}</p>
                    </motion.div>
                ))}
            </div>

            {/* CTA */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors group"
            >
                <span className="text-lg">Start your journey</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>

        </div>
    );
};

export default HowItWorksPage;
