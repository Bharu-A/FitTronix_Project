// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
const firebaseConfig = {
  apiKey: "AIzaSyAdpHA3tAhocitYjU6eEkRVAYn1mlKnh6E",
  authDomain: "fittronix-9c730.firebaseapp.com",
  projectId: "fittronix-project",
  storageBucket: "fittronix-9c730.firebasestorage.app",
  messagingSenderId: "416048089134",
  appId: "1:416048089134:web:7c5cbf69f46e18a84437bf",
  measurementId: "G-08DVKRP6BT",
  databaseURL: "https://fittronix-project-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const realtimeDb = getDatabase(app);