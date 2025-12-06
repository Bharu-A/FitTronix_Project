import React, { useEffect, useState } from "react";

const LoadingTestimonial = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gray-900/50 backdrop-blur-md border border-pink-500/20 rounded-2xl">
    <div className="w-24 h-24 rounded-full bg-gray-700 mb-6 animate-pulse"></div>
    <div className="h-4 bg-gray-700 rounded w-3/4 mb-4 animate-pulse"></div>
    <div className="h-4 bg-gray-700 rounded w-1/2 mb-4 animate-pulse"></div>
    <div className="h-4 bg-gray-700 rounded w-2/3 animate-pulse"></div>
  </div>
);

const TestimonialsSection = React.memo(function TestimonialsSection({ testimonials = [], loading }) {
  const [active, setActive] = useState(0);

  // Auto rotate when testimonials data exists
  useEffect(() => {
    if (!loading && testimonials.length > 0) {
      setActive(0);
      const iv = setInterval(() => {
        setActive(prev => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(iv);
    }
  }, [loading, testimonials.length]);

  return (
    <section id="testimonials" className="py-20 px-6 bg-black relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
          User Experiences
        </h2>
        <p className="text-lg text-gray-400 text-center max-w-3xl mx-auto mb-16">
          See what our cyber-athletes are saying about their transformation
        </p>

        <div className="relative h-96">
          {loading ? (
            <LoadingTestimonial />
          ) : testimonials.length > 0 ? (
            testimonials.map((t, idx) => (
              <div
                key={t.id || idx}
                className={`absolute inset-0 flex flex-col items-center justify-center p-8 bg-gray-900/50 backdrop-blur-md border border-pink-500/20 
                  rounded-2xl shadow-lg transition-all duration-500 ${
                    idx === active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
                  }`}
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 mb-6 flex items-center justify-center text-3xl">
                  {t.avatar || "👤"}
                </div>
                <p className="text-xl text-gray-300 text-center italic mb-6 max-w-2xl">
                  "{t.text}"
                </p>
                <h4 className="text-2xl font-bold text-pink-400">{t.name}</h4>
                <p className="text-gray-400">{t.role}</p>
              </div>
            ))
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              No testimonials available
            </div>
          )}
        </div>

        {!loading && testimonials.length > 0 && (
          <div className="flex justify-center mt-8 space-x-3">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${i === active ? "bg-pink-500 w-8" : "bg-gray-700"}`}
                onClick={() => setActive(i)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
});

export default TestimonialsSection;
