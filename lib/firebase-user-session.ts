import { CLIENTES_COLLECTION } from "@/lib/firestore-collections";
import {
  isStaffRole,
  isSuperAdminRole,
  parseUserRole,
  type UserRole,
} from "@/lib/permissions";

export interface FirebaseUserSession {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
}

function getBearerToken(request: Request): string | null {
  const header = request.headers.get("Authorization");

  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  return header.slice(7).trim();
}

function getFirebaseApiKey(): string | null {
  return process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() ?? null;
}

function getFirebaseProjectId(): string | null {
  return process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ?? null;
}

interface IdentityToolkitUser {
  localId?: string;
  email?: string;
  displayName?: string;
  photoUrl?: string;
}

interface IdentityToolkitResponse {
  users?: IdentityToolkitUser[];
}

export async function verifyFirebaseUser(
  request: Request,
): Promise<FirebaseUserSession | null> {
  const token = getBearerToken(request);
  const apiKey = getFirebaseApiKey();

  if (!token || !apiKey) {
    return null;
  }

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as IdentityToolkitResponse;
    const account = data.users?.[0];

    if (!account?.localId || !account.email) {
      return null;
    }

    return {
      uid: account.localId,
      email: account.email,
      displayName: account.displayName ?? null,
      photoURL: account.photoUrl ?? null,
    };
  } catch {
    return null;
  }
}

interface FirestoreStringValue {
  stringValue?: string;
}

interface FirestoreDocument {
  fields?: {
    role?: FirestoreStringValue;
  };
}

export async function getClienteRoleFromRest(
  uid: string,
  idToken: string,
): Promise<string | null> {
  const projectId = getFirebaseProjectId();

  if (!projectId) {
    return null;
  }

  try {
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${CLIENTES_COLLECTION}/${uid}`,
      {
        headers: { Authorization: `Bearer ${idToken}` },
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as FirestoreDocument;
    return data.fields?.role?.stringValue ?? null;
  } catch {
    return null;
  }
}

export async function getUserRoleFromRest(
  uid: string,
  idToken: string,
): Promise<UserRole | null> {
  const role = await getClienteRoleFromRest(uid, idToken);
  return parseUserRole(role);
}

export async function isStaffFromRest(
  uid: string,
  idToken: string,
): Promise<boolean> {
  const role = await getUserRoleFromRest(uid, idToken);
  return isStaffRole(role);
}

export async function isAdminFromRest(
  uid: string,
  idToken: string,
): Promise<boolean> {
  const role = await getUserRoleFromRest(uid, idToken);
  return isSuperAdminRole(role);
}

export function getRequestIdToken(request: Request): string | null {
  return getBearerToken(request);
}
