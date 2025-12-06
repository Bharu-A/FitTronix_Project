import React from "react";

const WhyChooseSection = () => {
  const cards = [
    { title: "Precision Coaching", desc: "Instant, frame-by-frame feedback for each rep.", accent: "from-cyan-400 to-blue-500" },
    { title: "Adaptive Plans", desc: "Workouts that evolve with your performance and goals.", accent: "from-purple-400 to-pink-400" },
    { title: "Privacy-First", desc: "Edge-run analytics, optional cloud sync for metrics.", accent: "from-yellow-400 to-orange-400" }
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-purple-400">
          Why professionals choose FitTronix
        </h2>
        <p className="text-gray-400 mt-4">Performance-grade tools for safe, measurable improvement.</p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((c, i) => (
          <div key={i} className="p-6 rounded-2xl bg-white/3 border border-white/6 hover:scale-105 transform transition shadow-lg">
            <div className={`w-12 h-12 mb-4 rounded-lg bg-gradient-to-br ${c.accent} flex items-center justify-center text-white font-bold`}>✓</div>
            <h3 className="text-xl font-semibold text-white mb-2">{c.title}</h3>
            <p className="text-gray-300">{c.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseSection;
