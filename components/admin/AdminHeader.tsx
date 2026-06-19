"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFirebaseAuth } from "@/lib/firebase-auth";

const navItems = [
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/catalogos", label: "Catálogos" },
  { href: "/admin/categorias", label: "Categorías" },
];

function navLinkClass(isActive: boolean) {
  return `text-sm transition-colors ${
    isActive ? "text-orange" : "text-steel-mid hover:text-orange"
  }`;
}

export default function AdminHeader() {
  const pathname = usePathname();
  const { user, role, isSuperAdmin, signOut } = useFirebaseAuth();

  return (
    <header className="border-b border-white/[0.06] bg-[var(--input-bg)]">
      <div className="mx-auto max-w-6xl px-4 py-4 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] text-steel-dark">Fica Tostadores</p>
            <h1 className="font-display text-xl tracking-wide text-steel-light">
              Panel de administración
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {user?.email && (
              <span className="text-steel-mid">
                {user.email}
                {role === "editor" ? (
                  <span className="ml-2 text-xs text-steel-dark">(editor)</span>
                ) : null}
              </span>
            )}
            <Link href="/" className="text-steel-mid hover:text-orange">
              Ver sitio
            </Link>
            <button
              type="button"
              onClick={() =>
                void signOut().then(() => window.location.assign("/admin/login"))
              }
              className="text-steel-mid hover:text-orange"
            >
              Salir
            </button>
          </div>
        </div>
        <nav className="mt-4 flex flex-wrap gap-4 border-t border-white/[0.06] pt-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={navLinkClass(pathname.startsWith(item.href))}
            >
              {item.label}
            </Link>
          ))}
          {isSuperAdmin ? (
            <Link
              href="/admin/usuarios"
              className={navLinkClass(pathname.startsWith("/admin/usuarios"))}
            >
              Usuarios
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
