"use client";

import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { CLIENTES_COLLECTION } from "@/lib/firestore-collections";
import {
  canManageUsers,
  isStaffRole,
  isSuperAdminRole,
  type UserRole,
} from "@/lib/permissions";
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

export async function isStaffClient(uid: string): Promise<boolean> {
  const role = await getClienteRole(uid);
  return isStaffRole(role);
}

export async function isSuperAdminClient(uid: string): Promise<boolean> {
  const role = await getClienteRole(uid);
  return isSuperAdminRole(role);
}

/** @deprecated Use isSuperAdminClient */
export async function isAdminClient(uid: string): Promise<boolean> {
  return isSuperAdminClient(uid);
}

export async function syncAuthSessionClient(
  user: User,
): Promise<{ role: UserRole | null; isStaff: boolean; isAdmin: boolean }> {
  await upsertClienteClient(user);
  const role = await getClienteRole(user.uid);

  return {
    role,
    isStaff: isStaffRole(role),
    isAdmin: isSuperAdminRole(role),
  };
}

export function canManageUsersClient(role: UserRole | null): boolean {
  return canManageUsers(role);
}
