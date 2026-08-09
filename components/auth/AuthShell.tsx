"use client";

import { ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { logoPath } from "@/lib/images";

interface AuthShellProps {
  /** Etiqueta pequeña del panel de marca. */
  brandEyebrow?: string;
  /** Título display del panel de marca. */
  brandTitle?: ReactNode;
  brandDescription?: string;
  children: ReactNode;
}

export default function AuthShell({
  brandEyebrow = "Fábrica Directa · Chile",
  brandTitle = "MAQUINARIA INDUSTRIAL",
  brandDescription = "Tostadores y molinos fabricados bajo estándares de ingeniería, con acero y precisión para su negocio cafetero.",
  children,
}: AuthShellProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-16 lg:py-20">
      <div className="overflow-hidden rounded-3xl border border-steel-dark/20 bg-panel shadow-2xl shadow-black/40 md:grid md:grid-cols-2">
        {/* Panel de marca */}
        <div className="relative hidden overflow-hidden border-b border-steel-dark/20 md:block md:border-b-0 md:border-r">
          <div className="steel-texture absolute inset-0" aria-hidden />
          <div className="heat-glow absolute inset-0" aria-hidden />
          <div
            className="pointer-events-none absolute -right-20 top-1/3 h-72 w-72 rounded-full bg-orange/20 blur-3xl"
            aria-hidden
          />

          <div className="relative z-10 flex h-full flex-col justify-between p-8 lg:p-10">
            <Link href="/" className="inline-flex w-fit" aria-label="Fica Tostadores">
              <Image
                src={logoPath}
                alt="Fica Tostadores"
                width={190}
                height={48}
                className="h-12 w-auto"
              />
            </Link>

            <div className="space-y-5">
              <p className="flex items-center gap-2.5 text-sm font-medium uppercase tracking-[0.3em] text-steel-mid">
                <span className="h-px w-7 shrink-0 bg-orange" aria-hidden />
                {brandEyebrow}
              </p>
              <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-wide text-steel-light xl:text-5xl">
                {brandTitle}
              </h2>
              <p className="max-w-md text-base leading-relaxed text-steel-mid">
                {brandDescription}
              </p>

              <ul className="space-y-3 pt-1 text-sm text-steel-mid">
                <li className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-orange" aria-hidden />
                  Garantía de 2 años en estructura y tambor
                </li>
                <li className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-orange" aria-hidden />
                  Repuestos 100% disponibles en Chile
                </li>
                <li className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-orange" aria-hidden />
                  Respaldo de ingeniería nacional
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Panel de formulario / contenido */}
        <div className="relative">
          <div
            className="pointer-events-none absolute -top-16 right-0 h-40 w-40 rounded-full bg-orange/10 blur-2xl"
            aria-hidden
          />
          <div className="relative z-10 flex min-h-full flex-col p-6 sm:p-8 lg:p-10">
            <Link
              href="/"
              className="mb-6 inline-flex w-fit md:hidden"
              aria-label="Fica Tostadores"
            >
              <Image
                src={logoPath}
                alt="Fica Tostadores"
                width={170}
                height={44}
                className="h-10 w-auto"
              />
            </Link>
            <div className="flex flex-1 flex-col justify-center">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
