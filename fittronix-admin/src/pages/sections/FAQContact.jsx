import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";

export default function FAQContact({ faqs = [], loading = true, onContactSubmit, isSubmitting, submitMessage }) {
  const [active, setActive] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const resetForm = useCallback(() => setForm({ name: "", email: "", message: "" }), []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!onContactSubmit) return;
    await onContactSubmit({ ...form, resetForm });
  };

  return (
    <>
      <section className="py-40 bg-[#0F1115]">
        <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-3xl font-semibold text-[#E4E6EB]">Frequently asked</h3>
            <p className="text-[#A8B0BB] mt-3">Short, direct answers to the most common questions.</p>

            <div className="mt-8 space-y-4">
              {loading ? (
                [...Array(4)].map((_, i) => <div key={i} className="h-20 bg-[#0B1216] rounded-lg animate-pulse" />)
              ) : (
                faqs.map((f, i) => (
                  <motion.div key={f.id || i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-2">
                    <button onClick={() => setActive(active === i ? null : i)} className="w-full text-left p-5 bg-[#0E1419] border border-[#1B2430] rounded-2xl flex justify-between items-start">
                      <div>
                        <div className="font-medium text-[#E4E6EB] text-lg">{f.question}</div>
                        {f.short && <div className="text-sm text-[#9FA6B2] mt-1">{f.short}</div>}
                      </div>
                      <div className="text-[#9FA6B2]">{active === i ? "−" : "+"}</div>
                    </button>

                    <div className={`overflow-hidden transition-all ${active === i ? "max-h-[360px]" : "max-h-0"}`}>
                      <div className="p-5 text-[#A8B0BB] border-t rounded-b-2xl border-[#1B2430]">{f.answer}</div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="p-10 border rounded-3xl bg-[#0E1419] border-[#1B2430] shadow">
            <h4 className="font-semibold text-[#E4E6EB] text-2xl">Contact us</h4>
            <p className="mt-2 text-[#A8B0BB]">For partnerships, enterprise, or support — send a message and we'll respond promptly.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {submitMessage && <div className={`p-3 rounded text-sm ${submitMessage.toLowerCase().includes('fail') ? 'bg-[#2b0b0b] text-red-400' : 'bg-[#062016] text-[#7edbbd]'}`}>{submitMessage}</div>}

              <div>
                <label className="text-sm text-[#A8B0BB] block mb-1">Name</label>
                <input id="name" value={form.name} onChange={handleChange} required className="w-full px-4 py-3 bg-[#081015] border border-[#1B2430] rounded-lg text-[#E4E6EB]" />
              </div>

              <div>
                <label className="text-sm text-[#A8B0BB] block mb-1">Email</label>
                <input id="email" value={form.email} onChange={handleChange} required type="email" className="w-full px-4 py-3 bg-[#081015] border border-[#1B2430] rounded-lg text-[#E4E6EB]" />
              </div>

              <div>
                <label className="text-sm text-[#A8B0BB] block mb-1">Message</label>
                <textarea id="message" rows="5" value={form.message} onChange={handleChange} required className="w-full px-4 py-3 bg-[#081015] border border-[#1B2430] rounded-lg text-[#E4E6EB]"></textarea>
              </div>

              <button disabled={isSubmitting} type="submit" className="w-full py-4 rounded-lg text-lg" style={{ background: '#4FC4FF', color: '#05121a' }}>
                {isSubmitting ? "Sending..." : "Send message"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
