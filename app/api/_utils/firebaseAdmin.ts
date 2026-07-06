import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let cachedDb: FirebaseFirestore.Firestore | null = null;

const ensureFirebaseAdmin = () => {
  if (!getApps().length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
      throw new Error('Missing Firebase Admin SDK environment variables');
    }

    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
  }
};

export const getServerFirestore = (): FirebaseFirestore.Firestore => {
  if (cachedDb) {
    return cachedDb;
  }

  ensureFirebaseAdmin();

  cachedDb = getFirestore();
  return cachedDb;
};

export const getServerAuth = () => {
  ensureFirebaseAdmin();
  return getAuth();
};
