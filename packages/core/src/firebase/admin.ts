import {
  cert,
  getApps,
  initializeApp,
  type App,
  applicationDefault,
} from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { serverEnv } from '../env';

let adminApp: App | null = null;

/**
 * Initialise the Admin SDK. Uses an explicit service account when provided,
 * otherwise falls back to Application Default Credentials (Workload Identity).
 * Returns null when nothing is configured (e.g. local placeholder mode).
 */
export function getAdminApp(): App | null {
  if (adminApp) return adminApp;
  if (getApps().length) {
    adminApp = getApps()[0]!;
    return adminApp;
  }

  try {
    if (serverEnv.serviceAccountJson) {
      const parsed = JSON.parse(serverEnv.serviceAccountJson) as Record<string, string>;
      adminApp = initializeApp({ credential: cert(parsed) });
    } else if (serverEnv.googleCloudProject) {
      adminApp = initializeApp({ credential: applicationDefault() });
    } else {
      return null;
    }
  } catch {
    return null;
  }
  return adminApp;
}

export function getAdminAuth(): Auth | null {
  const a = getAdminApp();
  return a ? getAuth(a) : null;
}

export function getAdminDb(): Firestore | null {
  const a = getAdminApp();
  return a ? getFirestore(a) : null;
}
