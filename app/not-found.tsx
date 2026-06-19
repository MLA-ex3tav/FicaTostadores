import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center px-4 py-24 text-center md:px-6">
      <p className="text-xs uppercase tracking-[0.3em] text-steel-dark">404</p>
      <h1 className="mt-4 font-display text-4xl tracking-wide text-steel-light md:text-5xl">
        PÁGINA NO <span className="text-orange">ENCONTRADA</span>
      </h1>
      <p className="mt-4 text-steel-mid">
        La ruta que busca no existe o fue movida.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-orange px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-orange-hover"
        >
          Ir al inicio
        </Link>
        <Link
          href="/productos"
          className="inline-flex items-center justify-center rounded-xl border border-steel-mid/40 px-8 py-3 text-sm font-semibold uppercase tracking-wider text-steel-light transition-colors hover:border-orange hover:text-orange"
        >
          Ver productos
        </Link>
      </div>
    </div>
  );
}
