"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { buildLoginHref } from "@/lib/login-return-to";

interface AuthNavButtonProps {
  className?: string;
  onAction?: () => void;
}

interface AuthNavUser {
  email: string | null;
  label: string;
  isStaff: boolean;
}

function getAccountLabel(email: string | null): string {
  const localPart = email?.split("@")[0]?.trim();

  if (!localPart) {
    return "Mi cuenta";
  }

  if (localPart.length > 16) {
    return `${localPart.slice(0, 14)}…`;
  }

  return localPart;
}

function isFirebaseConfiguredClient(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() &&
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim(),
  );
}

export default function AuthNavButton({
  className = "",
  onAction,
}: AuthNavButtonProps) {
  const pathname = usePathname();
  const loginHref = buildLoginHref(pathname);
  const [authUser, setAuthUser] = useState<AuthNavUser | null>(null);

  useEffect(() => {
    if (!isFirebaseConfiguredClient()) {
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    const startAuthListener = () => {
      void (async () => {
        const [{ onAuthStateChanged }, { getFirebaseAuth }, { getClienteRole }, { isStaffRole }] =
          await Promise.all([
            import("firebase/auth"),
            import("@/lib/firebase/client"),
            import("@/lib/auth-sync-client"),
            import("@/lib/permissions"),
          ]);

        if (cancelled) {
          return;
        }

        const auth = getFirebaseAuth();

        if (!auth) {
          return;
        }

        unsubscribe = onAuthStateChanged(auth, (nextUser) => {
          void (async () => {
            if (!nextUser) {
              if (!cancelled) {
                setAuthUser(null);
              }
              return;
            }

            const role = await getClienteRole(nextUser.uid);
            const staff = isStaffRole(role);

            if (!cancelled) {
              setAuthUser({
                email: nextUser.email,
                label: getAccountLabel(nextUser.email),
                isStaff: staff,
              });
            }
          })();
        });
      })();
    };

    let idleHandle = 0;
    let usedIdleCallback = false;

    if (typeof window.requestIdleCallback === "function") {
      usedIdleCallback = true;
      idleHandle = window.requestIdleCallback(startAuthListener, { timeout: 2500 });
    } else {
      idleHandle = window.setTimeout(startAuthListener, 1500);
    }

    return () => {
      cancelled = true;

      if (usedIdleCallback) {
        window.cancelIdleCallback(idleHandle);
      } else {
        window.clearTimeout(idleHandle);
      }

      unsubscribe?.();
    };
  }, []);

  const href = !authUser ? loginHref : authUser.isStaff ? "/admin/productos" : loginHref;
  const label = !authUser
    ? "Ingresar"
    : authUser.isStaff
      ? "Panel admin"
      : authUser.label;
  const title = authUser
    ? authUser.isStaff
      ? "Entrar al panel de administración"
      : authUser.email ?? undefined
    : undefined;

  return (
    <Link
      href={href}
      onClick={onAction}
      title={title}
      className={`text-base uppercase tracking-wider transition-colors ${
        authUser
          ? "text-steel-light hover:text-orange"
          : "text-steel-mid hover:text-orange"
      } ${className}`}
    >
      {label}
    </Link>
  );
}
