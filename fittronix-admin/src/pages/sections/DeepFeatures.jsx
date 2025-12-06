import React from "react";
import { motion } from "framer-motion";

const FeatureCard = ({ f, i }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="p-10 bg-[#0E1419] border border-[#1B2430] rounded-3xl shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition">
    <div className="text-sm text-[#9FA6B2]">{f.category || ""}</div>
    <div className="mt-3 font-semibold text-[#E4E6EB] text-2xl">{f.title}</div>
    <p className="mt-3 text-[#A8B0BB] text-base">{f.desc}</p>
  </motion.div>
);

export default function DeepFeatures({ features = [], loading = true }) {
  const fallback = [
    { title: "Real-time pose detection", desc: "High-fidelity pose estimation for common workouts." },
    { title: "Adaptive program builder", desc: "Programs that adjust to your weekly performance." },
    { title: "Insightful analytics", desc: "Heatmaps, rep breakdowns, and recovery suggestions." }
  ];
  const list = features.length ? features : fallback;

  return (
    <section className="py-40 bg-[#0F1115]">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <h3 className="text-3xl font-semibold text-[#E4E6EB]">Features in depth</h3>
        <p className="mt-2 text-[#A8B0BB] max-w-2xl">Advanced capabilities engineered for athletes and coaches.</p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? [...Array(3)].map((_, i) => <div key={i} className="h-48 rounded-3xl bg-[#0B1216] animate-pulse" />) :
            list.map((f, i) => <FeatureCard key={f.id || i} f={f} i={i} />)}
        </div>
      </div>
    </section>
  );
}
