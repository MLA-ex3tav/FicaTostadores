"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Menu, X } from "lucide-react";
import { useState } from "react";
import { logoPath } from "@/lib/images";
import { useQuoteSelection } from "@/lib/quote-selection";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Productos" },
];

function CotizarButton({
  onClick,
  className = "",
}: {
  onClick?: () => void;
  className?: string;
}) {
  const { products } = useQuoteSelection();
  const count = products.length;

  return (
    <Link
      href="/contacto"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-orange px-4 py-2 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-orange-hover ${className}`}
    >
      <Mail className="h-4 w-4" />
      Cotizar
      {count > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-orange">
          {count}
        </span>
      )}
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-steel-dark/30 bg-background/95 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <Link
          href="/"
          className="flex items-center"
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src={logoPath}
            alt="Fica Tostadores"
            width={200}
            height={56}
            className="h-10 w-auto md:h-12"
            priority
          />
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`text-sm uppercase tracking-wider transition-colors ${
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
          <li>
            <CotizarButton />
          </li>
        </ul>

        <button
          type="button"
          className="text-steel-light md:hidden"
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
        <div className="border-t border-steel-dark/30 bg-panel md:hidden">
          <ul className="flex flex-col px-4 py-4">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block py-3 text-sm uppercase tracking-wider ${
                      isActive ? "text-orange" : "text-steel-mid"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            <li className="pt-2">
              <CotizarButton
                className="w-full py-3"
                onClick={() => setMenuOpen(false)}
              />
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
