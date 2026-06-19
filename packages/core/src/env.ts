/** Centralised, validated access to runtime configuration. */

export const publicFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
};

export function isFirebaseConfigured(): boolean {
  return Boolean(publicFirebaseConfig.apiKey && publicFirebaseConfig.projectId);
}

export const serverEnv = {
  serviceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT_JSON ?? '',
  googleCloudProject: process.env.GOOGLE_CLOUD_PROJECT ?? '',
  vertexLocation: process.env.VERTEX_LOCATION ?? 'us-central1',
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
};

export function isAiConfigured(): boolean {
  return Boolean(serverEnv.geminiApiKey || serverEnv.googleCloudProject);
}
