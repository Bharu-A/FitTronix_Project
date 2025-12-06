import React from "react";
import { motion } from "framer-motion";

/* Dark hero — big, cinematic. Accent uses #4FC4FF. */
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.84, ease: "easeOut" } } };

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0F1115]">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-40">
        <motion.div initial="hidden" animate="show" variants={container} className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div variants={fadeUp}>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold leading-tight text-[#E4E6EB]">
              FitTronix
            </h1>

            <p className="mt-6 text-2xl text-[#A8B0BB] max-w-3xl">
              Next-level AI posture coaching — precise feedback, adaptive plans, and clear analytics to make every rep count.
            </p>

            <div className="mt-10 flex flex-wrap gap-4 items-center">
              <motion.a whileTap={{ scale: 0.98 }} href="#howitworks" className="px-8 py-4 rounded-lg bg-[#0B1220] border border-[#213241] text-[#E4E6EB] font-semibold shadow-lg">
                How it works
              </motion.a>

              <motion.a whileTap={{ scale: 0.98 }} href="#features" className="px-8 py-4 rounded-lg border border-[#2A3440] text-[#9FA6B2] font-semibold" style={{ background: 'transparent' }}>
                Explore features
              </motion.a>
            </div>

            <div className="mt-8 text-lg text-[#9FA6B2] flex gap-8">
              <div>• Private by default</div>
              <div>• Edge-first processing</div>
              <div>• Works on any camera device</div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="relative">
            <div className="rounded-3xl overflow-hidden border border-[#1B2430] shadow-2xl">
              <img
                src="assests\Gemini_Generated_Image_nemjzrnemjzrnemj.png"
                alt="Hero artwork"
                className="w-full h-[720px] object-cover"
              />
            </div>

            <div className="mt-6 flex gap-4">
              <div className="p-3 rounded-lg bg-[#0B1220] border border-[#22313e] shadow">
                <div className="text-xs text-[#9FA6B2]">Accuracy</div>
                <div className="font-semibold text-[#E4E6EB]">98%</div>
              </div>
              <div className="p-3 rounded-lg bg-[#0B1220] border border-[#22313e] shadow">
                <div className="text-xs text-[#9FA6B2]">Latency</div>
                <div className="font-semibold text-[#E4E6EB]">~120ms</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
