"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import SteelPanel from "@/components/SteelPanel";
import { useFirebaseAuth } from "@/lib/firebase-auth";
import { sanitizeReturnTo } from "@/lib/login-return-to";

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
  const { user, isAdmin, loading, configured, signInWithGoogle } =
    useFirebaseAuth();
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (loading || !user) {
      return;
    }

    if (adminRedirect) {
      if (isAdmin) {
        router.replace("/admin/productos");
      }
      return;
    }

    router.replace(returnTo);
  }, [user, isAdmin, loading, adminRedirect, returnTo, router]);

  async function handleSignIn() {
    setError("");
    setSigningIn(true);

    try {
      await signInWithGoogle();
    } catch (signInError) {
      setError(
        signInError instanceof Error
          ? signInError.message
          : "No se pudo iniciar sesión con Google.",
      );
    } finally {
      setSigningIn(false);
    }
  }

  return (
    <SteelPanel className="mx-auto w-full max-w-md">
      <p className="text-xs uppercase tracking-[0.3em] text-steel-dark">
        {badge}
      </p>
      <h1 className="mt-3 font-display text-3xl tracking-wide text-steel-light">
        {user ? "Sesión iniciada" : title}
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-steel-mid">{subtitle}</p>

      {user && !loading && adminRedirect && !isAdmin && (
        <div className="mt-4 rounded-lg border border-steel-dark/30 bg-background/60 px-4 py-3 text-sm text-steel-mid">
          Conectado como{" "}
          <strong className="text-steel-light">{user.email}</strong>.
          Esta cuenta no tiene permisos de administrador.
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg border border-orange/40 bg-orange/10 px-4 py-3 text-sm text-orange">
          {error}
        </p>
      )}

      {!configured && (
        <p className="mt-4 rounded-lg border border-steel-dark/30 bg-background/60 px-4 py-3 text-sm text-steel-mid">
          Firebase no está configurado. Copiá <code>.env.example</code> a{" "}
          <code>.env.local</code> y completá las variables{" "}
          <code>NEXT_PUBLIC_FIREBASE_*</code>.
        </p>
      )}

      {!user && (
        <button
          type="button"
          onClick={() => void handleSignIn()}
          disabled={signingIn || loading || !configured}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-steel-dark/30 bg-background/80 px-5 py-3.5 text-sm font-semibold uppercase tracking-wider text-steel-light transition-colors hover:border-orange hover:text-orange disabled:opacity-60"
        >
          <GoogleIcon />
          {signingIn ? "Conectando…" : "Continuar con Google"}
        </button>
      )}

      {user && loading && (
        <p className="mt-8 text-center text-sm text-steel-mid">
          Redirigiendo…
        </p>
      )}

      <p className="mt-4 text-center text-xs text-steel-dark">
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
