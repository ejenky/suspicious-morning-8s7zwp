import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIza5qJOUmPpR2DnyU011PDurola2fuqolroq-I",
  authDomain: "hia-lead-tracker-pro.firebaseapp.com",
  projectId: "hia-lead-tracker-pro",
  storageBucket: "hia-lead-tracker-pro.firebasestorage.app",
  messagingSenderId: "70645594",
  appId: "1:570227064594:web:880073de9dd6ae3fe77dcb"
};

// Initialize Firebase only if not already initialized
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
