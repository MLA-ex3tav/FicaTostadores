import SystemHealthPanel from "@/components/admin/SystemHealthPanel";
import { getSystemHealthReport } from "@/lib/system-health";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Estado del sistema | Fica Tostadores",
};

export default async function AdminConexionesPage() {
  const report = await getSystemHealthReport();

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-steel-dark">
            Infraestructura y Servicios
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-wide text-steel-light">
            Estado del Sistema
          </h1>
        </div>
      </div>

      <p className="mt-3 max-w-2xl text-sm text-steel-mid">
        Comprueba Firebase, Vercel, la app Electron de cotizaciones y las
        integraciones del sistema.
      </p>

      <div className="mt-8">
        <SystemHealthPanel report={report} />
      </div>
    </div>
  );
}
