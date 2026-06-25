"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { type ReactNode } from "react";
import { getGoogleOAuthClientId } from "@/lib/google-oauth-config";
import { FirebaseAuthProvider } from "@/lib/firebase-auth";

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  const clientId = getGoogleOAuthClientId();

  return (
    <FirebaseAuthProvider>
      {clientId ? (
        <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>
      ) : (
        children
      )}
    </FirebaseAuthProvider>
  );
}
