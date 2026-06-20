import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center px-4 py-24 text-center md:px-6">
      <SectionHeader
        as="h1"
        align="center"
        eyebrow="404"
        title={
          <>
            PÁGINA NO <span className="text-orange">ENCONTRADA</span>
          </>
        }
        description="La ruta que busca no existe o fue movida."
      />
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-orange px-8 py-3.5 text-base font-semibold uppercase tracking-wider text-white transition-colors hover:bg-orange-hover"
        >
          Ir al inicio
        </Link>
        <Link
          href="/productos"
          className="inline-flex items-center justify-center rounded-xl border border-steel-mid/40 px-8 py-3.5 text-base font-semibold uppercase tracking-wider text-steel-light transition-colors hover:border-orange hover:text-orange"
        >
          Ver productos
        </Link>
      </div>
    </div>
  );
}
