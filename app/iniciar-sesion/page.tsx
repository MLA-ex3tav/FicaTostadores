import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import GoogleLoginCard from "@/components/GoogleLoginCard";

export const metadata = {
  title: "Iniciar sesión | Fica Tostadores",
  description:
    "Inicie sesión en Fica Tostadores para gestionar sus cotizaciones.",
};

export default function IniciarSesionPage() {
  return (
    <AuthShell
      brandEyebrow="Acceso Cliente"
      brandTitle={
        <>
          BIENVENIDO DE <span className="text-orange">VUELTA</span>
        </>
      }
      brandDescription="Acceda a su cuenta Fica Tostadores para revisar cotizaciones, productos y centralizar sus solicitudes de asesoría."
    >
      <Suspense
        fallback={
          <p className="text-center text-base text-steel-mid">Cargando…</p>
        }
      >
        <GoogleLoginCard
          badge="Iniciar sesión"
          title="Iniciar sesión"
          subtitle="Ingrese con su correo y contraseña o continúe con Google."
          initialMode="login"
          embedded
        />
      </Suspense>
    </AuthShell>
  );
}
