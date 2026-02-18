// firebase-config.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyApdc_SVK6D45LBU63StCwENQjXwT66XK0",
  authDomain: "projectorganizer-aeade.firebaseapp.com",
  projectId: "projectorganizer-aeade",
  storageBucket: "projectorganizer-aeade.firebasestorage.app",
  messagingSenderId: "876520638108",
  appId: "1:876520638108:web:064984d3cf3dc74af24f59",
  measurementId: "G-2T8Q6N9MSG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, analytics, auth };