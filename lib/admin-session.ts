import {
  getRequestIdToken,
  getUserRoleFromRest,
  verifyFirebaseUser,
} from "@/lib/firebase-user-session";
import {
  canManageUsers,
  isStaffRole,
  type UserRole,
} from "@/lib/permissions";

export interface StaffSession {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
}

async function getStaffSession(request: Request): Promise<StaffSession | null> {
  const token = getRequestIdToken(request);
  const user = await verifyFirebaseUser(request);

  if (!user || !token) {
    return null;
  }

  const role = await getUserRoleFromRest(user.uid, token);

  if (!role || !isStaffRole(role)) {
    return null;
  }

  return { ...user, role };
}

export async function requireStaffSession(
  request: Request,
): Promise<StaffSession | null> {
  return getStaffSession(request);
}

export async function requireSuperAdminSession(
  request: Request,
): Promise<StaffSession | null> {
  const session = await getStaffSession(request);

  if (!session || !canManageUsers(session.role)) {
    return null;
  }

  return session;
}

/** @deprecated Use requireStaffSession or requireSuperAdminSession */
export async function requireAdminSession(request: Request) {
  const session = await requireStaffSession(request);

  if (!session || !canManageUsers(session.role)) {
    return null;
  }

  return session;
}
