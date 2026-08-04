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
          className={`inline-flex items-center justify-center rounded-full p-0.5 align-middle ring-2 ring-steel-dark/40 shadow-md shadow-black/30 transition-all hover:ring-orange hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60 ${className}`}
        >
          <Avatar size="sm" className="size-9 shrink-0">
            <AvatarImage src={user.photoURL ?? undefined} alt={displayName} />
            <AvatarFallback className="bg-surface text-sm font-semibold text-orange">
              {getInitials(user.displayName, user.email)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 rounded-2xl border border-steel-dark/25 bg-panel/95 backdrop-blur-md p-2 text-steel-light shadow-2xl shadow-black/60 ring-1 ring-white/10"
      >
        <DropdownMenuLabel className="mb-1 rounded-xl border border-steel-dark/20 bg-surface/70 p-3 font-normal">
          <div className="flex items-center gap-3">
            <Avatar size="sm" className="size-10 shrink-0 ring-2 ring-orange/50 shadow-sm">
              <AvatarImage src={user.photoURL ?? undefined} alt={displayName} />
              <AvatarFallback className="bg-background text-xs font-bold text-orange">
                {getInitials(user.displayName, user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{displayName}</p>
              <p className="truncate text-xs font-medium text-steel-mid">{user.email}</p>
              {isStaff ? (
                <span className="mt-1 inline-flex items-center rounded-md border border-orange/40 bg-orange/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange">
                  Panel Admin
                </span>
              ) : null}
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-1.5 bg-steel-dark/20" />

        <DropdownMenuItem asChild className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-steel-mid transition-all duration-150 hover:bg-orange/15 hover:text-white focus:bg-orange/15 focus:text-white outline-none">
          <Link href="/perfil" onClick={onAction}>
            <User className="h-4 w-4 text-orange/80 transition-colors group-hover:text-orange group-focus:text-orange" aria-hidden />
            <span>Mi perfil</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-steel-mid transition-all duration-150 hover:bg-orange/15 hover:text-white focus:bg-orange/15 focus:text-white outline-none">
          <Link href="/perfil#cotizaciones" onClick={onAction}>
            <FileText className="h-4 w-4 text-orange/80 transition-colors group-hover:text-orange group-focus:text-orange" aria-hidden />
            <span>Mis cotizaciones</span>
          </Link>
        </DropdownMenuItem>

        {isStaff ? (
          <DropdownMenuItem asChild className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-steel-mid transition-all duration-150 hover:bg-orange/15 hover:text-white focus:bg-orange/15 focus:text-white outline-none">
            <Link href="/admin/productos" onClick={onAction}>
              <LayoutDashboard className="h-4 w-4 text-orange/80 transition-colors group-hover:text-orange group-focus:text-orange" aria-hidden />
              <span>Panel</span>
            </Link>
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuSeparator className="my-1.5 bg-steel-dark/20" />

        <DropdownMenuItem
          disabled={signingOut}
          className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/15 hover:text-red-300 focus:bg-red-500/15 focus:text-red-300 outline-none"
          onClick={() => void handleSignOut()}
        >
          {signingOut ? (
            <Loader2 className="h-4 w-4 animate-spin text-red-400" aria-hidden />
          ) : (
            <LogOut className="h-4 w-4 text-red-400 transition-colors group-hover:text-red-300 group-focus:text-red-300" aria-hidden />
          )}
          <span>{signingOut ? "Cerrando…" : "Cerrar sesión"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
