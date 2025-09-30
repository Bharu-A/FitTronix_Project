// src/App.js
import React, { useState } from "react";
import "./index.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import LoginPage from "./pages/UserLoginPage";
import SignupPage from "./pages/UserSignupPage";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import NutritionPage from "./pages/NutritionPage";
import ProfilePage from "./pages/ProfilePage";
import HealthTracker from "./pages/HealthTracker";
import CompleteProfile from "./pages/CompleteProfile";
import WorkoutPage from "./pages/WorkoutPage";
import FitTronixSchedule from "./pages/FitTronixSchedule";
import FitTronixSettings from "./pages/FitTronixSettings";
import AICoachPage from "./pages/AICoachPage";
import Contact from "./pages/footerPages/Contact";
import PrivacyPolicy from "./pages/footerPages/PrivacyPolicy";
import About from "./pages/footerPages/About";
import Blog from "./pages/footerPages/Blog";
import FAQ from "./pages/footerPages/FAQ";
import RequireAdmin from "./components/RequireAdmin";


function Layout({ children }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const user = {
    name: "Bharath",
    email: "bharath@example.com",
    photoURL: "/default-avatar.png",
  };

  const handleLogout = () => {
    console.log("User logged out!");
  };

  // Hide sidebar + navbar on homepage & auth pages
  const noSidebarRoutes = ["/", "/login", "/signup", "/admin/login", "/admin/signup"];
  const hideSidebar = noSidebarRoutes.includes(location.pathname);

  return (
    <div className="flex relative">
      {/* Sidebar */}
      {!hideSidebar && <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} user={user} onLogout={handleLogout} />}

      {/* Overlay for mobile */}
      {!hideSidebar && isOpen && (
        <div
          className="fixed inset-0 bg-black/40 lg:hidden z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          !hideSidebar && isOpen ? "lg:ml-64" : "ml-0"
        }`}
      >
        {!hideSidebar && <Navbar toggleSidebar={() => setIsOpen(!isOpen)} />}
        {children}
        {!hideSidebar && <Footer />}
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/nutrition" element={<NutritionPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/healthTracker" element={<HealthTracker />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/workoutPage" element={<WorkoutPage />} />
          <Route path="/schedule" element={<FitTronixSchedule />} />
          <Route path="/fitTronixSettings" element={<FitTronixSettings />} />
          <Route path="/aICoachPage" element={<AICoachPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacyPolicy" element={<PrivacyPolicy />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/admin/dashboard" element={<RequireAdmin><AdminDashboardPage/></RequireAdmin>} />

        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;