"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, Loader2, LogOut, User } from "lucide-react";
import { googleLogout } from "@react-oauth/google";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFirebaseAuth } from "@/lib/firebase-auth";
import { getFirebaseAuthErrorMessage } from "@/lib/firebase-auth-errors";
import { buildLoginHref } from "@/lib/login-return-to";
import { isGoogleOAuthConfigured } from "@/lib/google-oauth-config";

interface AuthNavButtonProps {
  className?: string;
  onAction?: () => void;
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

export default function AuthNavButton({
  className = "",
  onAction,
}: AuthNavButtonProps) {
  const pathname = usePathname();
  const loginHref = buildLoginHref(pathname);
  const { user, isStaff, loading, configured, signOut } = useFirebaseAuth();
  const [signingOut, setSigningOut] = useState(false);

  if (!configured) {
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

  if (!user) {
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

  async function handleSignOut() {
    if (signingOut) {
      return;
    }

    setSigningOut(true);

    try {
      if (isGoogleOAuthConfigured()) {
        try {
          googleLogout();
        } catch {
          // Ignorar si GIS no está montado (p. ej. sin provider).
        }
      }

      await signOut();
      onAction?.();
    } catch (signOutError) {
      console.error(getFirebaseAuthErrorMessage(signOutError));
    } finally {
      setSigningOut(false);
    }
  }

  const displayName = user.displayName ?? "Mi cuenta";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title={user.email ?? displayName}
          disabled={signingOut || loading}
          className={`inline-flex items-center justify-center rounded-full p-0 align-middle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60 ${className}`}
        >
          <Avatar size="sm" className="size-9 shrink-0 ring-1 ring-steel-dark/30">
            <AvatarImage src={user.photoURL ?? undefined} alt={displayName} />
            <AvatarFallback className="bg-panel text-sm font-medium text-steel-light">
              {getInitials(user.displayName, user.email)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-48 border-steel-dark/30 bg-panel text-steel-light"
      >
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm text-steel-light">{displayName}</p>
          <p className="truncate text-xs text-steel-mid">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-steel-dark/20" />
        <DropdownMenuItem asChild className="cursor-pointer text-steel-mid focus:bg-background/80 focus:text-orange">
          <Link href="/perfil" onClick={onAction}>
            <User aria-hidden />
            Mi perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer text-steel-mid focus:bg-background/80 focus:text-orange">
          <Link href="/perfil#cotizaciones" onClick={onAction}>
            <FileText aria-hidden />
            Mis cotizaciones
          </Link>
        </DropdownMenuItem>
        {isStaff ? (
          <DropdownMenuItem asChild className="cursor-pointer text-steel-mid focus:bg-background/80 focus:text-orange">
            <Link href="/admin/productos" onClick={onAction}>
              <LayoutDashboard aria-hidden />
              Panel
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator className="bg-steel-dark/20" />
        <DropdownMenuItem
          variant="destructive"
          disabled={signingOut}
          className="cursor-pointer"
          onClick={() => void handleSignOut()}
        >
          {signingOut ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            <LogOut aria-hidden />
          )}
          {signingOut ? "Cerrando…" : "Cerrar sesión"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
