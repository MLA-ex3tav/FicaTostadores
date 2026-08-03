import SystemHealthPanel from "@/components/admin/SystemHealthPanel";
import { getSystemHealthReport } from "@/lib/system-health";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Estado del sistema | Fica Tostadores",
};

export default async function AdminConexionesPage() {
  const report = await getSystemHealthReport();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <p className="text-xs uppercase tracking-[0.3em] text-steel-dark">
        Infraestructura
      </p>
      <h1 className="mt-3 font-display text-3xl tracking-wide text-steel-light md:text-4xl">
        ESTADO DEL <span className="text-orange">SISTEMA</span>
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-steel-mid">
        Comprueba Firebase, Vercel, la app Electron de cotizaciones y las
        integraciones. Las sondas HTTP a páginas públicas pueden marcar
        advertencia si Vercel bloquea peticiones automáticas; eso no implica
        login obligatorio en el sitio.
      </p>

      <div className="mt-8">
        <SystemHealthPanel report={report} />
      </div>
    </div>
  );
}
