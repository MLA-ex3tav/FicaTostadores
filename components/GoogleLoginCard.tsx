"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import GoogleOneTapLogin from "@/components/GoogleOneTapLogin";
import GoogleSignInButton from "@/components/GoogleSignInButton";
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
    signOut,
  } = useFirebaseAuth();
  const [error, setError] = useState("");
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
    router.replace(returnTo);
  }, [adminRedirect, loading, returnTo, router, user]);

  useEffect(() => {
    if (!adminRedirect || loading || !user || isStaff) {
      return;
    }

    router.replace("/");
  }, [adminRedirect, isStaff, loading, router, user]);

  useEffect(() => {
    if (!adminRedirect || loading || !user || !isStaff) {
      return;
    }

    router.replace("/admin/productos");
  }, [adminRedirect, isStaff, loading, router, user]);

  function handleSignInStart() {
    setError("");
    savePostLoginReturn(returnTo);
    pendingPostLoginRedirectRef.current = true;
  }

  function handleSignInError(message: string) {
    pendingPostLoginRedirectRef.current = false;
    clearPostLoginReturn();
    setError(message);
  }

  async function handleSignOut() {
    setError("");
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
  const showLoggedInActions =
    Boolean(user) && !loading && !(adminRedirect && !isStaff);

  return (
    <SteelPanel className="mx-auto w-full max-w-md">
      <GoogleOneTapLogin
        disabled={!showGoogleButton || !configured}
        onError={(message) => setError(message)}
      />

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
          <code>NEXT_PUBLIC_FIREBASE_*</code> y{" "}
          <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code>.
        </p>
      )}

      {loading && (
        <p className="mt-6 text-center text-base text-steel-mid">
          Verificando sesión…
        </p>
      )}

      {showGoogleButton && !loading && (
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
          <GoogleSignInButton
            disabled={!configured}
            onLoadingChange={(nextLoading) => {
              if (nextLoading) {
                handleSignInStart();
              }
            }}
            onError={handleSignInError}
          />
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
              Continuar
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
