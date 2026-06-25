"use client";

import { useGoogleOneTapLogin } from "@react-oauth/google";
import { useFirebaseAuth } from "@/lib/firebase-auth";
import { getFirebaseAuthErrorMessage } from "@/lib/firebase-auth-errors";
import { isGoogleOAuthConfigured } from "@/lib/google-oauth-config";

interface GoogleOneTapLoginProps {
  disabled?: boolean;
  onError?: (message: string) => void;
}

export default function GoogleOneTapLogin(props: GoogleOneTapLoginProps) {
  if (!isGoogleOAuthConfigured()) {
    return null;
  }

  return <GoogleOneTapLoginActive {...props} />;
}

function GoogleOneTapLoginActive({
  disabled = false,
  onError,
}: GoogleOneTapLoginProps) {
  const { user, loading, signInWithGoogleCredential } = useFirebaseAuth();

  useGoogleOneTapLogin({
    disabled: disabled || loading || Boolean(user),
    cancel_on_tap_outside: false,
    onSuccess: (credentialResponse) => {
      void (async () => {
        if (!credentialResponse.credential) {
          return;
        }

        try {
          await signInWithGoogleCredential(credentialResponse.credential);
        } catch (error) {
          const message = getFirebaseAuthErrorMessage(error);
          if (message) {
            onError?.(message);
          }
        }
      })();
    },
    onError: () => {
      onError?.("No se pudo mostrar el acceso rápido de Google.");
    },
  });

  return null;
}
