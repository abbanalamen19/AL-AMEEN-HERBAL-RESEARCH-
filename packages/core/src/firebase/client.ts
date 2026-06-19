import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { isFirebaseConfigured, publicFirebaseConfig } from '../env';

let app: FirebaseApp | null = null;

/** Lazily initialise the client SDK. Returns null when config is absent. */
export function getClientApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(publicFirebaseConfig);
  }
  return app;
}

export function getClientAuth(): Auth | null {
  const a = getClientApp();
  return a ? getAuth(a) : null;
}

export function getClientDb(): Firestore | null {
  const a = getClientApp();
  return a ? getFirestore(a) : null;
}

export function getClientStorage(): FirebaseStorage | null {
  const a = getClientApp();
  return a ? getStorage(a) : null;
}
