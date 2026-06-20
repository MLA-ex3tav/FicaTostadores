"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import { getClienteRole } from "@/lib/auth-sync-client";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";
import { buildLoginHref } from "@/lib/login-return-to";
import { isStaffRole } from "@/lib/permissions";

interface AuthNavButtonProps {
  className?: string;
  onAction?: () => void;
}

function getAccountLabel(user: User): string {
  const email = user.email ?? "";
  const localPart = email.split("@")[0]?.trim();

  if (!localPart) {
    return "Mi cuenta";
  }

  if (localPart.length > 16) {
    return `${localPart.slice(0, 14)}…`;
  }

  return localPart;
}

export default function AuthNavButton({
  className = "",
  onAction,
}: AuthNavButtonProps) {
  const pathname = usePathname();
  const loginHref = buildLoginHref(pathname);
  const [user, setUser] = useState<User | null>(null);
  const [isStaff, setIsStaff] = useState(false);
  const [ready, setReady] = useState(!isFirebaseConfigured());

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      return;
    }

    const auth = getFirebaseAuth();

    if (!auth) {
      setReady(true);
      return;
    }

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);

      if (!nextUser) {
        setIsStaff(false);
        setReady(true);
        return;
      }

      setReady(false);

      void getClienteRole(nextUser.uid)
        .then((role) => {
          setIsStaff(isStaffRole(role));
        })
        .finally(() => {
          setReady(true);
        });
    });
  }, []);

  const href = !user ? loginHref : isStaff ? "/admin/productos" : loginHref;
  const label = !user
    ? "Ingresar"
    : isStaff
      ? "Panel admin"
      : getAccountLabel(user);
  const title = user
    ? isStaff
      ? "Entrar al panel de administración"
      : user.email ?? undefined
    : undefined;

  return (
    <Link
      href={href}
      onClick={onAction}
      title={title}
      className={`text-base uppercase tracking-wider transition-colors ${
        user
          ? "text-steel-light hover:text-orange"
          : "text-steel-mid hover:text-orange"
      } ${className}`}
    >
      {ready ? label : "…"}
    </Link>
  );
}
