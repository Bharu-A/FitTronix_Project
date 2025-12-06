import React from "react";
import { motion } from "framer-motion";

const workouts = [
  { 
    name: "Strength Basics", 
    note: "Squats, Pushes, Pulls",
    img: "assests/w1.png"
  },
  { 
    name: "Mobility Flow", 
    note: "Joint preparation and flexibility",
    img: "assests/w2.png"
  },
  { 
    name: "HIIT Burner", 
    note: "Short high-intensity circuits",
    img: "assests/w3.png"
  },
  { 
    name: "Recovery Session", 
    note: "Stretching & mobility focus",
    img: "assests/w.png"
  }
];

export default function WorkoutGallery() {
  return (
    <section className="py-40 bg-[#0F1318] relative">

      {/* Subtle cyan ambient glow behind section */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 w-[1100px] h-[1100px] 
          -translate-x-1/2 -translate-y-1/2 
          bg-cyan-500/10 blur-[220px] opacity-20 rounded-full">
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        
        <h3 className="text-4xl md:text-5xl font-bold text-[#F5F7FA]">
          Workout previews
        </h3>
        
        <p className="mt-3 text-[#A8B0BB] max-w-2xl text-xl leading-relaxed">
          Short previews that give a feel for the session and coaching style.
        </p>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-4 gap-10">
          {workouts.map((w, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="
                rounded-3xl overflow-hidden bg-[#0C1115] 
                border border-[#1B2430] 
                shadow-[0_0_35px_rgba(79,196,255,0.15)]
                hover:shadow-[0_0_55px_rgba(79,196,255,0.25)]
                transition-shadow duration-300
              "
            >
              {/* IMAGE */}
              <div className="h-64 w-full">
                <img 
                  src={w.img}
                  alt={w.name}
                  className="w-full h-full object-cover opacity-90 hover:opacity-100 transition duration-300"
                />
              </div>

              {/* TEXT */}
              <div className="p-6">
                <div className="font-semibold text-[#E4E6EB] text-xl">
                  {w.name}
                </div>

                <div className="text-[#A8B0BB] mt-2 text-lg">
                  {w.note}
                </div>
              </div>

            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
