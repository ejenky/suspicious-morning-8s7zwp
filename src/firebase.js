// Debug: log what we're getting from environment variables
console.log('Environment variables:', {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
});

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIza5qJOUmPpR2DnyU011PDurola2fuqolroq-I",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "hia-lead-tracker-pro.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "hia-lead-tracker-pro",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "hia-lead-tracker-pro.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "70645594",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:570227064594:web:880073de9dd6ae3fe77dcb"
};

console.log('Final Firebase config:', firebaseConfig);
