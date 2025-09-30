import React, { useState, useEffect } from "react";
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Youtube, 
  Heart, 
  Users, 
  Flame, 
  Target,
  Moon,
  Sun,
  ArrowRight,
  CheckCircle,
  Send
} from "lucide-react";

// TikTok icon since it's not available in lucide-react
const TikTok = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-3.77-1.105l-.001-.001z"/>
  </svg>
);

function Footer() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);

  // Fitness tips that rotate
  const fitnessTips = [
    "💪 Consistency beats intensity every time!",
    "🔥 Small daily improvements lead to big results",
    "🌟 Your only competition is who you were yesterday",
    "⚡ Don't skip the warm-up - your future self will thank you",
    "🌈 Progress, not perfection",
    "🚀 30 minutes today is better than 0 minutes",
    "🎯 Goals give you direction, habits get you there"
  ];

  // Dynamic fitness stats (in a real app, these would come from an API)
  const fitnessStats = [
    { icon: Heart, value: "12.4K", label: "Workouts Logged", color: "text-red-400" },
    { icon: Users, value: "89.2K", label: "Active Users", color: "text-blue-400" },
    { icon: Flame, value: "4.2M", label: "Calories Burned", color: "text-orange-400" },
    { icon: Target, value: "78%", label: "Goal Completion", color: "text-green-400" }
  ];

  // Social media icons with tooltips and colors
  const socialIcons = [
    { 
      icon: Facebook, 
      href: "#", 
      color: "hover:text-blue-500",
      tooltip: "Follow us on Facebook",
      name: "Facebook"
    },
    { 
      icon: Twitter, 
      href: "#", 
      color: "hover:text-cyan-400",
      tooltip: "Follow us on Twitter",
      name: "Twitter"
    },
    { 
      icon: Instagram, 
      href: "#", 
      color: "hover:text-pink-500",
      tooltip: "Follow us on Instagram",
      name: "Instagram"
    },
    { 
      icon: Youtube, 
      href: "#", 
      color: "hover:text-red-500",
      tooltip: "Subscribe on YouTube",
      name: "YouTube"
    },
    { 
      icon: Linkedin, 
      href: "#", 
      color: "hover:text-blue-400",
      tooltip: "Connect on LinkedIn",
      name: "LinkedIn"
    },
    { 
      icon: TikTok, 
      href: "#", 
      color: "hover:text-purple-400",
      tooltip: "Follow us on TikTok",
      name: "TikTok"
    }
  ];

  // Navigation links
 const quickLinks = [
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "PrivacyPolicy", href: "/PrivacyPolicy" },
  { name: "Blog", href: "/blog" },
  { name: "FAQ", href: "/faq" }
];


  // Rotate fitness tips every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % fitnessTips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail("");
      // Simulate API call
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // In a real app, you would update your theme context here
  };

  return (
    <footer className={`relative ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} backdrop-blur-xl border-t border-white/20 text-${isDarkMode ? 'white' : 'gray-900'} py-8 transition-colors duration-300`}>
      
      {/* Neon glow line on top */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 animate-pulse"></div>

      <div className="max-w-7xl mx-auto px-6 ">
        
        {/* Motivational Tip */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500/20 to-pink-500/20 px-4 py-2 rounded-full border border-cyan-400/30">
            <span className="text-sm font-medium bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
              {fitnessTips[currentTip]}
            </span>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Brand & Newsletter Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent mb-2">
                FitTronix
              </h3>
              <p className={`text-${isDarkMode ? 'gray-400' : 'gray-600'} text-sm max-w-md`}>
                Transform your fitness journey with cutting-edge technology, personalized workouts, 
                and a community that supports your goals every step of the way.
              </p>
            </div>

            {/* Newsletter Subscription */}
            <div className="space-y-3">
              <h4 className="font-semibold text-lg">Stay Updated</h4>
              <p className={`text-${isDarkMode ? 'gray-400' : 'gray-600'} text-sm`}>
                Get fitness tips, workout plans, and exclusive offers delivered to your inbox.
              </p>
              
              {isSubscribed ? (
                <div className="flex items-center space-x-2 text-green-400 bg-green-400/10 px-4 py-3 rounded-lg border border-green-400/20">
                  <CheckCircle size={20} />
                  <span className="text-sm font-medium">Thanks for subscribing! 🎉</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200`}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:from-cyan-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
                  >
                    <span>Subscribe</span>
                    <Send size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={`text-${isDarkMode ? 'gray-400' : 'gray-600'} hover:text-cyan-400 transition-colors duration-200 py-1 text-sm hover:translate-x-1 transform transition-transform`}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Copyright */}
            <p className={`text-sm text-${isDarkMode ? 'gray-400' : 'gray-600'}`}>
              © {new Date().getFullYear()}{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent font-bold">
                FitTronix
              </span>
              . All rights reserved.
            </p>

            {/* Social Media & Dark Mode Toggle */}
            <div className="flex items-center space-x-6">
              
              {/* Social Media Icons */}
              <div className="flex space-x-4">
                {socialIcons.map((social) => (
                  <div key={social.name} className="relative group">
                    <a
                      href={social.href}
                      className={`${social.color} transition-all duration-300 transform hover:scale-125 hover:rotate-12`}
                      aria-label={social.name}
                    >
                      <social.icon size={20} />
                    </a>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                      {social.tooltip}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 opacity-20"></div>
    </footer>
  );
}

export default Footer;