import React from "react";
import { motion } from "framer-motion";

const coaches = [
  { name: "Asha Verma", title: "Head Coach", note: "Strength & Movement" },
  { name: "Rohit Singh", title: "Data Scientist", note: "Biomechanics" },
  { name: "Leah Kim", title: "Physical Therapist", note: "Injury prevention" }
];

export default function CoachesSection() {
  return (
    <section className="py-36 bg-[#0F1318]">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <h3 className="text-3xl font-semibold text-[#E4E6EB]">Trusted by experts</h3>
        <p className="mt-2 text-[#A8B0BB] max-w-2xl">Coaches and therapists help validate our approach — real experience, real outcomes.</p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {coaches.map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="p-8 bg-[#0E1419] border border-[#1B2430] rounded-3xl text-center shadow">
              <div className="h-28 w-28 mx-auto rounded-full bg-[#0B1216] flex items-center justify-center text-[#6F7B87] text-2xl">👤</div>
              <div className="mt-6 font-semibold text-[#E4E6EB] text-xl">{c.name}</div>
              <div className="text-[#A8B0BB]">{c.title}</div>
              <p className="mt-3 text-[#A8B0BB]">{c.note}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
