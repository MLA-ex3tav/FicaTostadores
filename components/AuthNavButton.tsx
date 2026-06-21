"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { buildLoginHref } from "@/lib/login-return-to";
import { getFirebaseAuthErrorMessage } from "@/lib/firebase-auth-errors";

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
  const accountHref = buildLoginHref(pathname);
  const [authUser, setAuthUser] = useState<AuthNavUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
                setMenuOpen(false);
              }
              return;
            }

            const role = await getClienteRole(nextUser.uid);

            if (!cancelled) {
              setAuthUser({
                email: nextUser.email,
                label: getAccountLabel(nextUser.email),
                isStaff: isStaffRole(role),
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

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  async function handleSignOut() {
    if (signingOut) {
      return;
    }

    setSigningOut(true);
    setMenuOpen(false);

    try {
      const [{ signOut }, { getFirebaseAuth }] = await Promise.all([
        import("firebase/auth"),
        import("@/lib/firebase/client"),
      ]);

      const auth = getFirebaseAuth();

      if (auth) {
        await signOut(auth);
      }

      onAction?.();
    } catch (signOutError) {
      console.error(getFirebaseAuthErrorMessage(signOutError));
    } finally {
      setSigningOut(false);
    }
  }

  if (!authUser) {
    return (
      <Link
        href={loginHref}
        onClick={onAction}
        className={`text-base uppercase tracking-wider transition-colors text-steel-mid hover:text-orange ${className}`}
      >
        Ingresar
      </Link>
    );
  }

  const menuId = "auth-nav-menu";

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-expanded={menuOpen}
        aria-controls={menuId}
        aria-haspopup="menu"
        title={authUser.email ?? undefined}
        disabled={signingOut}
        onClick={() => setMenuOpen((open) => !open)}
        className="inline-flex items-center gap-1.5 text-base uppercase tracking-wider text-steel-light transition-colors hover:text-orange disabled:opacity-60"
      >
        {authUser.label}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${menuOpen ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {menuOpen ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 min-w-[11rem] overflow-hidden rounded-lg border border-steel-dark/30 bg-panel py-1 shadow-lg"
        >
          <Link
            href={accountHref}
            role="menuitem"
            onClick={() => {
              setMenuOpen(false);
              onAction?.();
            }}
            className="block px-4 py-2.5 text-sm uppercase tracking-wider text-steel-mid transition-colors hover:bg-background/80 hover:text-orange"
          >
            Cuenta
          </Link>
          {authUser.isStaff ? (
            <Link
              href="/admin/productos"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                onAction?.();
              }}
              className="block px-4 py-2.5 text-sm uppercase tracking-wider text-steel-mid transition-colors hover:bg-background/80 hover:text-orange"
            >
              Panel
            </Link>
          ) : null}
          <button
            type="button"
            role="menuitem"
            disabled={signingOut}
            onClick={() => void handleSignOut()}
            className="block w-full px-4 py-2.5 text-left text-sm uppercase tracking-wider text-steel-mid transition-colors hover:bg-background/80 hover:text-orange disabled:opacity-60"
          >
            {signingOut ? "Cerrando…" : "Cerrar sesión"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
