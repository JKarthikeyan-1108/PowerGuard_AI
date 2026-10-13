/**
 * PowerGuard AI — Server-Side Firebase Admin SDK
 * Exclusively used by Serverless Route Handlers (/api/ingest, /api/predict).
 * Modular imports conforming to firebase-admin v12+.
 */

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

let adminApp: App | null = null;
let adminDb: Firestore | null = null;
let adminAuth: Auth | null = null;

export const isFirebaseAdminConfigured = Boolean(
  process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
  (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY)
);

export function getAdminInstances(): {
  adminApp: App | null;
  adminDb: Firestore | null;
  adminAuth: Auth | null;
} {
  if (adminApp && adminDb && adminAuth) {
    return { adminApp, adminDb, adminAuth };
  }

  const existingApps = getApps();
  if (existingApps.length > 0) {
    adminApp = existingApps[0]!;
    adminDb = getFirestore(adminApp);
    adminAuth = getAuth(adminApp);
    return { adminApp, adminDb, adminAuth };
  }

  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      adminApp = initializeApp({
        credential: cert(serviceAccount),
      });
    } else if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });
    } else {
      adminApp = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'powerguard-ai',
      });
    }

    adminDb = getFirestore(adminApp);
    adminAuth = getAuth(adminApp);
  } catch (error) {
    console.warn('[Firebase Admin] Initialization notice (operating in standalone server mode):', error);
  }

  return { adminApp, adminDb, adminAuth };
}
