'use client'

import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  getAdditionalUserInfo,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup
} from 'firebase/auth';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { authFetch, jsonAuthFetch } from '../lib/authFetch';
import { auth, isFirebaseClientConfigured } from '../lib/firebase';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any | null }>;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signInWithGoogle: () => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const firebaseConfigError = new Error('Firebase client configuration is missing.');

const normalizeUsername = (value?: string | null) => {
  const fallback = `user_${Date.now().toString().slice(-6)}`;
  const normalized = (value || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 20);

  return normalized.length >= 3 ? normalized : fallback;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setUser(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const syncToken = async () => {
        try {
          const token = await user.getIdToken();
          document.dispatchEvent(new CustomEvent('DUMPIT_EXTENSION_AUTH', { detail: { token } }));
        } catch (e) {
          console.error('Error syncing token for extension:', e);
        }
      };
      syncToken();
      // Periodically sync token
      const interval = setInterval(syncToken, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      if (!auth || !isFirebaseClientConfigured) {
        throw firebaseConfigError;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile via secure API route
      const response = await jsonAuthFetch(user, '/api/user-profile', {
        method: 'POST',
        body: JSON.stringify({
          username,
          email,
          share_by_default: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user profile');
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      if (!auth || !isFirebaseClientConfigured) {
        throw firebaseConfigError;
      }

      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      if (!auth || !isFirebaseClientConfigured) {
        throw firebaseConfigError;
      }

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if this is a new user
      const additionalInfo = getAdditionalUserInfo(result);
      if (additionalInfo?.isNewUser) {
        // Create profile for new Google users
        const response = await jsonAuthFetch(user, '/api/user-profile', {
          method: 'POST',
          body: JSON.stringify({
            username: normalizeUsername(user.displayName || user.email?.split('@')[0]),
            email: user.email,
            share_by_default: false,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create user profile');
        }
      } else {
        // Existing user - check if profile exists, create if not
        const checkResponse = await authFetch(user, '/api/user-profile');
        if (!checkResponse.ok) {
          // Profile doesn't exist, create it
          const createResponse = await jsonAuthFetch(user, '/api/user-profile', {
            method: 'POST',
            body: JSON.stringify({
              username: normalizeUsername(user.displayName || user.email?.split('@')[0]),
              email: user.email,
              share_by_default: false,
            }),
          });

          if (!createResponse.ok) {
            const errorData = await createResponse.json();
            throw new Error(errorData.error || 'Failed to create user profile');
          }

          console.log('Google user profile created for existing user');
        }
      }

      return { error: null };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
