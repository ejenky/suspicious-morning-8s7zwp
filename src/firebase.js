import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  // Your actual config here
  apiKey: "AIzaSyDdWPoRZDnVu9lIlDvUrolafjuoqlFoo-I",
  authDomain: "hia-lead-tracker-pro.firebaseapp.com",
  projectId: "hia-lead-tracker-pro",
  storageBucket: "hia-lead-tracker-pro.firebasestorage.app",
  messagingSenderId: "570227064594",
  appId: "1:570227064594:web:880073de9dd6ae3fe77dcb",
};

// Initialize Firebase only if not already initialized
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
