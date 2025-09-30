// AdminLoginPage.jsx
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      // Fetch user role from Firestore
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const role = userSnap.data().role;

        if (role === "admin") {
          navigate("/admin/dashboard");
        } else {
          setError("Access Denied: You are not an admin.");
          await auth.signOut();
        }
      } else {
        setError("User not found in database.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/assets/bg_img.png')" }}
    >
      <div className="bg-black/60 p-10 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-white mb-2">Admin Login</h2>
        <p className="text-sm text-gray-300 mb-6">
          Please login with your admin credentials.
        </p>

        {error && (
          <div className="mb-4 text-red-300 border border-red-500 p-2 rounded bg-red-500/10">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-white block mb-1 text-sm">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded bg-white/10 text-white border border-white/30 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="text-white block mb-1 text-sm">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-white/10 text-white border border-white/30 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded bg-purple-600 hover:bg-purple-700 transition duration-300 text-white font-semibold shadow"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLoginPage;
