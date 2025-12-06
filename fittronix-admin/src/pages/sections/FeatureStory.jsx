import React from "react";
import { motion } from "framer-motion";

const panels = [
  {
    title: "See what matters",
    lead: "Overlay cues that show exactly what to fix.",
    desc: "Joint alignment, tempo guidance, and depth cues presented in a calm, readable overlay.",
    img: "assests/F1.jpg"
  },
  {
    title: "Train with precision",
    lead: "Objective rep & tempo analytics.",
    desc: "Automatic rep counts, tempo detection, and range-of-motion insights to make progress measurable.",
    img: "assests/F2.jpg"
  },
  {
    title: "Progress you can trust",
    lead: "Data-driven progression.",
    desc: "Weekly reports, trend charts, and personalized coach-like suggestions.",
    img: "assests/F3.jpg"
  }
];

export default function FeatureStory() {
  return (
    <section className="py-40 bg-[#0F1115] relative">

      {/* subtle cyan glow behind section */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 w-[900px] h-[900px] -translate-x-1/2 -translate-y-1/2 
          bg-cyan-500/10 blur-[220px] rounded-full opacity-20">
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 space-y-40 relative z-10">
        
        {panels.map((p, i) => (
          <div
            key={i}
            className={`grid grid-cols-1 md:grid-cols-2 gap-16 items-center ${
              i % 2 === 1 ? "md:flex-row-reverse" : ""
            }`}
          >
            {/* TEXT SECTION */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.72 }}
            >
              <h3 className="text-4xl md:text-5xl font-extrabold text-[#F5F7FA]">
                {p.title}
              </h3>

              <p className="mt-4 text-2xl font-medium text-[#A8B0BB]">
                {p.lead}
              </p>

              <p className="mt-5 text-[#9FA6B2] max-w-xl text-xl leading-relaxed">
                {p.desc}
              </p>
            </motion.div>

            {/* IMAGE SECTION */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.72, delay: 0.08 }}
              className="rounded-3xl overflow-hidden border border-[#1B2430] shadow-[0_0_45px_rgba(79,196,255,0.15)]"
            >
              <img
                src={p.img}
                alt={p.title}
                className="w-full h-96 md:h-[520px] object-cover opacity-90 hover:opacity-100 transition duration-300"
              />
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}
