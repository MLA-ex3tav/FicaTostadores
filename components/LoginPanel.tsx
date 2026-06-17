"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import SteelPanel from "./SteelPanel";

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

interface LoginPanelProps {
  googleEnabled: boolean;
}

export default function LoginPanel({ googleEnabled }: LoginPanelProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <SteelPanel>
        <div className="h-32 animate-pulse rounded-lg bg-background/40" />
      </SteelPanel>
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
      <SteelPanel>
        <div className="flex flex-col items-center text-center">
          {session.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt=""
              className="h-16 w-16 rounded-full border border-steel-dark/40 object-cover"
            />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-steel-dark/40 bg-background/40 text-lg font-medium text-steel-light">
              {initials ?? "?"}
            </span>
          )}
          <p className="mt-4 font-display text-xl tracking-wide text-steel-light">
            {session.user.name}
          </p>
          {session.user.email && (
            <p className="mt-1 text-sm text-steel-mid">{session.user.email}</p>
          )}
          <p className="mt-4 text-sm text-steel-mid">Sesión iniciada correctamente.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-steel-mid/40 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-steel-light transition-colors hover:border-orange hover:text-orange"
            >
              Volver al inicio
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-orange-hover"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </SteelPanel>
    );
  }

  return (
    <SteelPanel>
      <p className="text-sm leading-relaxed text-steel-mid">
        Acceso para personal autorizado. Use su cuenta de Google para ingresar.
      </p>

      {!googleEnabled && (
        <p className="mt-4 rounded-lg border border-steel-dark/40 bg-background/40 px-4 py-3 text-sm text-steel-mid">
          El inicio de sesión con Google se habilitará cuando se configuren las
          credenciales en el servidor. El sitio público funciona con normalidad
          sin esto.
        </p>
      )}

      <button
        type="button"
        onClick={() => void signIn("google")}
        disabled={!googleEnabled}
        className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-steel-dark/40 bg-background/40 px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-steel-light transition-colors hover:border-orange hover:text-orange disabled:cursor-not-allowed disabled:opacity-40"
      >
        <GoogleIcon className="h-5 w-5" />
        Continuar con Google
      </button>
    </SteelPanel>
  );
}
