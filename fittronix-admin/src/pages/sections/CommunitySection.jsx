import React from "react";

const CommunitySection = () => {
  const users = [
    { name: "Arjun", highlight: "Lost 6kg in 30 days", glow: "from-cyan-500/20" },
    { name: "Naina", highlight: "Posture improved drastically", glow: "from-purple-500/20" },
    { name: "Rahul", highlight: "Completed 90-day challenge", glow: "from-pink-500/20" }
  ];

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-gray-950 to-black relative">
      <h2 className="text-5xl font-extrabold text-center mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
        Community Transformations
      </h2>

      <p className="text-gray-400 text-center max-w-3xl mx-auto mb-16">
        Real stories. Real progress. Real transformation.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto relative z-10">
        {users.map((u, i) => (
          <div
            key={i}
            className="p-10 rounded-2xl border border-gray-800 bg-gray-900/40 hover:border-cyan-500/40 hover:scale-[1.05] transition-all shadow-lg relative overflow-hidden group"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${u.glow} opacity-0 group-hover:opacity-40 transition-all duration-500 blur-xl`}
            ></div>

            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-cyan-300 mb-3">{u.name}</h3>
              <p className="text-gray-300">{u.highlight}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CommunitySection;
