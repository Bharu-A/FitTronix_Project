// src/App.js
import React, { useState } from "react";
import './index.css';
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminSignupPage from "./pages/AdminSignupPage";
import LoginPage from "./pages/UserLoginPage";
import SignupPage from "./pages/UserSignupPage";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import Navbar from "./components/Navbar"; // ✅ import Navbar
import NutritionPage from "./pages/NutritionPage";
import ProfilePage from "./pages/ProfilePage";
function Layout({ children }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  // Hide sidebar + navbar on homepage & auth pages
  const noSidebarRoutes = ["/", "/login", "/signup", "/admin/login", "/admin/signup"];
  const hideSidebar = noSidebarRoutes.includes(location.pathname);

  return (
    <div className="flex">
      {!hideSidebar && <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />}
      <div className={`flex-1 transition-all duration-300 ${!hideSidebar && isOpen ? "ml-64" : "ml-0"}`}>
        {!hideSidebar && <Navbar toggleSidebar={() => setIsOpen(!isOpen)} />}
        {children}
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
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/signup" element={<AdminSignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/nutrition" element={<NutritionPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          

        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
