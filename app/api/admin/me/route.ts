import { NextResponse } from "next/server";
import { requireStaffApi } from "@/lib/admin-api-guard";

/** @deprecated Usar /api/auth/me */
export async function GET(request: Request) {
  const guard = await requireStaffApi(request, "read");

  if (!guard.ok) {
    return guard.response;
  }

  return NextResponse.json({
    isStaff: true,
    isAdmin: guard.session.role === "admin",
    role: guard.session.role,
    email: guard.session.email,
  });
}
