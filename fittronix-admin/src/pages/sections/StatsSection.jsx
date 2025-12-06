import React from "react";
import { motion } from "framer-motion";

const stats = [
  { value: "98%", label: "Pose accuracy" },
  { value: "120ms", label: "Average latency" },
  { value: "4.9★", label: "Avg. user rating" },
  { value: "10k+", label: "Active users" }
];

export default function StatsSection() {
  return (
    <section className="py-36 bg-[#0F1115]">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="p-10 bg-[#0D1418] border border-[#1B2430] rounded-3xl text-center shadow">
              <div className="text-4xl md:text-5xl font-extrabold text-[#E4E6EB]">{s.value}</div>
              <div className="mt-3 text-[#A8B0BB] text-lg">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
