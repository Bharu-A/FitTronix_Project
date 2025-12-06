import React, { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

import HeroSection from "./sections/HeroSection";
import IntroSection from "./sections/IntroSection";
import FeatureStory from "./sections/FeatureStory";
import StickyShowcase from "./sections/StickyShowcase";
import DeepFeatures from "./sections/DeepFeatures";
import WorkoutGallery from "./sections/WorkoutGallery";
import StatsSection from "./sections/StatsSection";
import CoachesSection from "./sections/CoachesSection";
import FAQContact from "./sections/FAQContact";

/**
 * Slate Luxe (dark) homepage — accent: #4FC4FF (cyan)
 */
export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [faqs, setFaqs] = useState([]);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    async function fetch() {
      try {
        const [faqSnap, featSnap] = await Promise.all([
          getDocs(collection(db, "faqs")),
          getDocs(collection(db, "features"))
        ]);
        if (!mounted) return;
        const fbFaqs = faqSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const fbFeatures = featSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const extras = [
          { id: "local-1", question: "Does FitTronix store video?", answer: "No. By default analytics run locally. You can opt-in to share anonymized metrics." },
          { id: "local-2", question: "Which devices are supported?", answer: "Modern phones, tablets, laptops and desktops with a camera." },
          { id: "local-3", question: "Is it beginner friendly?", answer: "Yes — adaptive programs and safety-first cues help beginners progress safely." }
        ];
        setFaqs([...fbFaqs, ...extras]);
        setFeatures(fbFeatures);
      } catch (err) {
        console.error("Homepage load error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetch();
    return () => { mounted = false; };
  }, []);

  const handleContactSubmit = useCallback(async ({ name, email, message, resetForm }) => {
    setIsSubmitting(true);
    setSubmitMessage("");
    try {
      await addDoc(collection(db, "contacts"), { name, email, message, createdAt: serverTimestamp() });
      setSubmitMessage("Thanks — we'll reach out soon.");
      if (typeof resetForm === "function") resetForm();
    } catch (err) {
      console.error(err);
      setSubmitMessage("Failed to send. Try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const memoProps = useMemo(() => ({ faqs, features, loading }), [faqs, features, loading]);

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#E4E6EB] antialiased relative overflow-x-hidden">
      <BackgroundCloudsDark />

      <Navbar toggleSidebar={() => setSidebarOpen(s => !s)} />
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main>
        <HeroSection />
        <IntroSection />
        <FeatureStory />
        <StickyShowcase />
        <DeepFeatures features={features} loading={loading} />
        <WorkoutGallery />
        <StatsSection />
        <CoachesSection />
        <FAQContact
          faqs={faqs}
          loading={loading}
          onContactSubmit={handleContactSubmit}
          isSubmitting={isSubmitting}
          submitMessage={submitMessage}
        />
      </main>

      <Footer />

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-10 right-10 z-50 bg-[#182026] text-[#E4E6EB] p-3 rounded-full shadow-2xl hover:scale-105 transition"
          aria-label="Scroll to top"
        >↑</button>
      )}
    </div>
  );
}

/* Dark version of animated clouds + subtle gradient texture */
function BackgroundCloudsDark() {
  return (
    <>
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <div className="bg-texture-2 absolute inset-0"></div>
        <div className="dark-cloud dark-cloud-left"></div>
        <div className="dark-cloud dark-cloud-right"></div>
      </div>

      <style>{`
        .bg-texture-2 {
          background-image: radial-gradient(rgba(255,255,255,0.01) 1px, transparent 1px);
          background-size: 22px 22px;
          opacity: 0.04;
        }

        .dark-cloud {
          position: absolute;
          width: 900px;
          height: 700px;
          filter: blur(84px);
          opacity: 0.55;
          border-radius: 48%;
          transform: translate3d(0,0,0);
          background: radial-gradient(circle at 25% 30%, rgba(79,196,255,0.14), rgba(79,196,255,0.09) 35%, rgba(20,28,38,0.06) 70%, rgba(15,17,21,0.02) 100%);
        }

        .dark-cloud-left {
          left: -260px;
          top: -220px;
          animation: floatLeftDark 20s linear infinite;
        }

        .dark-cloud-right {
          right: -260px;
          bottom: -220px;
          animation: floatRightDark 22s linear infinite;
        }

        @keyframes floatLeftDark {
          0% { transform: translateY(0) translateX(0) scale(1); opacity:0.5; }
          50% { transform: translateY(42px) translateX(36px) scale(1.03); opacity:0.7; }
          100% { transform: translateY(0) translateX(0) scale(1); opacity:0.5; }
        }
        @keyframes floatRightDark {
          0% { transform: translateY(0) translateX(0) scale(1); opacity:0.45; }
          50% { transform: translateY(-36px) translateX(-56px) scale(1.04); opacity:0.68; }
          100% { transform: translateY(0) translateX(0) scale(1); opacity:0.45; }
        }

        @media (max-width: 768px) {
          .dark-cloud { width: 520px; height: 420px; filter: blur(56px); opacity: 0.4; }
          .dark-cloud-left { left: -120px; top: -100px; }
          .dark-cloud-right { right: -140px; bottom: -120px; }
        }
      `}</style>
    </>
  );
}
