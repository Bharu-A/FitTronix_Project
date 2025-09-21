import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";

function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeAccordion, setActiveAccordion] = useState(null);

  // Testimonial data
  const testimonials = [
    {
      name: "Alex Chen",
      role: "Pro Athlete",
      text: "FitTronix transformed my training regimen. The AI posture detection helped me correct form issues I didn't even know I had!",
      avatar: "👤"
    },
    {
      name: "Maya Rodriguez",
      role: "Fitness Influencer",
      text: "The gamified challenges keep me motivated like nothing else. I've never been this consistent with my workouts!",
      avatar: "👤"
    },
    {
      name: "David Kim",
      role: "Software Engineer",
      text: "As someone who sits all day, the posture alerts have eliminated my back pain. The virtual coach feels like a real personal trainer!",
      avatar: "👤"
    }
  ];

  // FAQ data
  const faqs = [
    {
      question: "How does the AI posture detection work?",
      answer: "Our advanced computer vision algorithms analyze your movement in real-time through your device's camera, providing instant feedback on your form."
    },
    {
      question: "What equipment do I need to use FitTronix?",
      answer: "Just your smartphone or computer with a camera! For some advanced workouts, basic equipment like dumbbells or resistance bands may be recommended."
    },
    {
      question: "Is my data secure with FitTronix?",
      answer: "Absolutely. We use end-to-end encryption and never share your personal data with third parties without your explicit consent."
    },
    {
      question: "Can I use FitTronix with other fitness apps?",
      answer: "Yes, FitTronix integrates with popular health platforms like Apple Health, Google Fit, and Strava for a comprehensive fitness tracking experience."
    }
  ];

  // Pricing plans
  const plans = [
    {
      name: "Free",
      price: "$0",
      features: ["Basic workout tracking", "3 AI posture checks per week", "Limited challenges", "Community access"],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Pro",
      price: "$19.99/mo",
      features: ["Unlimited posture detection", "Advanced analytics", "Personalized workouts", "Diet plans", "Priority support"],
      cta: "Subscribe Now",
      popular: true
    },
    {
      name: "Elite",
      price: "$29.99/mo",
      features: ["All Pro features", "1-on-1 virtual coaching", "Custom meal plans", "Early feature access", "Elite challenges"],
      cta: "Go Elite",
      popular: false
    }
  ];

  // Features data
  const features = [
    {
      title: "AI Posture Detection",
      desc: "Real-time form correction with glowing visual feedback and detailed analysis."
    },
    {
      title: "Workout Analytics",
      desc: "Comprehensive performance tracking with cyber-style dashboards and progress insights."
    },
    {
      title: "Virtual Coach",
      desc: "AI-powered personal trainer that adapts to your goals and provides motivational guidance."
    },
    {
      title: "Personalized Diet Plans",
      desc: "Nutrition plans tailored to your body type, goals, and preferences with weekly adjustments."
    },
    {
      title: "Gamified Challenges",
      desc: "Compete in neon-lit challenges, earn rewards, and climb the holographic leaderboards."
    },
    {
      title: "Community Support",
      desc: "Connect with other cyber-athletes, join clans, and participate in group workouts."
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="bg-gray-950 text-white flex font-sans overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <div
        className={`flex-1 min-h-screen transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Navbar */}
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Hero Section */}
        <section
          id="home"
          className="relative h-screen flex flex-col justify-center items-center 
          text-center px-6 overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-950"
        >
          {/* Animated grid background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,119,198,0.3)_0%,transparent_50%)]"></div>
          </div>

          {/* Glowing particles */}
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-cyan-400 opacity-70 animate-pulse"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 20 + 5}px`,
                  height: `${Math.random() * 20 + 5}px`,
                  animationDuration: `${Math.random() * 5 + 3}s`,
                  filter: "blur(4px)",
                }}
              ></div>
            ))}
          </div>

          <h1 className="text-6xl md:text-8xl font-extrabold mb-6 relative">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 animate-pulse">
              FITTRONIX
            </span>
            <span className="absolute -inset-4 bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-pink-400/20 blur-3xl -z-10"></span>
          </h1>
          
          <p className="text-xl md:text-2xl max-w-3xl mb-10 text-gray-300 font-light">
            Enter the cyber-fitness arena where AI, computer vision, and deep learning transform your workouts
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#pricing"
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 
              text-white font-bold rounded-xl shadow-lg hover:scale-105 transform transition duration-300 
              hover:shadow-cyan-500/40 relative overflow-hidden group"
            >
              <span className="relative z-10">START FREE TRIAL</span>
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </a>
            
            <a
              href="#features"
              className="px-8 py-4 bg-transparent border-2 border-cyan-500/50 
              text-cyan-300 font-bold rounded-xl shadow-lg hover:scale-105 transform transition duration-300 
              hover:shadow-cyan-500/20 hover:bg-cyan-500/10"
            >
              EXPLORE FEATURES
            </a>
          </div>
          
          {/* Animated scrolling indicator */}
          <div className="absolute bottom-10 animate-bounce">
            <div className="w-6 h-10 border-2 border-cyan-400 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-cyan-400 rounded-full mt-2"></div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section
          id="about"
          className="min-h-screen flex flex-col md:flex-row justify-center items-center px-6 py-20 
          bg-gradient-to-br from-gray-900 to-black relative overflow-hidden"
        >
          {/* Background elements */}
          <div className="absolute -left-40 -top-40 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -right-40 -bottom-40 w-80 h-80 bg-cyan-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          
          <div className="flex-1 max-w-2xl p-6 md:p-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-cyan-400 relative">
              About FitTronix
              <span className="absolute -bottom-2 left-0 w-32 h-1 bg-gradient-to-r from-cyan-400 to-purple-500"></span>
            </h2>
            <p className="text-lg text-gray-300 mb-6 leading-relaxed">
              FitTronix is the future of fitness, merging cutting-edge AI technology with immersive workout experiences. 
              Our platform uses computer vision to analyze your movements, providing real-time feedback that helps you 
              perfect your form and prevent injuries.
            </p>
            <p className="text-lg text-gray-300 mb-6 leading-relaxed">
              Whether you're a beginner or an elite athlete, our adaptive AI creates personalized training programs that 
              evolve with your progress. Join a community of cyber-athletes pushing the boundaries of what's possible in 
              fitness technology.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="flex items-center">
                <div className="mr-3 text-cyan-400 text-xl">✓</div>
                <span className="text-gray-300">Real-time form correction</span>
              </div>
              <div className="flex items-center">
                <div className="mr-3 text-cyan-400 text-xl">✓</div>
                <span className="text-gray-300">Personalized workout plans</span>
              </div>
              <div className="flex items-center">
                <div className="mr-3 text-cyan-400 text-xl">✓</div>
                <span className="text-gray-300">Advanced performance analytics</span>
              </div>
              <div className="flex items-center">
                <div className="mr-3 text-cyan-400 text-xl">✓</div>
                <span className="text-gray-300">Immersive gamification</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex justify-center items-center p-6 relative">
            {/* Hologram-style visualization */}
            <div className="relative w-80 h-80 md:w-96 md:h-96 rounded-2xl overflow-hidden border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-4 border-cyan-400/50 rounded-full animate-ping"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 bg-cyan-400/20 rounded-full blur-xl"></div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                <div className="w-24 h-24 bg-cyan-400/30 rounded-full mb-6 flex items-center justify-center">
                  <div className="w-16 h-16 bg-cyan-400/50 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-cyan-400 rounded-full"></div>
                  </div>
                </div>
                <div className="h-2 w-48 bg-cyan-400/40 rounded-full mb-2"></div>
                <div className="h-2 w-40 bg-cyan-400/30 rounded-full mb-4"></div>
                <div className="flex space-x-2">
                  <div className="w-4 h-4 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-4 h-4 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-4 h-4 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="min-h-screen py-20 px-6 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden"
        >
          {/* Background elements */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-cyan-500/5 to-transparent"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl opacity-10"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full filter blur-3xl opacity-10"></div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              Cyber-Fitness Features
            </h2>
            <p className="text-lg text-gray-400 text-center max-w-3xl mx-auto mb-16">
              Experience the future of training with our AI-powered platform
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-6 bg-gray-900/50 backdrop-blur-md border border-cyan-500/20 
                  rounded-2xl text-center shadow-lg hover:scale-105 transition-all duration-300 
                  hover:shadow-cyan-500/20 hover:border-cyan-500/40 group relative overflow-hidden"
                >
                  <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></div>
                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 group-hover:border-cyan-500/40 transition-colors duration-300">
                      <span className="text-2xl text-cyan-400">⚡</span>
                    </div>
                    <h3 className="text-2xl font-semibold mb-4 text-cyan-300 group-hover:text-cyan-200 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 px-6 bg-black relative overflow-hidden">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
              User Experiences
            </h2>
            <p className="text-lg text-gray-400 text-center max-w-3xl mx-auto mb-16">
              See what our cyber-athletes are saying about their transformation
            </p>
            
            <div className="relative h-96">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 flex flex-col items-center justify-center p-8 bg-gray-900/50 backdrop-blur-md border border-pink-500/20 
                  rounded-2xl shadow-lg transition-all duration-500 ${
                    index === activeTestimonial
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10 pointer-events-none"
                  }`}
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 mb-6 flex items-center justify-center text-3xl">
                    {testimonial.avatar}
                  </div>
                  <p className="text-xl text-gray-300 text-center italic mb-6 max-w-2xl">
                    "{testimonial.text}"
                  </p>
                  <h4 className="text-2xl font-bold text-pink-400">{testimonial.name}</h4>
                  <p className="text-gray-400">{testimonial.role}</p>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center mt-8 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeTestimonial ? "bg-pink-500 w-8" : "bg-gray-700"
                  }`}
                  onClick={() => setActiveTestimonial(index)}
                ></button>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-6 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              Membership Plans
            </h2>
            <p className="text-lg text-gray-400 text-center max-w-3xl mx-auto mb-16">
              Choose your level of access to the cyber-fitness arena
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`p-8 bg-gray-900/50 backdrop-blur-md border rounded-2xl shadow-lg transition-all duration-300 
                  hover:scale-105 relative overflow-hidden ${
                    plan.popular
                      ? "border-cyan-500/50 shadow-cyan-500/20 ring-2 ring-cyan-500/30"
                      : "border-cyan-500/20"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-bold px-4 py-1 rounded-bl-2xl">
                      MOST POPULAR
                    </div>
                  )}
                  
                  <h3 className="text-3xl font-bold mb-4 text-cyan-400">{plan.name}</h3>
                  <div className="text-4xl font-bold mb-6 text-white">{plan.price}</div>
                  
                  <ul className="mb-8 space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <div className="mr-3 text-cyan-400 text-lg">✓</div>
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    className={`w-full py-3 font-bold rounded-xl transition-all duration-300 ${
                      plan.popular
                        ? "bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                        : "bg-gray-800 hover:bg-gray-700 border border-cyan-500/30"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 px-6 bg-black relative overflow-hidden">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-400 text-center max-w-3xl mx-auto mb-16">
              Everything you need to know about the FitTronix experience
            </p>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-cyan-500/20 rounded-2xl overflow-hidden transition-all duration-300 hover:border-cyan-500/40"
                >
                  <button
                    className="flex justify-between items-center w-full p-6 text-left bg-gray-900/50 backdrop-blur-md"
                    onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
                  >
                    <span className="text-xl font-medium text-cyan-300">{faq.question}</span>
                    <span className="text-cyan-400 text-2xl">
                      {activeAccordion === index ? "−" : "+"}
                    </span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      activeAccordion === index ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    <div className="p-6 bg-gray-900/30 text-gray-300">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 px-6 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              Contact Us
            </h2>
            <p className="text-lg text-gray-400 text-center max-w-3xl mx-auto mb-16">
              Have questions? Our cyber-support team is here to help
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-gray-900/50 backdrop-blur-md border border-cyan-500/20 rounded-2xl">
                <h3 className="text-2xl font-bold mb-6 text-cyan-300">Get in Touch</h3>
                <p className="text-gray-300 mb-6">
                  Ready to transform your fitness journey? Reach out to our team for any questions about FitTronix.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 mr-4">
                      ✉
                    </div>
                    <div>
                      <p className="text-gray-400">Email</p>
                      <p className="text-cyan-300">support@fittronix.com</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-8 bg-gray-900/50 backdrop-blur-md border border-cyan-500/20 rounded-2xl">
                <form className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-3 bg-gray-800 border border-cyan-500/20 rounded-xl focus:outline-none focus:border-cyan-500 text-white"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 bg-gray-800 border border-cyan-500/20 rounded-xl focus:outline-none focus:border-cyan-500 text-white"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-gray-300 mb-2">Message</label>
                    <textarea
                      id="message"
                      rows="4"
                      className="w-full px-4 py-3 bg-gray-800 border border-cyan-500/20 rounded-xl focus:outline-none focus:border-cyan-500 text-white"
                      placeholder="Your message..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all duration-300"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}

export default HomePage;