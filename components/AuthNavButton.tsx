"use client";

import Link from "next/link";

interface AuthNavButtonProps {
  className?: string;
  onAction?: () => void;
}

export default function AuthNavButton({
  className = "",
  onAction,
}: AuthNavButtonProps) {
  return (
    <Link
      href="/iniciar-sesion"
      onClick={onAction}
      className={`text-base uppercase tracking-wider text-steel-mid transition-colors hover:text-orange ${className}`}
    >
      Ingresar
    </Link>
  );
}
