"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Menu, X } from "lucide-react";
import { useState } from "react";
import { logoPath } from "@/lib/images";
import { useQuoteSelection } from "@/lib/quote-selection";
import AuthNavButton from "@/components/AuthNavButton";

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
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-orange px-4 py-2.5 text-base font-semibold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-orange-hover hover:shadow-lg hover:shadow-orange/25 hover:-translate-y-px active:translate-y-px ${className}`}
    >
      <Mail className="h-4 w-4" />
      Cotizar
      {count > 0 && (
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-sm font-bold text-orange">
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
              <li key={link.href} className="flex items-center">
                <Link
                  href={link.href}
                  className={`group relative text-base uppercase tracking-wider transition-colors ${
                    isActive
                      ? "text-orange"
                      : "text-steel-mid hover:text-steel-light"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-0.5 w-full origin-left bg-orange transition-transform duration-300 ${
                      isActive
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
          <li className="flex items-center">
            <AuthNavButton />
          </li>
          <li className="flex items-center">
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
                    className={`flex items-center gap-2 border-l-2 py-3 pl-3 text-base uppercase tracking-wider transition-colors ${
                      isActive
                        ? "border-orange text-orange"
                        : "border-transparent text-steel-mid hover:text-steel-light"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            <li className="py-3">
              <AuthNavButton className="block" onAction={() => setMenuOpen(false)} />
            </li>
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
