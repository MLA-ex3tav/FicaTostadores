"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { logoPath } from "@/lib/images";
import { useQuoteSelection } from "@/lib/quote-selection";
import AuthNavButton from "@/components/AuthNavButton";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Productos" },
  { href: "/servicio-tecnico", label: "Soporte Técnico" },
];

function CotizarButton({
  onClick,
  className = "",
}: {
  onClick?: () => void;
  className?: string;
}) {
  const { products, openDrawer } = useQuoteSelection();
  const count = products.length;

  const handleClick = (e: React.MouseEvent) => {
    // Open drawer on click
    e.preventDefault();
    if (onClick) onClick();
    openDrawer();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Ver cotización (${count} equipos)`}
      className={`relative inline-flex items-center justify-center rounded-lg border border-steel-dark/30 p-2 text-steel-mid transition-colors hover:border-orange/60 hover:text-orange active:scale-[0.97] ${className}`}
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 ? (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange px-1 text-xs font-bold text-white shadow-sm">
          {count}
        </span>
      ) : null}
    </button>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-steel-dark/20 bg-background/85 backdrop-blur-md">
      <nav className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center justify-self-start"
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src={logoPath}
            alt="Fica Tostadores"
            width={200}
            height={56}
            className="h-8 w-auto md:h-9"
            priority
          />
        </Link>

        <ul className="hidden items-center justify-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <li key={link.href} className="flex items-center">
                <Link
                  href={link.href}
                  className={`relative text-base font-semibold uppercase tracking-wider transition-colors ${
                    isActive
                      ? "text-orange"
                      : "text-steel-mid hover:text-steel-light"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-self-end gap-3">
          <AuthNavButton />
          <CotizarButton />
        </div>

        <button
          type="button"
          className="absolute right-4 text-steel-light md:hidden"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-steel-dark/20 bg-panel/95 backdrop-blur-md md:hidden">
          <ul className="flex flex-col px-4 py-2">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center gap-2 py-3 text-base font-semibold uppercase tracking-wider transition-colors ${
                      isActive
                        ? "text-orange"
                        : "text-steel-mid hover:text-steel-light"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            <li className="flex items-center justify-between gap-4 py-3">
              <span className="text-sm font-medium text-steel-mid">Mi cotización</span>
              <CotizarButton onClick={() => setMenuOpen(false)} />
            </li>
            <li className="pb-3">
              <AuthNavButton className="block w-full justify-center" onAction={() => setMenuOpen(false)} />
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
