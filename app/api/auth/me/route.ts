import { NextResponse } from "next/server";
import {
  getRequestIdToken,
  isAdminFromRest,
  verifyFirebaseUser,
} from "@/lib/firebase-user-session";

export async function GET(request: Request) {
  const token = getRequestIdToken(request);
  const user = await verifyFirebaseUser(request);

  if (!user || !token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const isAdmin = await isAdminFromRest(user.uid, token);

  return NextResponse.json({
    user: {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    },
    isAdmin,
  });
}
