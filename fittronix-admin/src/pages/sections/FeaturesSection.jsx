import React from "react";
import { motion } from "framer-motion";

/* Elevated Minimal Cards (Style 2): white cards, subtle shadow, rounded,
   clean typography, gentle hover lift. */
const FeatureCard = ({ f, i }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="p-6 bg-white border rounded-2xl shadow-sm hover:shadow-md transform hover:-translate-y-1 transition">
    <div className="text-sm text-slate-500">{f.category || ""}</div>
    <div className="mt-2 font-semibold text-slate-900">{f.title}</div>
    <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
  </motion.div>
);

export default function FeaturesSection({ features = [], loading = true }) {
  const fallback = [
    { title: "Real-time pose detection", desc: "Frame-by-frame movement analysis with instant cues." },
    { title: "Adaptive programs", desc: "Plans that evolve with your performance." },
    { title: "Detailed analytics", desc: "Heatmaps, rep breakdowns and progress charts." }
  ];

  const items = features.length ? features : fallback;

  return (
    <section id="features" className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <h3 className="text-xl font-semibold text-slate-900">Key features</h3>
        <p className="text-slate-600 mt-2 max-w-xl">Built to be useful first — beautiful second.</p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            [...Array(3)].map((_, i) => <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />)
          ) : (
            items.map((f, i) => <FeatureCard key={f.id || i} f={f} i={i} />)
          )}
        </div>
      </div>
    </section>
  );
}
