import React from "react";
import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <section className="py-16 bg-white/0">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">The science behind FitTronix</h2>
          <p className="mt-3 text-slate-600 max-w-2xl">We combine pose estimation, biomechanics heuristics and ML personalization to deliver actionable cues that are simple to follow.</p>
        </motion.div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.04 }}>
            <div className="p-6 border rounded-lg bg-white">
              <div className="text-sm text-slate-500">Privacy</div>
              <div className="mt-2 font-medium text-slate-800">Local-first processing</div>
              <p className="mt-2 text-slate-600 text-sm">Video analysis can stay on-device — share only aggregated metrics if you choose.</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}>
            <div className="p-6 border rounded-lg bg-white">
              <div className="text-sm text-slate-500">Accuracy</div>
              <div className="mt-2 font-medium text-slate-800">Industry-grade models</div>
              <p className="mt-2 text-slate-600 text-sm">Models tuned for common fitness actions — squats, presses, and bodyweight motions.</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.12 }}>
            <div className="p-6 border rounded-lg bg-white">
              <div className="text-sm text-slate-500">Adaptivity</div>
              <div className="mt-2 font-medium text-slate-800">Personalized plans</div>
              <p className="mt-2 text-slate-600 text-sm">Progressive training that's gentle on beginners and challenging for athletes.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
