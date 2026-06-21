import { Suspense } from "react";
import GoogleLoginCard from "@/components/GoogleLoginCard";
import SectionHeader from "@/components/SectionHeader";

export const metadata = {
  title: "Iniciar sesión | Fica Tostadores",
  description: "Inicie sesión con Google en Fica Tostadores.",
};

export default function IniciarSesionPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <div className="mb-10">
        <SectionHeader
          as="h1"
          align="center"
          eyebrow="Cuenta"
          title={
            <>
              INICIAR <span className="text-orange">SESIÓN</span>
            </>
          }
          description="Use su cuenta de Google. Los usuarios nuevos quedan como cliente; el panel de administración requiere rol editor o administrador."
        />
      </div>

      <Suspense fallback={<p className="text-center text-base text-steel-mid">Cargando…</p>}>
        <GoogleLoginCard />
      </Suspense>
    </div>
  );
}
