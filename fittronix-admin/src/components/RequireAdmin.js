// RequireAdmin.jsx
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { getDoc, doc } from "firebase/firestore";
import { Navigate } from "react-router-dom";

export default function RequireAdmin({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      try {
        const tokenResult = await user.getIdTokenResult();
        if (tokenResult.claims?.admin) {
          setIsAdmin(true);
        } else {
          // fallback: check Firestore role (optional)
          const snap = await getDoc(doc(db, "users", user.uid));
          if (snap.exists() && snap.data().role === "admin") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        }
      } catch (err) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }
  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }
  return children;
}
