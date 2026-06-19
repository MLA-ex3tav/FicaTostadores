import { NextResponse } from "next/server";
import {
  requireStaffSession,
  requireSuperAdminSession,
  type StaffSession,
} from "@/lib/admin-session";
import { getRequestIdToken } from "@/lib/firebase-user-session";
import {
  assertRateLimits,
  RATE_LIMITS,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { getClientIp } from "@/lib/sanitize";
import { hashForRateLimit } from "@/lib/security/token-hash";

type AdminApiSuccess = {
  ok: true;
  session: StaffSession;
};

type AdminApiFailure = {
  ok: false;
  response: Response;
};

async function enforceRateLimit(
  request: Request,
  session: StaffSession,
  scope: "read" | "write" | "upload",
): Promise<AdminApiFailure | null> {
  const ip = getClientIp(request);
  const token = getRequestIdToken(request);
  const tokenHash = token ? await hashForRateLimit(token) : "anonymous";

  const keys = [`admin-ip:${ip}:${scope}`, `admin-user:${session.uid}:${scope}`];

  if (tokenHash !== "anonymous") {
    keys.push(`admin-token:${tokenHash}:${scope}`);
  }

  const config =
    scope === "upload"
      ? RATE_LIMITS.uploadPerUser
      : scope === "write"
        ? RATE_LIMITS.adminWritePerUser
        : RATE_LIMITS.publicRead;

  const rateLimit = await assertRateLimits(keys, config);

  if (!rateLimit.ok) {
    return {
      ok: false,
      response: rateLimitResponse(rateLimit.retryAfterSeconds),
    };
  }

  return null;
}

export async function requireStaffApi(
  request: Request,
  scope: "read" | "write" | "upload",
): Promise<AdminApiSuccess | AdminApiFailure> {
  const session = await requireStaffSession(request);

  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }

  const rateLimitFailure = await enforceRateLimit(request, session, scope);

  if (rateLimitFailure) {
    return rateLimitFailure;
  }

  return { ok: true, session };
}

export async function requireSuperAdminApi(
  request: Request,
  scope: "read" | "write" | "upload" = "read",
): Promise<AdminApiSuccess | AdminApiFailure> {
  const session = await requireSuperAdminSession(request);

  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "No autorizado" }, { status: 403 }),
    };
  }

  const rateLimitFailure = await enforceRateLimit(request, session, scope);

  if (rateLimitFailure) {
    return rateLimitFailure;
  }

  return { ok: true, session };
}

/** @deprecated Use requireStaffApi or requireSuperAdminApi */
export async function requireAdminApi(
  request: Request,
  scope: "read" | "write" | "upload",
): Promise<AdminApiSuccess | AdminApiFailure> {
  return requireStaffApi(request, scope);
}
