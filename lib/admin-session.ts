import {
  getRequestIdToken,
  isAdminFromRest,
  verifyFirebaseUser,
} from "@/lib/firebase-user-session";

export async function requireAdminSession(request: Request) {
  const token = getRequestIdToken(request);
  const user = await verifyFirebaseUser(request);

  if (!user || !token || !(await isAdminFromRest(user.uid, token))) {
    return null;
  }

  return user;
}
