import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

function getEnvVar(key: string, fallback: string): string {
  try {
    if (typeof import.meta !== "undefined" && (import.meta as any)?.env?.[key]) {
      return (import.meta as any).env[key];
    }
  } catch {}
  try {
    if (typeof process !== "undefined" && process?.env?.[key]) {
      return process.env[key]!;
    }
  } catch {}
  return fallback;
}

const firebaseConfig = {
  apiKey: getEnvVar("VITE_FIREBASE_API_KEY", "AIzaSyC6-INUGE3Q1Udehqv-_XBdUVLyentGOeI"),
  authDomain: getEnvVar("VITE_FIREBASE_AUTH_DOMAIN", "arju-30636.firebaseapp.com"),
  projectId: getEnvVar("VITE_FIREBASE_PROJECT_ID", "arju-30636"),
  storageBucket: getEnvVar("VITE_FIREBASE_STORAGE_BUCKET", "arju-30636.firebasestorage.app"),
  messagingSenderId: getEnvVar("VITE_FIREBASE_MESSAGING_SENDER_ID", "69131172432"),
  appId: getEnvVar("VITE_FIREBASE_APP_ID", "1:69131172432:web:46b9a21debaaf19bbaef55"),
  measurementId: getEnvVar("VITE_FIREBASE_MEASUREMENT_ID", "G-C5SZX6MQQ4"),
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
