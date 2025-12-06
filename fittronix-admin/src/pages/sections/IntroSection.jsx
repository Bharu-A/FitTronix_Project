import React from "react";
import { motion } from "framer-motion";

export default function IntroSection() {
  return (
    <section className="py-36 bg-[#0F1318]">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="text-4xl font-bold text-[#E4E6EB]">Designed for clarity & performance</h2>
          <p className="mt-4 text-xl text-[#A8B0BB] max-w-3xl">FitTronix blends rigorous biomechanics, modern ML, and human-centered design to give you crystal-clear cues and measurable progress.</p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }} className="p-10 bg-[#12161A] border border-[#1D2430] rounded-3xl">
            <div className="text-sm text-[#9FA6B2]">Form-first coaching</div>
            <div className="mt-4 font-semibold text-[#E4E6EB] text-2xl">Minute-by-minute corrections</div>
            <p className="mt-3 text-[#A8B0BB] text-base">Real-time cues so you build strength safely.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="p-10 bg-[#12161A] border border-[#1D2430] rounded-3xl">
            <div className="text-sm text-[#9FA6B2]">Adaptive plans</div>
            <div className="mt-4 font-semibold text-[#E4E6EB] text-2xl">Programs that evolve</div>
            <p className="mt-3 text-[#A8B0BB] text-base">Difficulty scales automatically based on your performance.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="p-10 bg-[#12161A] border border-[#1D2430] rounded-3xl">
            <div className="text-sm text-[#9FA6B2]">Privacy</div>
            <div className="mt-4 font-semibold text-[#E4E6EB] text-2xl">Edge-first analytics</div>
            <p className="mt-3 text-[#A8B0BB] text-base">Your camera stream can remain local by default.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
