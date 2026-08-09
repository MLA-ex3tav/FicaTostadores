"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import { useCallback, useState, type FormEvent } from "react";
import { useFirebaseAuth } from "@/lib/firebase-auth";
import { getFirebaseAuthErrorMessage } from "@/lib/firebase-auth-errors";
import { motionDuration, motionEase } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type EmailAuthMode = "login" | "signup" | "reset";

interface EmailPasswordFormProps {
  mode?: EmailAuthMode;
  onModeChange?: (mode: EmailAuthMode) => void;
  /** Se invoca tras login o registro exitoso (para redirección post-auth). */
  onAuthSuccess?: (mode: "login" | "signup") => void;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-steel-dark">
      {children}
    </span>
  );
}

function RequirementItem({ met, label }: { met: boolean; label: string }) {
  return (
    <li
      className={cn(
        "flex items-center gap-1.5 transition-colors",
        met ? "text-emerald-400" : "text-steel-mid",
      )}
    >
      <CheckCircle2
        className={cn("h-3 w-3 shrink-0", met ? "text-emerald-400" : "text-steel-dark")}
        aria-hidden
      />
      {label}
    </li>
  );
}

export default function EmailPasswordForm({
  mode = "login",
  onModeChange,
  onAuthSuccess,
}: EmailPasswordFormProps) {
  const {
    signInWithEmail,
    signUpWithEmail,
    sendPasswordResetEmail,
  } = useFirebaseAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const switchMode = useCallback(
    (next: EmailAuthMode) => {
      setError("");
      setSuccess("");
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      onModeChange?.(next);
    },
    [onModeChange],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError("Ingrese su correo electrónico.");
      return;
    }

    if (mode === "login" || mode === "signup") {
      if (!password) {
        setError("Ingrese su contraseña.");
        return;
      }

      if (mode === "signup" && password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.");
        return;
      }

      if (mode === "signup" && password !== confirmPassword) {
        setError("Las contraseñas no coinciden.");
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === "login") {
        await signInWithEmail(normalizedEmail, password);
        onAuthSuccess?.("login");
      } else if (mode === "signup") {
        await signUpWithEmail(normalizedEmail, password);
        setSuccess("Cuenta creada. Le enviamos un correo de verificación.");
        onAuthSuccess?.("signup");
      } else {
        await sendPasswordResetEmail(normalizedEmail);
        setSuccess(
          "Si existe una cuenta con ese correo, le enviamos un enlace para restablecer su contraseña.",
        );
      }
    } catch (submitError) {
      const message = getFirebaseAuthErrorMessage(submitError, "email");
      setError(message || "No se pudo completar la operación.");
    } finally {
      setLoading(false);
    }
  }

  const isSignup = mode === "signup";
  const isReset = mode === "reset";
  const passwordLongEnough = password.length >= 6;
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const buttonLabel = isSignup
    ? "Crear cuenta"
    : isReset
      ? "Enviar enlace de recuperación"
      : "Iniciar sesión";

  return (
    <form onSubmit={handleSubmit} className="w-full" noValidate>
      <div className="flex flex-col gap-5">
        <label className="block">
          <FieldLabel>Correo electrónico</FieldLabel>
          <span className="relative block">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-dark"
              aria-hidden
            />
            <input
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nombre@empresa.cl"
              disabled={loading}
              className="industrial-input has-left-icon max-md:min-h-12 max-md:text-base"
            />
          </span>
        </label>

        {!isReset && (
          <label className="block">
            <FieldLabel>Contraseña</FieldLabel>
            <span className="relative block">
              <Lock
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-dark"
                aria-hidden
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete={isSignup ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={
                  isSignup ? "Mínimo 6 caracteres" : "Su contraseña"
                }
                disabled={loading}
                className="industrial-input with-icons max-md:min-h-12 max-md:text-base"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-steel-dark transition-colors hover:text-orange"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </span>
            {mode === "login" && (
              <button
                type="button"
                disabled={loading}
                onClick={() => switchMode("reset")}
                className="mt-1.5 ml-auto block text-xs font-medium text-steel-mid transition-colors hover:text-orange disabled:opacity-50"
              >
                ¿Olvidó su contraseña?
              </button>
            )}
          </label>
        )}

        {isSignup && (
          <label className="block">
            <FieldLabel>Confirmar contraseña</FieldLabel>
            <span className="relative block">
              <Lock
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-dark"
                aria-hidden
              />
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repita su contraseña"
                disabled={loading}
                className="industrial-input has-left-icon max-md:min-h-12 max-md:text-base"
              />
            </span>
          </label>
        )}

        {isSignup && (
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
            <RequirementItem
              met={passwordLongEnough}
              label="Mínimo 6 caracteres"
            />
            <RequirementItem
              met={passwordsMatch}
              label="La confirmación debe coincidir"
            />
          </ul>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange px-5 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-orange/20 transition-all hover:-translate-y-0.5 hover:bg-orange-hover hover:shadow-orange/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Procesando…
            </>
          ) : (
            buttonLabel
          )}
        </button>

        <p className="text-center text-xs text-steel-mid">
          {mode === "login" ? (
            <>
              ¿No tiene cuenta?{" "}
              <button
                type="button"
                disabled={loading}
                onClick={() => switchMode("signup")}
                className="font-semibold text-orange transition-colors hover:underline disabled:opacity-50"
              >
                Registrarse
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={() => switchMode("login")}
              className="font-semibold text-orange transition-colors hover:underline disabled:opacity-50"
            >
              Volver a iniciar sesión
            </button>
          )}
        </p>
      </div>

      <div aria-live="polite">
        <AnimatePresence>
          {error ? (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: motionDuration.fast, ease: motionEase }}
              className="mt-4 flex items-start gap-2 rounded-xl border border-orange/40 bg-orange/10 px-4 py-3 text-sm font-medium text-orange"
              role="alert"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {error}
            </motion.p>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {success ? (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: motionDuration.fast, ease: motionEase }}
              className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {success}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </form>
  );
}
