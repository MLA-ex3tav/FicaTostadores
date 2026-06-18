import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-session";

/** @deprecated Usar /api/auth/me */
export async function GET(request: Request) {
  const session = await requireAdminSession(request);

  if (!session) {
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }

  return NextResponse.json({
    isAdmin: true,
    email: session.email,
  });
}
