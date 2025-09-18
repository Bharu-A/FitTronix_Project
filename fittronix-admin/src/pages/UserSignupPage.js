import React from "react";
import { useNavigate } from "react-router-dom";

function SignupPage({ setIsAuthenticated }) {
  const navigate = useNavigate();

  const handleSignup = () => {
    setIsAuthenticated(true); // simulate signup
    navigate("/"); // redirect to home
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">Signup</h2>
        <input
          type="text"
          placeholder="Name"
          className="w-full px-4 py-2 mb-3 border rounded-lg"
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 mb-3 border rounded-lg"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 mb-3 border rounded-lg"
        />
        <button
          onClick={handleSignup}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
        >
          Signup
        </button>
      </div>
    </div>
  );
}

export default SignupPage;
