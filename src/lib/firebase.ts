// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBMPM93qI02vLppxEOwIRF13JZqRf_kbQs",
  authDomain: "dumpit-50760.firebaseapp.com",
  projectId: "dumpit-50760",
  storageBucket: "dumpit-50760.appspot.com",
  messagingSenderId: "924635227217",
  appId: "1:924635227217:web:aecaee9b8591294e274470",
  measurementId: "G-FX15XKQWJN"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
// REMOVE analytics initialization here!
