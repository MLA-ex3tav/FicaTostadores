"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { useRef, useState } from "react";
import { useFirebaseAuth } from "@/lib/firebase-auth";
import { getFirebaseAuthErrorMessage } from "@/lib/firebase-auth-errors";

interface AuthNavButtonProps {
  className?: string;
  onAction?: () => void;
}

export default function AuthNavButton({
  className = "",
  onAction,
}: AuthNavButtonProps) {
  const { user, isStaff, loading, configured, signInWithGoogle, signOut } =
    useFirebaseAuth();
  const signingInRef = useRef(false);
  const [authError, setAuthError] = useState("");

  async function handleSignIn() {
    if (signingInRef.current) {
      return;
    }

    setAuthError("");
    signingInRef.current = true;

    try {
      await signInWithGoogle();
      onAction?.();
    } catch (error) {
      const message = getFirebaseAuthErrorMessage(error);
      if (message) {
        setAuthError(message);
      }
    } finally {
      signingInRef.current = false;
    }
  }

  async function handleSignOut() {
    await signOut();
    onAction?.();
  }

  if (!configured) {
    return null;
  }

  if (loading) {
    return (
      <span className={`text-sm uppercase tracking-wider text-steel-dark ${className}`}>
        …
      </span>
    );
  }

  if (!user) {
    return (
      <div className={className}>
        <button
          type="button"
          onClick={() => void handleSignIn()}
          className="text-sm uppercase tracking-wider text-steel-mid transition-colors hover:text-orange"
        >
          Ingresar
        </button>
        {authError && (
          <p className="mt-2 max-w-xs text-xs leading-relaxed text-orange">
            {authError}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {isStaff && (
        <Link
          href="/admin/productos"
          className="text-sm uppercase tracking-wider text-orange transition-colors hover:text-orange-hover"
          onClick={onAction}
        >
          Admin
        </Link>
      )}
      <button
        type="button"
        onClick={() => void handleSignOut()}
        className="inline-flex items-center gap-1.5 text-sm uppercase tracking-wider text-steel-mid transition-colors hover:text-orange"
      >
        <LogOut className="h-4 w-4" />
        Salir
      </button>
    </div>
  );
}
