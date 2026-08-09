"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  LogOut,
  ShieldCheck,
  User,
} from "lucide-react";
import EmailPasswordForm, {
  type EmailAuthMode,
} from "@/components/EmailPasswordForm";
import GoogleOneTapLogin from "@/components/GoogleOneTapLogin";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { sectionEyebrowClass } from "@/components/SectionHeader";
import { useFirebaseAuth } from "@/lib/firebase-auth";
import { getFirebaseAuthErrorMessage } from "@/lib/firebase-auth-errors";
import {
  buildLoginHref,
  buildRegisterHref,
  sanitizeReturnTo,
} from "@/lib/login-return-to";
import { motionDuration, motionEase } from "@/lib/motion";
import { cn } from "@/lib/utils";

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
  /** Modo inicial del formulario correo/contraseña. */
  initialMode?: "login" | "signup";
  /** True cuando la tarjeta vive dentro de un AuthShell (sin borde/card propio). */
  embedded?: boolean;
}

export default function GoogleLoginCard({
  title = "Iniciar sesión",
  subtitle = "Ingrese con su cuenta de Google para continuar.",
  badge = "Acceso",
  adminRedirect = false,
  initialMode = "login",
  embedded = false,
}: GoogleLoginCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = sanitizeReturnTo(searchParams.get("returnTo"));
  const {
    user,
    role,
    isStaff,
    emailVerified,
    loading,
    configured,
    pendingAuthError,
    clearPendingAuthError,
    signOut,
    sendEmailVerification,
  } = useFirebaseAuth();
  const [emailMode, setEmailMode] = useState<EmailAuthMode>(initialMode);
  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const pendingPostLoginRedirectRef = useRef(false);

  useEffect(() => {
    setEmailMode(initialMode);
  }, [initialMode]);

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

  function handleEmailModeChange(next: EmailAuthMode) {
    setError("");

    // Recuperación de contraseña es un modo local (sin cambiar de ruta).
    if (next === "reset") {
      setEmailMode("reset");
      return;
    }

    if (emailMode === "reset" && next === "login") {
      setEmailMode("login");
      return;
    }

    // En páginas dedicadas, login ↔ registro navega a la ruta correspondiente.
    if (embedded && next === "signup") {
      router.push(buildRegisterHref(returnTo));
      return;
    }

    if (embedded && next === "login" && (initialMode === "signup" || emailMode === "signup")) {
      router.push(buildLoginHref(returnTo));
      return;
    }

    setEmailMode(next);
  }

  function handleEmailAuthSuccess() {
    handleSignInStart();
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

  async function handleResendVerification() {
    setError("");
    setResendingVerification(true);

    try {
      await sendEmailVerification();
      setError("Correo de verificación enviado. Revise su bandeja de entrada.");
    } catch (verificationError) {
      const message = getFirebaseAuthErrorMessage(verificationError);
      if (message) {
        setError(message);
      }
    } finally {
      setResendingVerification(false);
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
  const isSignup = emailMode === "signup";
  const isReset = emailMode === "reset";

  const heading = user
    ? "Sesión iniciada"
    : isReset
      ? "Recuperar contraseña"
      : title;
  const subheading = user
    ? "Su cuenta se encuentra conectada correctamente. Presione continuar para seguir navegando."
    : isReset
      ? "Ingrese su correo y le enviaremos un enlace para restablecer la contraseña."
      : subtitle;
  const badgeLabel = isReset ? "Recuperación" : badge;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: motionDuration.base, ease: motionEase }}
      className="mx-auto w-full max-w-md"
    >
      <div
        className={cn(
          "relative",
          embedded
            ? ""
            : "overflow-hidden rounded-3xl border border-steel-dark/20 bg-panel p-6 shadow-2xl shadow-black/40 md:p-8",
        )}
      >
        {!embedded && (
          <div
            className="pointer-events-none absolute -top-16 right-0 h-40 w-40 rounded-full bg-orange/10 blur-2xl"
            aria-hidden
          />
        )}
        <GoogleOneTapLogin
          disabled={!showGoogleButton || !configured}
          onError={(message) => setError(message)}
        />

        <div className="flex items-center justify-between">
          <p className={sectionEyebrowClass}>{badgeLabel}</p>
          {user ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange/40 bg-orange/10 px-2.5 py-0.5 text-xs font-semibold text-orange">
              <ShieldCheck className="h-3.5 w-3.5" /> Sesión Activa
            </span>
          ) : null}
        </div>

        <h1 className="mt-3 font-display text-3xl tracking-wide text-steel-light md:text-4xl">
          {heading}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-steel-mid md:text-base">
          {subheading}
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
                <Avatar
                  size="default"
                  className="size-11 shrink-0 shadow-md ring-2 ring-orange/50"
                >
                  <AvatarImage
                    src={user.photoURL ?? undefined}
                    alt={displayName}
                  />
                  <AvatarFallback className="bg-background text-sm font-bold text-orange">
                    {getInitials(user.displayName, user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">
                    {displayName}
                  </p>
                  <p className="truncate text-xs font-medium text-steel-mid">
                    {user.email}
                  </p>
                  {isStaff ? (
                    emailVerified ? (
                      <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Email verificado
                      </span>
                    ) : (
                      <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-steel-mid">
                        <User className="h-3 w-3" /> Verificación de correo
                        pendiente
                      </span>
                    )
                  ) : null}
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
            role="alert"
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
          <div className="mt-6 flex items-center justify-center gap-3 py-4 text-sm font-medium text-steel-mid">
            <Loader2 className="h-5 w-5 animate-spin text-orange" />
            Verificando credenciales…
          </div>
        )}

        <AnimatePresence mode="wait">
          {showGoogleButton && !loading && (
            <motion.div
              key="login-methods"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mt-6 rounded-2xl border border-steel-dark/20 bg-surface/50 p-5 shadow-inner">
                <EmailPasswordForm
                  mode={emailMode}
                  onModeChange={handleEmailModeChange}
                  onAuthSuccess={handleEmailAuthSuccess}
                />
              </div>

              {!isReset && (
                <>
                  <div className="mt-6 flex items-center gap-3">
                    <span className="h-px flex-1 bg-steel-dark/25" aria-hidden />
                    <span className="text-xs font-medium uppercase tracking-wider text-steel-dark">
                      o continúa con
                    </span>
                    <span className="h-px flex-1 bg-steel-dark/25" aria-hidden />
                  </div>

                  <div className="mt-4">
                    <GoogleSignInButton
                      disabled={!configured}
                      onLoadingChange={(nextLoading) => {
                        if (nextLoading) {
                          handleSignInStart();
                        }
                      }}
                      onError={handleSignInError}
                    />
                  </div>
                </>
              )}

              <p className="mt-5 text-center text-xs leading-relaxed text-steel-dark">
                Al continuar, acepta nuestros{" "}
                <Link
                  href="/terminos"
                  className="font-medium text-orange hover:underline"
                >
                  Términos y condiciones
                </Link>{" "}
                y la{" "}
                <Link
                  href="/privacidad"
                  className="font-medium text-orange hover:underline"
                >
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
              {(role === "editor" || role === "admin") && !emailVerified ? (
                <div className="flex flex-col gap-3 rounded-xl border border-orange/40 bg-orange/10 p-4">
                  <p className="text-sm font-medium text-orange">
                    Verifique su correo para habilitar el acceso al panel.
                    Revise su bandeja de entrada o reenvíe el enlace.
                  </p>
                  <button
                    type="button"
                    disabled={resendingVerification}
                    onClick={() => void handleResendVerification()}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-orange/40 bg-orange/15 px-5 text-sm font-semibold text-orange transition-all hover:bg-orange/25 disabled:opacity-60"
                  >
                    {resendingVerification ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Reenviar correo de verificación"
                    )}
                  </button>
                </div>
              ) : (adminRedirect ? isStaff : true) ? (
                <button
                  type="button"
                  onClick={handleContinue}
                  className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange px-5 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-orange/20 transition-all hover:-translate-y-0.5 hover:bg-orange-hover hover:shadow-orange/30 active:translate-y-0"
                >
                  <span>Continuar</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              ) : null}
              <button
                type="button"
                disabled={signingOut}
                onClick={() => void handleSignOut()}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-steel-dark/25 bg-background/60 px-5 text-sm font-semibold text-steel-mid transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
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

        {!user && !isReset && (
          <div className="mt-6 border-t border-steel-dark/15 pt-4 text-center">
            <Link
              href={
                isSignup
                  ? buildLoginHref(returnTo)
                  : buildRegisterHref(returnTo)
              }
              className="text-xs font-medium text-steel-dark transition-colors hover:text-orange"
            >
              {isSignup
                ? "← Volver a iniciar sesión"
                : "¿No tiene cuenta? Crear cuenta →"}
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
