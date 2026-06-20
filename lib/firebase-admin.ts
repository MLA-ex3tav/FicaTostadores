import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let cachedApp: App | null | undefined;

function parseServiceAccountJson(): Record<string, unknown> | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();

  if (!raw) {
    return null;
  }

  try {
    const jsonText = raw.startsWith("{")
      ? raw
      : Buffer.from(raw, "base64").toString("utf8");

    return JSON.parse(jsonText) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function isFirebaseAdminConfigured(): boolean {
  return parseServiceAccountJson() !== null;
}

export function getFirebaseAdminApp(): App | null {
  if (cachedApp !== undefined) {
    return cachedApp;
  }

  const serviceAccount = parseServiceAccountJson();

  if (!serviceAccount) {
    cachedApp = null;
    return null;
  }

  const existing = getApps()[0];

  if (existing) {
    cachedApp = existing;
    return existing;
  }

  cachedApp = initializeApp({
    credential: cert(serviceAccount),
  });

  return cachedApp;
}

export function getFirebaseAdminFirestore(): Firestore | null {
  const app = getFirebaseAdminApp();

  if (!app) {
    return null;
  }

  return getFirestore(app);
}
