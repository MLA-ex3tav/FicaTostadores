"use client";

import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import {
  CLIENTES_COLLECTION,
  isAdminRole,
  type UserRole,
} from "@/lib/firestore-collections";
import { getFirebaseFirestore } from "@/lib/firebase/client";

interface ClienteRecord {
  role?: UserRole;
}

export async function getClienteRole(uid: string): Promise<UserRole | null> {
  const db = getFirebaseFirestore();

  if (!db) {
    return null;
  }

  const snapshot = await getDoc(doc(db, CLIENTES_COLLECTION, uid));

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as ClienteRecord;
  return data.role ?? null;
}

export async function upsertClienteClient(user: User): Promise<void> {
  const db = getFirebaseFirestore();

  if (!db || !user.email) {
    return;
  }

  const ref = doc(db, CLIENTES_COLLECTION, user.uid);
  const existing = await getDoc(ref);

  const profile = {
    uid: user.uid,
    email: user.email.toLowerCase(),
    displayName: user.displayName,
    photoURL: user.photoURL,
    lastLoginAt: serverTimestamp(),
  };

  if (existing.exists()) {
    await setDoc(ref, profile, { merge: true });
    return;
  }

  await setDoc(
    ref,
    {
      ...profile,
      role: "cliente" satisfies UserRole,
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function isAdminClient(uid: string): Promise<boolean> {
  const role = await getClienteRole(uid);
  return isAdminRole(role);
}

export async function syncAuthSessionClient(
  user: User,
): Promise<{ isAdmin: boolean }> {
  await upsertClienteClient(user);
  const isAdmin = await isAdminClient(user.uid);

  return { isAdmin };
}
