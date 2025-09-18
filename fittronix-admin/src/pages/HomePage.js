import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";

function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-black text-white flex font-sans">
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
          bg-gradient-to-r from-cyan-500 via-indigo-600 to-pink-600 text-center px-6 overflow-hidden"
        >
          {/* Glowing background particles */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_70%)] animate-pulse"></div>

          <h1 className="text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-pink-400 animate-pulse">
            Welcome to FitTronix
          </h1>
          <p className="text-2xl max-w-2xl mb-8 text-gray-200 drop-shadow-lg">
            Train inside the cyber-fitness arena. AI, computer vision, and deep learning guiding your every move.
          </p>
          <a
            href="#features"
            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-cyan-500 
            text-white font-bold rounded-2xl shadow-lg hover:scale-105 transform transition duration-300 
            hover:shadow-[0_0_20px_rgba(0,255,255,0.8)]"
          >
            Enter the Arena
          </a>
        </section>

        {/* About Section */}
        <section
          id="about"
          className="min-h-screen flex flex-col justify-center items-center px-6 py-20 
          bg-black relative text-center"
        >
          <h2 className="text-5xl font-bold mb-6 text-cyan-400 drop-shadow-lg">About FitTronix</h2>
          <p className="max-w-3xl text-lg text-gray-300 leading-relaxed">
            FitTronix combines AI, computer vision, and gamified fitness to transform your workouts. 
            Experience real-time posture correction, deep analytics, and an immersive community-driven training platform.
          </p>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex flex-col 
          justify-center items-center px-6 py-20"
        >
          <h2 className="text-5xl font-bold mb-12 text-pink-400 drop-shadow-lg">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
            {[
              {
                title: "AI Posture Detection",
                desc: "Correct your form in real-time with glowing, AI-powered feedback."
              },
              {
                title: "Workout Analytics",
                desc: "Track reps, sets, calories, and see cyber-style progress dashboards."
              },
              {
                title: "Community Support",
                desc: "Compete in neon-lit challenges & rise in the holographic leaderboard."
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="p-8 bg-white/5 backdrop-blur-md border border-cyan-500/50 
                rounded-2xl text-center shadow-lg hover:scale-105 transition transform 
                hover:shadow-[0_0_25px_rgba(0,255,255,0.7)]"
              >
                <h3 className="text-2xl font-semibold mb-4 text-cyan-300">{feature.title}</h3>
                <p className="text-gray-300">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section
          id="contact"
          className="min-h-screen flex flex-col justify-center items-center px-6 py-20 bg-black relative"
        >
          <h2 className="text-5xl font-bold mb-6 text-cyan-400 drop-shadow-lg">Contact Us</h2>
          <p className="text-lg text-gray-300 mb-6 text-center max-w-xl">
            Have questions or feedback? Reach out to our cyber-fitness squad.
          </p>
          <a
            href="mailto:support@fittronix.com"
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-pink-500 
            text-white font-bold rounded-2xl shadow-lg hover:scale-105 transform transition duration-300 
            hover:shadow-[0_0_25px_rgba(255,0,255,0.8)]"
          >
            Email Us
          </a>
        </section>

        <Footer />
      </div>
    </div>
  );
}

export default HomePage;
