"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SteelPanel from "@/components/SteelPanel";
import { sectionEyebrowClass } from "@/components/SectionHeader";
import { useFirebaseAuth } from "@/lib/firebase-auth";
import { getFirebaseAuthErrorMessage } from "@/lib/firebase-auth-errors";
import { sanitizeReturnTo } from "@/lib/login-return-to";

const POST_LOGIN_RETURN_KEY = "fica-post-login-return";

function readPostLoginReturn(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return sessionStorage.getItem(POST_LOGIN_RETURN_KEY);
}

function clearPostLoginReturn(): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(POST_LOGIN_RETURN_KEY);
}

function savePostLoginReturn(path: string): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(POST_LOGIN_RETURN_KEY, path);
}

interface GoogleLoginCardProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  adminRedirect?: boolean;
}

export default function GoogleLoginCard({
  title = "Iniciar sesión",
  subtitle = "Ingrese con su cuenta de Google para continuar.",
  badge = "Acceso",
  adminRedirect = false,
}: GoogleLoginCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = sanitizeReturnTo(searchParams.get("returnTo"));
  const {
    user,
    isStaff,
    loading,
    configured,
    pendingAuthError,
    clearPendingAuthError,
    signInWithGoogle,
    signOut,
  } = useFirebaseAuth();
  const [error, setError] = useState("");
  const [redirectingToGoogle, setRedirectingToGoogle] = useState(false);
  const signingInRef = useRef(false);
  const pendingPostLoginRedirectRef = useRef(false);

  useEffect(() => {
    if (pendingAuthError) {
      setError(pendingAuthError);
      clearPendingAuthError();
    }
  }, [pendingAuthError, clearPendingAuthError]);

  useEffect(() => {
    if (adminRedirect || loading || !user) {
      return;
    }

    if (!pendingPostLoginRedirectRef.current && !readPostLoginReturn()) {
      return;
    }

    pendingPostLoginRedirectRef.current = false;
    clearPostLoginReturn();
    setRedirectingToGoogle(false);
    router.replace(returnTo);
  }, [adminRedirect, loading, returnTo, router, user]);

  useEffect(() => {
    if (user) {
      setRedirectingToGoogle(false);
    }
  }, [user]);

  useEffect(() => {
    if (!adminRedirect || loading || !user || !isStaff) {
      return;
    }

    router.replace("/admin/productos");
  }, [adminRedirect, isStaff, loading, router, user]);

  async function handleSignIn() {
    if (signingInRef.current) {
      return;
    }

    setError("");
    setRedirectingToGoogle(false);
    signingInRef.current = true;

    try {
      savePostLoginReturn(returnTo);
      pendingPostLoginRedirectRef.current = true;
      setRedirectingToGoogle(true);
      await signInWithGoogle();
    } catch (signInError) {
      pendingPostLoginRedirectRef.current = false;
      clearPostLoginReturn();
      setRedirectingToGoogle(false);
      const message = getFirebaseAuthErrorMessage(signInError);
      if (message) {
        setError(message);
      }
    } finally {
      signingInRef.current = false;
    }
  }

  async function handleSignOut() {
    setError("");
    setRedirectingToGoogle(false);
    pendingPostLoginRedirectRef.current = false;
    clearPostLoginReturn();

    try {
      await signOut();
    } catch (signOutError) {
      const message = getFirebaseAuthErrorMessage(signOutError);
      if (message) {
        setError(message);
      }
    }
  }

  function handleContinue() {
    if (adminRedirect) {
      if (isStaff) {
        router.replace("/admin/productos");
      }
      return;
    }

    router.replace(returnTo);
  }

  const showGoogleButton = !user;
  const showLoggedInActions = Boolean(user) && !loading;

  return (
    <SteelPanel className="mx-auto w-full max-w-md">
      <p className={sectionEyebrowClass}>{badge}</p>
      <h1 className="mt-3 font-display text-4xl tracking-wide text-steel-light">
        {user ? "Sesión iniciada" : title}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-steel-mid">
        {user
          ? "Use Continuar para seguir navegando o cierre sesión para cambiar de cuenta."
          : subtitle}
      </p>

      {user && !loading && (
        <div className="mt-4 rounded-lg border border-steel-dark/30 bg-background/60 px-4 py-3 text-base text-steel-mid">
          Conectado como{" "}
          <strong className="text-steel-light">{user.email}</strong>.
          {adminRedirect && !isStaff && (
            <>
              {" "}
              Esta cuenta no tiene permisos para el panel de administración.
            </>
          )}
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg border border-orange/40 bg-orange/10 px-4 py-3 text-base text-orange">
          {error}
        </p>
      )}

      {!configured && (
        <p className="mt-4 rounded-lg border border-steel-dark/30 bg-background/60 px-4 py-3 text-base text-steel-mid">
          Firebase no está configurado. Copie <code>.env.example</code> a{" "}
          <code>.env.local</code> y complete las variables{" "}
          <code>NEXT_PUBLIC_FIREBASE_*</code>.
        </p>
      )}

      {loading && (
        <p className="mt-6 text-center text-base text-steel-mid">
          Verificando sesión…
        </p>
      )}

      {redirectingToGoogle && !user && (
        <p className="mt-6 text-center text-base text-steel-mid">
          Conectando con Google…
        </p>
      )}

      {showGoogleButton && !redirectingToGoogle && (
        <>
          <p className="mt-6 text-center text-sm leading-relaxed text-steel-dark">
            Al continuar, acepta nuestros{" "}
            <Link href="/terminos" className="text-orange hover:underline">
              Términos y condiciones
            </Link>{" "}
            y la{" "}
            <Link href="/privacidad" className="text-orange hover:underline">
              Política de privacidad
            </Link>
            .
          </p>
          <button
            type="button"
            onClick={() => void handleSignIn()}
            disabled={loading || !configured}
            className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl border border-steel-dark/30 bg-background/80 px-5 py-3.5 text-base font-semibold uppercase tracking-wider text-steel-light transition-colors hover:border-orange hover:text-orange disabled:opacity-60"
          >
            <GoogleIcon />
            Continuar con Google
          </button>
        </>
      )}

      {showLoggedInActions && (
        <div className="mt-6 flex flex-col gap-3">
          {(adminRedirect ? isStaff : true) && (
            <button
              type="button"
              onClick={handleContinue}
              className="flex w-full items-center justify-center rounded-xl border border-orange bg-orange/10 px-5 py-3.5 text-base font-semibold uppercase tracking-wider text-orange transition-colors hover:bg-orange hover:text-background"
            >
              {adminRedirect ? "Ir al panel" : "Continuar"}
            </button>
          )}
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="flex w-full items-center justify-center rounded-xl border border-steel-dark/30 bg-background/80 px-5 py-3.5 text-base font-semibold uppercase tracking-wider text-steel-light transition-colors hover:border-orange hover:text-orange"
          >
            Cerrar sesión
          </button>
        </div>
      )}

      <p className="mt-4 text-center text-sm text-steel-dark">
        <Link href="/" className="hover:text-orange">
          Volver al sitio
        </Link>
      </p>
    </SteelPanel>
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
