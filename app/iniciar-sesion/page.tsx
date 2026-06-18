import { Suspense } from "react";
import GoogleLoginCard from "@/components/GoogleLoginCard";

export const metadata = {
  title: "Iniciar sesión | Fica Tostadores",
  description: "Inicie sesión con Google en Fica Tostadores.",
};

export default function IniciarSesionPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <div className="mb-10 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-steel-dark">
          Cuenta
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-wide text-steel-light md:text-5xl">
          INICIAR <span className="text-orange">SESIÓN</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-steel-mid">
          Use su cuenta de Google para continuar.
        </p>
      </div>

      <Suspense fallback={<p className="text-center text-sm text-steel-mid">Cargando…</p>}>
        <GoogleLoginCard />
      </Suspense>
    </div>
  );
}
