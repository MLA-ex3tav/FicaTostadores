"use client";

import { type ReactNode } from "react";
import { FirebaseAuthProvider } from "@/lib/firebase-auth";

interface FirebaseAuthShellProps {
  children: ReactNode;
}

export default function FirebaseAuthShell({ children }: FirebaseAuthShellProps) {
  return <FirebaseAuthProvider>{children}</FirebaseAuthProvider>;
}
