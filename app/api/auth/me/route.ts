import { NextResponse } from "next/server";
import {
  getUserRoleFromRest,
  isStaffFromRest,
  isAdminFromRest,
  verifyFirebaseUser,
} from "@/lib/firebase-user-session";
import { getRequestIdToken } from "@/lib/firebase-user-session";
import { assertRateLimits, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/sanitize";
import { hashForRateLimit } from "@/lib/security/token-hash";

export async function GET(request: Request) {
  const token = getRequestIdToken(request);
  const user = await verifyFirebaseUser(request);

  if (!user || !token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const ip = getClientIp(request);
  const tokenHash = await hashForRateLimit(token);
  const rateLimit = await assertRateLimits(
    [`auth-ip:${ip}`, `auth-user:${user.uid}`, `auth-token:${tokenHash}`],
    RATE_LIMITS.auth,
  );

  if (!rateLimit.ok) {
    return rateLimitResponse(rateLimit.retryAfterSeconds);
  }

  const role = await getUserRoleFromRest(user.uid, token);
  const isStaff = await isStaffFromRest(user.uid, token);
  const isAdmin = await isAdminFromRest(user.uid, token);

  return NextResponse.json({
    user: {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    },
    role,
    isStaff,
    isAdmin,
    isSuperAdmin: isAdmin,
  });
}
