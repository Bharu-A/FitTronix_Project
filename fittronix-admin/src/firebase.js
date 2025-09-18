// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyBljZmW8kqnIgstfoiCnglwY-9jqjQYU3g",
  authDomain: "fittronix-9c730.firebaseapp.com",
  projectId: "fittronix-9c730",
  storageBucket: "fittronix-9c730.firebasestorage.app",
  messagingSenderId: "416048089134",
  appId: "1:416048089134:web:7c5cbf69f46e18a84437bf",
  measurementId: "G-08DVKRP6BT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);