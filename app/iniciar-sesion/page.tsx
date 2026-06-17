import LoginPanel from "@/components/LoginPanel";

export const metadata = {
  title: "Iniciar sesión | Fica Tostadores",
  description: "Acceso para personal autorizado de Fica Tostadores.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function IniciarSesionPage() {
  const googleEnabled = Boolean(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
  );

  return (
    <div className="mx-auto max-w-md px-4 py-16 md:px-6 md:py-24">
      <div className="mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-steel-dark">
          Acceso
        </p>
        <h1 className="mt-3 font-display text-3xl tracking-wide text-steel-light md:text-4xl">
          INICIAR <span className="text-orange">SESIÓN</span>
        </h1>
      </div>

      <LoginPanel googleEnabled={googleEnabled} />
    </div>
  );
}
