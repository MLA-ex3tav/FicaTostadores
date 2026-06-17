"use client";

import { LogOut } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

interface AuthButtonProps {
  compact?: boolean;
  onAction?: () => void;
}

export default function AuthButton({ compact = false, onAction }: AuthButtonProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span
        className="inline-block h-9 w-24 animate-pulse rounded-lg bg-panel"
        aria-hidden="true"
      />
    );
  }

  if (session?.user) {
    const initials = session.user.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return (
      <div className="flex items-center gap-2">
        {session.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt=""
            className="h-8 w-8 rounded-full border border-steel-dark/40 object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-steel-dark/40 bg-panel text-xs font-medium text-steel-light">
            {initials ?? "?"}
          </span>
        )}
        {!compact && (
          <span className="hidden max-w-[120px] truncate text-sm text-steel-mid lg:inline">
            {session.user.name}
          </span>
        )}
        <button
          type="button"
          onClick={() => {
            void signOut();
            onAction?.();
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-steel-dark/40 px-3 py-2 text-xs uppercase tracking-wider text-steel-mid transition-colors hover:border-orange hover:text-orange"
          aria-label="Cerrar sesión"
        >
          <LogOut className="h-3.5 w-3.5" />
          {!compact && <span className="hidden sm:inline">Salir</span>}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        void signIn("google");
        onAction?.();
      }}
      className="inline-flex items-center gap-2 rounded-lg border border-steel-dark/40 px-3 py-2 text-xs uppercase tracking-wider text-steel-light transition-colors hover:border-orange hover:text-orange"
      aria-label="Iniciar sesión con Google"
    >
      <GoogleIcon className="h-4 w-4" />
      <span>Iniciar sesión</span>
    </button>
  );
}
