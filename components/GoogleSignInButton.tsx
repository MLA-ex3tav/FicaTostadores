"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useFirebaseAuth } from "@/lib/firebase-auth";
import { getFirebaseAuthErrorMessage } from "@/lib/firebase-auth-errors";
import { isGoogleOAuthConfigured } from "@/lib/google-oauth-config";
import { motionDuration, motionEase } from "@/lib/motion";

interface GoogleSignInButtonProps {
  disabled?: boolean;
  onLoadingChange?: (loading: boolean) => void;
  onError?: (message: string) => void;
}

export default function GoogleSignInButton(props: GoogleSignInButtonProps) {
  if (isGoogleOAuthConfigured()) {
    return <GoogleSignInButtonWithOAuth {...props} />;
  }

  return <GoogleSignInButtonFallback {...props} />;
}

function GoogleSignInButtonWithOAuth({
  disabled = false,
  onLoadingChange,
  onError,
}: GoogleSignInButtonProps) {
  const { user, signInWithGoogleCredential } = useFirebaseAuth();
  const [loading, setLoading] = useState(false);

  const setLoadingState = useCallback(
    (next: boolean) => {
      setLoading(next);
      onLoadingChange?.(next);
    },
    [onLoadingChange],
  );

  useEffect(() => {
    if (user) {
      setLoadingState(false);
    }
  }, [setLoadingState, user]);

  async function handleCredential(credentialResponse: CredentialResponse) {
    if (!credentialResponse.credential) {
      setLoadingState(false);
      onError?.("No se recibió credencial de Google.");
      return;
    }

    setLoadingState(true);

    try {
      await signInWithGoogleCredential(credentialResponse.credential);
    } catch (error) {
      setLoadingState(false);
      const message = getFirebaseAuthErrorMessage(error);
      if (message) {
        onError?.(message);
      }
    }
  }

  const isDisabled = disabled || loading;

  return (
    <GoogleSignInButtonVisual loading={loading}>
      <div
        className={`absolute inset-0 overflow-hidden ${isDisabled ? "pointer-events-none" : "opacity-[0.011]"}`}
        aria-hidden
      >
        <GoogleLogin
          onSuccess={(credential) => void handleCredential(credential)}
          onError={() => {
            setLoadingState(false);
            onError?.("No se pudo iniciar sesión con Google.");
          }}
          click_listener={() => setLoadingState(true)}
          type="standard"
          theme="filled_black"
          size="large"
          text="continue_with"
          width={400}
        />
      </div>
    </GoogleSignInButtonVisual>
  );
}

function GoogleSignInButtonFallback({
  disabled = false,
  onLoadingChange,
  onError,
}: GoogleSignInButtonProps) {
  const { user, signInWithGoogle } = useFirebaseAuth();
  const [loading, setLoading] = useState(false);

  const setLoadingState = useCallback(
    (next: boolean) => {
      setLoading(next);
      onLoadingChange?.(next);
    },
    [onLoadingChange],
  );

  useEffect(() => {
    if (user) {
      setLoadingState(false);
    }
  }, [setLoadingState, user]);

  async function handleFallbackClick() {
    if (loading || disabled) {
      return;
    }

    setLoadingState(true);

    try {
      await signInWithGoogle();
    } catch (error) {
      setLoadingState(false);
      const message = getFirebaseAuthErrorMessage(error);
      if (message) {
        onError?.(message);
      }
    }
  }

  const isDisabled = disabled || loading;

  return (
    <GoogleSignInButtonVisual loading={loading}>
      <button
        type="button"
        className="absolute inset-0 rounded-xl disabled:cursor-not-allowed"
        disabled={isDisabled}
        aria-label="Continuar con Google"
        onClick={() => void handleFallbackClick()}
      />
    </GoogleSignInButtonVisual>
  );
}

function GoogleSignInButtonVisual({
  loading,
  children,
}: {
  loading: boolean;
  children: ReactNode;
}) {
  return (
    <div className="relative mt-4 w-full">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={loading ? "loading" : "idle"}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: motionDuration.fast, ease: motionEase }}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-steel-dark/30 bg-background/80 px-5 py-3.5 text-base font-semibold uppercase tracking-wider text-steel-light"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-orange" aria-hidden />
              <span>Conectando…</span>
            </>
          ) : (
            <>
              <GoogleIcon />
              <span>Continuar con Google</span>
            </>
          )}
        </motion.div>
      </AnimatePresence>
      {children}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
