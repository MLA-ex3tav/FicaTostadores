import {
  Activity,
  BarChart3,
  CheckCircle2,
  ExternalLink,
  Globe,
  ShieldCheck,
} from "lucide-react";
import SteelPanel from "@/components/SteelPanel";

export const metadata = {
  title: "Analíticas | Panel de Administración Fica",
  description: "Acceso al panel de estadísticas y analíticas de tráfico de Umami.",
};

const WEBSITE_ID = "528c6666-8872-4f91-9bdb-04e8cd7bfc24";
const UMAMI_SHARE_URL = "https://cloud.umami.is/share/FoMlybFWvh2dTQQt";

export default function AnaliticasAdminPage() {
  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="border-b border-white/[0.08] pb-6">
          <div className="flex items-center gap-2 text-orange">
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Métricas & Tráfico
            </span>
          </div>
          <h1 className="mt-1 font-display text-3xl tracking-wide text-steel-light">
            Analíticas del Sitio Web
          </h1>
          <p className="mt-1 text-sm text-steel-mid">
            Monitoreo de visitas, comportamiento de usuarios e interacción en tiempo real mediante Umami.
          </p>
        </div>

        {/* Card Principal de Lanzamiento Único */}
        <SteelPanel className="relative overflow-hidden border border-steel-dark/25 p-8 md:p-10 heat-glow shadow-2xl">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="flex size-16 items-center justify-center rounded-2xl border border-orange/30 bg-orange/15 text-orange shadow-lg">
              <Activity className="h-8 w-8 animate-pulse" />
            </div>

            <div className="space-y-2 max-w-xl">
              <h2 className="font-display text-2xl font-bold tracking-wide text-white md:text-3xl">
                Dashboard de Analytics en Vivo
              </h2>
              <p className="text-sm text-steel-mid leading-relaxed">
                Haz clic en el botón a continuación para acceder al panel interactivo completo con gráficos de visitas, países, dispositivos y eventos en tiempo real.
              </p>
            </div>

            {/* UNICO BOTON PARA ABRIR UMAMI */}
            <a
              href={UMAMI_SHARE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-13 items-center gap-3 rounded-xl bg-orange px-8 text-sm font-bold uppercase tracking-wider text-white shadow-xl shadow-orange/25 transition-all hover:bg-orange-hover hover:shadow-orange/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              <BarChart3 className="h-5 w-5" />
              Abrir Dashboard de Umami Analytics
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </SteelPanel>

        {/* Resumen de Estado */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <SteelPanel className="flex items-start gap-4 border border-steel-dark/25 p-6 heat-glow">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-steel-mid">
                Script
              </p>
              <h3 className="mt-1 text-base font-bold text-white">Activo</h3>
              <p className="mt-0.5 text-[11px] text-steel-dark font-mono truncate">cloud.umami.is/script.js</p>
            </div>
          </SteelPanel>

          <SteelPanel className="flex items-start gap-4 border border-steel-dark/25 p-6 heat-glow">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-orange/30 bg-orange/15 text-orange">
              <Globe className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-steel-mid">
                ID de Sitio
              </p>
              <h3 className="mt-1 text-xs font-bold text-white font-mono truncate">
                {WEBSITE_ID}
              </h3>
              <p className="mt-0.5 text-[11px] text-steel-dark">Registrado</p>
            </div>
          </SteelPanel>

          <SteelPanel className="flex items-start gap-4 border border-steel-dark/25 p-6 heat-glow">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-steel-mid">
                Privacidad
              </p>
              <h3 className="mt-1 text-base font-bold text-white">GDPR Compliant</h3>
              <p className="mt-0.5 text-[11px] text-steel-dark">Sin Cookies</p>
            </div>
          </SteelPanel>
        </div>
      </div>
    </main>
  );
}
