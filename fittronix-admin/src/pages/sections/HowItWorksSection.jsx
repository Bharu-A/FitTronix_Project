import React from "react";
import { motion } from "framer-motion";

const Step = ({ idx, title, desc }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.06 }} className="p-6 bg-white border rounded-lg">
    <div className="text-sm text-slate-500">Step {idx + 1}</div>
    <div className="mt-2 font-medium text-slate-800">{title}</div>
    <p className="mt-2 text-slate-600 text-sm">{desc}</p>
  </motion.div>
);

export default function HowItWorksSection() {
  const steps = [
    { title: "Start a session", desc: "Allow the camera, position yourself, and choose a workout." },
    { title: "Real-time guidance", desc: "Receive cues on posture, range, tempo, and depth." },
    { title: "Track progress", desc: "Weekly analytics, heatmaps and personalized tips." }
  ];

  return (
    <section id="howitworks" className="py-16 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <h3 className="text-xl font-semibold text-slate-900">How it works</h3>
        <p className="text-slate-600 mt-2">A simple flow from setup to measurable results.</p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, i) => <Step key={i} idx={i} {...s} />)}
        </div>
      </div>
    </section>
  );
}
