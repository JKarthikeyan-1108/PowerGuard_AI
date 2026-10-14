/**
 * PowerGuard AI — Client Firebase SDK Initialization
 * Configured with environment variables and built-in offline demo fallback.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDemoFallbackKeyForLocalDevelopment01',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'powerguard-3ef68.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'powerguard-3ef68',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'powerguard-3ef68.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789012:web:powerguardWebClient',
};

// Check if production live credentials have been configured
export const isFirebaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'AIzaSyDemoFallbackKeyForLocalDevelopment01' &&
  !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('Placeholder') &&
  !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('demo') &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn('[Firebase] Client initialization warning:', error);
  // Defensive fallback
  try {
    app = getApps().length ? getApp() : initializeApp({
      apiKey: 'AIzaSyDemoFallbackKeyForLocalDevelopment01',
      projectId: 'powerguard-3ef68',
      authDomain: 'powerguard-3ef68.firebaseapp.com'
    }, 'fallback');
    auth = getAuth(app);
    db = getFirestore(app);
  } catch {
    // Graceful no-op for headless server builds
    auth = {} as Auth;
    db = {} as Firestore;
    app = {} as FirebaseApp;
  }
}

export { app, auth, db };
