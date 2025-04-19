// src/config/firebaseConfig.js
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { getAuth } = require('firebase/auth');

// Your web app's Firebase configuration for production
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCFM2BkzLKbEizBHyd3DI1AG6axoCiYA08",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "sample-firbase-ai-app-c1fc3.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "sample-firbase-ai-app-c1fc3",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "sample-firbase-ai-app-c1fc3.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "251353888761",
  appId: process.env.FIREBASE_APP_ID || "1:251353888761:web:d861ad2ae68751c695ef28",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-7W3P8TY0GJ"
};

// Initialize Firebase
let app, db, auth;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  
  console.log("✅ Firebase initialized successfully");
} catch (error) {
  console.error("❌ Firebase initialization error:", error);
  // Don't throw an error here, just log it
  console.error(`Firebase initialization failed: ${error.message}`);
}

// Export the initialized Firebase instances
module.exports = { app, db, auth };