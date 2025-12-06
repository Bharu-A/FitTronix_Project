// src/firebase.js
import { initializeApp } from "firebase/app";
import { 
  getAuth 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { 
  getStorage 
} from "firebase/storage";
import { 
  getDatabase 
} from "firebase/database";

// ✅ Your real Firebase project config
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

// ✅ Initialize Firebase once
const app = initializeApp(firebaseConfig);

// ✅ Export core Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const realtimeDb = getDatabase(app);

//
// 🔧 Firestore helper functions
//
export const updateUserSubscription = async (userId, subscriptionData) => {
  try {
    await setDoc(doc(db, "users", userId, "subscription", "current"), {
      ...subscriptionData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    await setDoc(doc(db, "users", userId, "profile", "basic"), {
      ...profileData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

// 🧠 Example: Fetch user data (placeholder logic)
export const getUserData = async (userId) => {
  try {
    // You can replace mock data with getDoc() logic later
    return {
      subscription: { plan: "Free", status: "active" },
      profile: { name: "Cyber Athlete" }
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};
