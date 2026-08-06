"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Cable,
  ExternalLink,
  LayoutGrid,
  LogOut,
  Package,
  Plus,
  Tag,
  Users,
} from "lucide-react";
import { useFirebaseAuth } from "@/lib/firebase-auth";
import { logoPath } from "@/lib/images";

const navItems = [
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/catalogos", label: "Catálogos", icon: LayoutGrid },
  { href: "/admin/categorias", label: "Categorías", icon: Tag },
  { href: "/admin/conexiones", label: "Conexiones", icon: Cable },
];

function navLinkClass(isActive: boolean) {
  return `inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm transition-colors ${
    isActive
      ? "bg-orange/15 text-orange ring-1 ring-inset ring-orange/30"
      : "text-steel-mid hover:bg-panel/60 hover:text-orange"
  }`;
}

export default function AdminHeader() {
  const pathname = usePathname();
  const { user, role, isSuperAdmin, signOut } = useFirebaseAuth();

  return (
    <header className="border-b border-white/[0.08] bg-[var(--input-bg)]">
      <div className="w-full px-4 py-4 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Image
              src={logoPath}
              alt="Fica Tostadores"
              width={200}
              height={56}
              className="h-8 w-auto sm:h-10"
              priority
            />
            <div>
              <h1 className="font-display text-xl uppercase tracking-wide text-steel-light">
                Panel de administración
              </h1>
              <p className="text-[11px] uppercase tracking-widest text-steel-dark">
                Fica Tostadores · Gestión de contenido
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            {user?.email ? (
              <span className="hidden items-center gap-2 sm:flex">
                <span className="text-steel-mid">{user.email}</span>
                {role === "editor" ? (
                  <span className="rounded-full border border-steel-dark/30 px-2 py-0.5 text-[11px] text-steel-mid">
                    editor
                  </span>
                ) : null}
              </span>
            ) : null}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-steel-mid transition-colors hover:text-orange"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              Ver sitio
            </Link>
            <button
              type="button"
              onClick={() =>
                void signOut().then(() => window.location.assign("/admin/login"))
              }
              className="inline-flex items-center gap-1.5 text-steel-mid transition-colors hover:text-orange"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Salir
            </button>
          </div>
        </div>

        <nav className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-white/[0.06] pt-3">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={navLinkClass(isActive)}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
          {isSuperAdmin ? (
            <Link
              href="/admin/usuarios"
              aria-current={pathname.startsWith("/admin/usuarios") ? "page" : undefined}
              className={navLinkClass(pathname.startsWith("/admin/usuarios"))}
            >
              <Users className="h-4 w-4" aria-hidden />
              Usuarios
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
