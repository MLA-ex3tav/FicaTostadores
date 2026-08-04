"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, LogOut, ShieldCheck, User } from "lucide-react";
import GoogleOneTapLogin from "@/components/GoogleOneTapLogin";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import SteelPanel from "@/components/SteelPanel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { sectionEyebrowClass } from "@/components/SectionHeader";
import { useFirebaseAuth } from "@/lib/firebase-auth";
import { getFirebaseAuthErrorMessage } from "@/lib/firebase-auth-errors";
import { sanitizeReturnTo } from "@/lib/login-return-to";
import { motionDuration, motionEase } from "@/lib/motion";

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

function getInitials(displayName: string | null, email: string | null): string {
  if (displayName?.trim()) {
    const parts = displayName.trim().split(/\s+/);

    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }

  return email?.[0]?.toUpperCase() ?? "?";
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
  const [signingOut, setSigningOut] = useState(false);
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
    setSigningOut(true);
    pendingPostLoginRedirectRef.current = false;
    clearPostLoginReturn();

    try {
      await signOut();
    } catch (signOutError) {
      const message = getFirebaseAuthErrorMessage(signOutError);
      if (message) {
        setError(message);
      }
    } finally {
      setSigningOut(false);
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
  const displayName = user?.displayName ?? "Cuenta conectada";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: motionDuration.base, ease: motionEase }}
      className="mx-auto w-full max-w-md"
    >
      <SteelPanel className="relative overflow-hidden border border-steel-dark/25 p-6 md:p-8 shadow-2xl shadow-black/50 heat-glow">
        <GoogleOneTapLogin
          disabled={!showGoogleButton || !configured}
          onError={(message) => setError(message)}
        />

        <div className="flex items-center justify-between">
          <p className={sectionEyebrowClass}>{badge}</p>
          {user ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange/40 bg-orange/10 px-2.5 py-0.5 text-xs font-semibold text-orange">
              <ShieldCheck className="h-3.5 w-3.5" /> Sesión Activa
            </span>
          ) : null}
        </div>

        <h1 className="mt-3 font-display text-3xl md:text-4xl tracking-wide text-steel-light">
          {user ? "Sesión iniciada" : title}
        </h1>
        <p className="mt-2 text-sm md:text-base leading-relaxed text-steel-mid">
          {user
            ? "Su cuenta se encuentra conectada correctamente. Presione continuar para seguir navegando."
            : subtitle}
        </p>

        <AnimatePresence mode="wait">
          {user && !loading && (
            <motion.div
              key="user-badge"
              initial={{ opacity: 0, height: 0, y: 10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: motionDuration.fast, ease: motionEase }}
              className="mt-6 rounded-2xl border border-steel-dark/20 bg-surface/80 p-4 shadow-inner"
            >
              <div className="flex items-center gap-3.5">
                <Avatar size="default" className="size-11 shrink-0 ring-2 ring-orange/50 shadow-md">
                  <AvatarImage src={user.photoURL ?? undefined} alt={displayName} />
                  <AvatarFallback className="bg-background text-sm font-bold text-orange">
                    {getInitials(user.displayName, user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{displayName}</p>
                  <p className="truncate text-xs font-medium text-steel-mid">{user.email}</p>
                  <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> Verificado con Google
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border border-orange/40 bg-orange/10 px-4 py-3 text-sm font-medium text-orange"
          >
            {error}
          </motion.p>
        )}

        {!configured && (
          <p className="mt-4 rounded-xl border border-steel-dark/30 bg-background/60 px-4 py-3 text-sm text-steel-mid">
            Firebase no está configurado. Copie <code>.env.example</code> a{" "}
            <code>.env.local</code> y complete las variables{" "}
            <code>NEXT_PUBLIC_FIREBASE_*</code> y{" "}
            <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code>.
          </p>
        )}

        {loading && (
          <div className="mt-6 flex items-center justify-center gap-3 text-sm font-medium text-steel-mid py-4">
            <Loader2 className="h-5 w-5 animate-spin text-orange" />
            Verificando credenciales…
          </div>
        )}

        <AnimatePresence mode="wait">
          {showGoogleButton && !loading && (
            <motion.div
              key="google-actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GoogleSignInButton
                disabled={!configured}
                onLoadingChange={(nextLoading) => {
                  if (nextLoading) {
                    handleSignInStart();
                  }
                }}
                onError={handleSignInError}
              />
              <p className="mt-4 text-center text-xs leading-relaxed text-steel-dark">
                Al continuar, acepta nuestros{" "}
                <Link href="/terminos" className="text-orange hover:underline font-medium">
                  Términos y condiciones
                </Link>{" "}
                y la{" "}
                <Link href="/privacidad" className="text-orange hover:underline font-medium">
                  Política de privacidad
                </Link>
                .
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {showLoggedInActions && (
            <motion.div
              key="logged-in-actions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="mt-6 flex flex-col gap-3"
            >
              {(adminRedirect ? isStaff : true) && (
                <button
                  type="button"
                  onClick={handleContinue}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-orange px-5 py-3.5 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-orange/20 transition-all hover:bg-orange-hover hover:shadow-orange/30 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Continuar</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              )}
              <button
                type="button"
                disabled={signingOut}
                onClick={() => void handleSignOut()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-steel-dark/25 bg-background/60 px-5 py-3 text-sm font-semibold text-steel-mid transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
              >
                {signingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                ) : (
                  <LogOut className="h-4 w-4 text-red-400" />
                )}
                <span>{signingOut ? "Cerrando…" : "Cerrar sesión"}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 border-t border-steel-dark/15 pt-4 text-center">
          <Link href="/" className="text-xs font-medium text-steel-dark transition-colors hover:text-orange">
            ← Volver a la página principal
          </Link>
        </div>
      </SteelPanel>
    </motion.div>
  );
}
