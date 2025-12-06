import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const highlights = [
  { title: "Real-time joint overlays", body: "See exact alignment and fix posture instantly." },
  { title: "Rep & tempo detection", body: "Accurate rep counts and tempo cues for consistent progress." },
  { title: "Adaptive intensity", body: "Programs get slightly harder as you improve." },
  { title: "Safety-first suggestions", body: "Alternative moves when form slips or pain is detected." }
];

export default function StickyShowcase() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setIndex(i => (i + 1) % highlights.length), 3600);
    return () => clearInterval(iv);
  }, []);

  return (
    <section className="py-40 bg-[#0F1318]">
      <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="sticky top-36">
          <div className="rounded-3xl overflow-hidden border border-[#1B2430] shadow-2xl">
            <div className="bg-[#091018] h-[760px] flex items-center justify-center">
              <div className="text-center px-8">
                <div className="text-3xl font-semibold text-[#E4E6EB]">{highlights[index].title}</div>
                <div className="mt-4 text-lg text-[#A8B0BB] max-w-md mx-auto">{highlights[index].body}</div>
                <div className="mt-8 text-xs text-[#6F7B87]">[High-res mockup / video area]</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {highlights.map((h, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
              <div className="p-8 bg-[#0F1318] border border-[#1B2430] rounded-3xl shadow-sm hover:shadow-lg transition">
                <div className="text-sm text-[#9FA6B2]">Feature</div>
                <div className="mt-2 font-semibold text-[#E4E6EB] text-xl">{h.title}</div>
                <p className="mt-3 text-[#A8B0BB] text-base">{h.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
