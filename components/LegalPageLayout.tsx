import Link from "next/link";
import type { ReactNode } from "react";
import SectionHeader from "@/components/SectionHeader";

interface LegalPageLayoutProps {
  eyebrow: string;
  title: string;
  description: string;
  lastUpdated: string;
  children: ReactNode;
}

export default function LegalPageLayout({
  eyebrow,
  title,
  description,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
      <SectionHeader
        as="h1"
        eyebrow={eyebrow}
        title={<span className="text-orange">{title}</span>}
        description={description}
      />
      <p className="mt-2 text-sm text-steel-dark">
        Última actualización: {lastUpdated}
      </p>

      <div className="rivet-divider my-10">
        <span />
      </div>

      <article className="legal-prose space-y-8 text-base leading-relaxed text-steel-mid">
        {children}
      </article>

      <div className="mt-12 flex flex-wrap gap-4 border-t border-steel-dark/30 pt-8 text-base">
        <Link href="/privacidad" className="text-orange hover:underline">
          Política de privacidad
        </Link>
        <Link href="/terminos" className="text-orange hover:underline">
          Términos y condiciones
        </Link>
        <Link href="/contacto" className="text-steel-mid hover:text-orange">
          Contacto
        </Link>
      </div>
    </div>
  );
}

interface LegalSectionProps {
  title: string;
  children: ReactNode;
}

export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section>
      <h2 className="font-display text-2xl tracking-wide text-steel-light">
        {title}
      </h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
