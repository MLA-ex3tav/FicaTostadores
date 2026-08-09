import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import GoogleLoginCard from "@/components/GoogleLoginCard";

export const metadata = {
  title: "Crear cuenta | Fica Tostadores",
  description:
    "Cree su cuenta en Fica Tostadores para gestionar cotizaciones y solicitudes.",
};

export default function RegistroPage() {
  return (
    <AuthShell
      brandEyebrow="Registro Cliente"
      brandTitle={
        <>
          UNA CUENTA PARA <span className="text-orange">TODO</span>
        </>
      }
      brandDescription="Regístrese para guardar sus cotizaciones, acceder a catálogos y recibir asesoría técnica directamente desde la fábrica."
    >
      <Suspense
        fallback={
          <p className="text-center text-base text-steel-mid">Cargando…</p>
        }
      >
        <GoogleLoginCard
          badge="Crear cuenta"
          title="Crear cuenta"
          subtitle="Regístrese con su correo y contraseña o continúe con Google."
          initialMode="signup"
          embedded
        />
      </Suspense>
    </AuthShell>
  );
}
