// Debug: log what we're getting from environment variables
console.log('Environment variables:', {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
});

const firebaseConfig = {
  apiKey: "AIza5qJOUmPpR2DnyU011PDurola2fuqolroq-I",
  authDomain: "hia-lead-tracker-pro.firebaseapp.com",
  projectId: "hia-lead-tracker-pro",
  storageBucket: "hia-lead-tracker-pro.firebasestorage.app",
  messagingSenderId: "70645594",
  appId: "1:570227064594:web:880073de9dd6ae3fe77dcb"
};

console.log('Final Firebase config:', firebaseConfig);
