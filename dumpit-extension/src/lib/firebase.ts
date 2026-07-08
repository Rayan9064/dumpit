import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, indexedDBLocalPersistence, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDwKvdZL1oJ3vSV94qUsjmYLbMGFkL81uQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dumpit-62870.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dumpit-62870",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dumpit-62870.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "794186381857",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:794186381857:web:aa610f8550dd96eb7dc160"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Use IndexedDB persistence to share authentication state across popup, side panel, and background service worker
export const auth: Auth = initializeAuth(app, {
  persistence: indexedDBLocalPersistence
});
