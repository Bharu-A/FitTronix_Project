import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function AdminSignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // You can add more state variables for other fields, e.g.,
  // const [phoneNumber, setPhoneNumber] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      await setDoc(doc(db, "users", uid), {
        email,
        name,
        role: "admin",
        // Add other fields you collect, e.g.,
        // phoneNumber,
      });

      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form className="bg-white p-6 rounded shadow-md w-96" onSubmit={handleSignup}>
        <h2 className="text-2xl font-bold mb-4">Admin Sign Up</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        {/* Name Field */}
        <label htmlFor="name" className="block text-gray-700 font-bold mb-1">Name</label>
        <input 
          id="name"
          type="text" 
          placeholder="Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
          className="input mb-2" 
        />
        
        {/* Email Field */}
        <label htmlFor="email" className="block text-gray-700 font-bold mb-1">Email</label>
        <input 
          id="email"
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          className="input mt-2 mb-2" 
        />
        
        {/* Password Field */}
        <label htmlFor="password" className="block text-gray-700 font-bold mb-1">Password</label>
        <input 
          id="password"
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          className="input mt-2 mb-2" 
        />
        
        {/* Confirm Password Field */}
        <label htmlFor="confirmPassword" className="block text-gray-700 font-bold mb-1">Confirm Password</label>
        <input 
          id="confirmPassword"
          type="password" 
          placeholder="Confirm Password" 
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} 
          required 
          className="input mt-2 mb-4" 
        />
        
        <button 
          type="submit" 
          className="btn w-full"
          disabled={loading}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}

export default AdminSignupPage;