import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Production Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCFM2BkzLKbEizBHyd3DI1AG6axoCiYA08",
  authDomain: "sample-firbase-ai-app-c1fc3.firebaseapp.com",
  projectId: "sample-firbase-ai-app-c1fc3",
  storageBucket: "sample-firbase-ai-app-c1fc3.firebasestorage.app",
  messagingSenderId: "251353888761",
  appId: "1:251353888761:web:d861ad2ae68751c695ef28"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

console.log('Firebase initialized in production mode');

export { app, db, auth, analytics };
