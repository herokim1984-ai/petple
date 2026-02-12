import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCGIkTqejYhfx8fmVFKkxyP-8psVPSsWlA",
  authDomain: "petpleclaude.firebaseapp.com",
  projectId: "petpleclaude",
  storageBucket: "petpleclaude.firebasestorage.app",
  messagingSenderId: "1078915658985",
  appId: "1:1078915658985:web:9c6a5926333bb2c905ac78",
  measurementId: "G-4HYV655Q58"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
