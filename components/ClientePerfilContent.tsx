"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { googleLogout } from "@react-oauth/google";
import {
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
  Loader2,
  LogOut,
  MessageSquare,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Wrench,
} from "lucide-react";
import CotizacionStatusBadge from "@/components/CotizacionStatusBadge";
import {
  resolveCotizacionStatusDisplay,
  type CotizacionStatusTone,
} from "@/lib/cotizaciones/client-status";
import SteelPanel from "@/components/SteelPanel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import type { ClientSolicitudCotizacion } from "@/lib/cotizaciones/types";
import { useFirebaseAuth } from "@/lib/firebase-auth";
import { getFirebaseAuthErrorMessage } from "@/lib/firebase-auth-errors";
import { isGoogleOAuthConfigured } from "@/lib/google-oauth-config";
import { buildLoginHref } from "@/lib/login-return-to";

function getInitials(displayName: string | null, email: string | null): string {
  if (displayName?.trim()) {
    const parts = displayName.trim().split(/\s+/);

    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }

  return email?.[0]?.toUpperCase() ?? "?";
}

function formatSolicitudDate(iso: string | null): string {
  if (!iso) {
    return "Fecha pendiente";
  }

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "Fecha pendiente";
  }

  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatProductionHint(solicitud: ClientSolicitudCotizacion): string | null {
  if (solicitud.produccionEtapaLabel) {
    return solicitud.produccionEtapaLabel;
  }

  if (solicitud.enEnsamblado) {
    return "En ensamblado";
  }

  if (solicitud.enOT) {
    return "En orden de trabajo";
  }

  if (solicitud.produccion === true) {
    return "En producción";
  }

  if (typeof solicitud.produccion === "string" && solicitud.produccion.trim()) {
    return solicitud.produccion.trim();
  }

  return null;
}

function SolicitudCard({ solicitud }: { solicitud: ClientSolicitudCotizacion }) {
  const productionHint = formatProductionHint(solicitud);
  const status = resolveCotizacionStatusDisplay(
    solicitud.cotizacionEstado,
    solicitud.cotizacionEstadoLabel,
  );

  // Gradient background glow from right edge to middle according to status tone
  const toneGlow: Record<
    CotizacionStatusTone,
    { gradient: string; cardBorder: string }
  > = {
    success: {
      gradient: "from-emerald-500/25 via-emerald-500/5 to-transparent",
      cardBorder: "border-emerald-500/25 hover:border-emerald-500/50",
    },
    danger: {
      gradient: "from-red-500/25 via-red-500/5 to-transparent",
      cardBorder: "border-red-500/25 hover:border-red-500/50",
    },
    pending: {
      gradient: "from-orange/25 via-orange/5 to-transparent",
      cardBorder: "border-orange/25 hover:border-orange/50",
    },
    neutral: {
      gradient: "from-steel-dark/20 via-steel-dark/5 to-transparent",
      cardBorder: "border-steel-dark/25 hover:border-steel-mid/40",
    },
  };

  const style = toneGlow[status.tone] ?? toneGlow.pending;

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border bg-surface/70 p-6 transition-all duration-300 ${style.cardBorder} hover:shadow-2xl hover:shadow-black/40`}
    >
      {/* Diffused Gradient Background from right edge reaching middle */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 right-0 w-3/4 sm:w-1/2 bg-gradient-to-l ${style.gradient} transition-opacity duration-300 group-hover:opacity-100`}
      />

      <div className="relative z-10">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-steel-dark/15 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-orange/30 bg-orange/10 px-2 py-0.5 font-mono text-xs font-bold text-orange">
                #{solicitud.id.slice(0, 8).toUpperCase()}
              </span>
              <span className="text-xs font-medium text-steel-dark">
                {formatSolicitudDate(solicitud.createdAt)}
              </span>
            </div>
            <p className="mt-1 text-xs text-steel-mid">
              {solicitud.products.length} {solicitud.products.length === 1 ? "equipo solicitado" : "equipos solicitados"}
            </p>
          </div>

          <CotizacionStatusBadge
            cotizacionEstado={solicitud.cotizacionEstado}
            cotizacionEstadoLabel={solicitud.cotizacionEstadoLabel}
            enOT={solicitud.enOT || Boolean(solicitud.produccion)}
          />
        </div>

        <ul className="mt-4 divide-y divide-white/[0.06] rounded-xl border border-white/[0.06] bg-background/40 p-3 sm:p-4">
          {solicitud.products.map((product, index) => (
            <li
              key={`${solicitud.id}-${product.productId ?? product.name}-${index}`}
              className="py-3 first:pt-1 last:pb-1"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-display text-lg tracking-wide text-steel-light">
                  {product.name}
                </p>
                {product.capacity ? (
                  <span className="rounded-md border border-white/[0.08] bg-surface px-2.5 py-0.5 text-xs font-semibold text-steel-mid">
                    {product.capacity}
                  </span>
                ) : null}
              </div>

              {product.selectedColor ? (
                <p className="mt-1 text-xs text-steel-mid">
                  <span className="font-medium text-steel-dark">Color preferido:</span> {product.selectedColor}
                </p>
              ) : null}

              {product.selectedAddOns.length > 0 ? (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {product.selectedAddOns.map((addOn) => (
                    <span
                      key={addOn.name}
                      className="rounded border border-orange/25 bg-orange/15 px-2 py-0.5 text-[11px] font-semibold text-orange"
                    >
                      + {addOn.name}
                    </span>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>

        {solicitud.message ? (
          <div className="mt-4 rounded-xl border border-steel-dark/10 bg-background/30 p-3 text-xs leading-relaxed text-steel-mid">
            <span className="font-semibold text-steel-dark">Mensaje adjunto: </span>
            {solicitud.message}
          </div>
        ) : null}

        {productionHint ? (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-orange/20 bg-orange/10 px-3 py-2 text-xs font-semibold text-orange">
            <Wrench className="h-3.5 w-3.5" />
            <span>Estado de taller: {productionHint}</span>
          </div>
        ) : null}

        <div className="mt-5 flex items-center justify-end border-t border-steel-dark/15 pt-4">
          <Link
            href={`/contacto?asunto=Consulta+Cotizacion+${solicitud.id.slice(0, 8).toUpperCase()}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-orange transition-colors hover:text-orange-hover"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Consultar por esta solicitud</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function ClientePerfilContent() {
  const router = useRouter();
  const { user, isStaff, loading, configured, adminFetch, signOut } = useFirebaseAuth();
  const [solicitudes, setSolicitudes] = useState<ClientSolicitudCotizacion[]>([]);
  const [fetchState, setFetchState] = useState<"idle" | "loading" | "error" | "ready">("idle");
  const [fetchError, setFetchError] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!configured || !user) {
      router.replace(buildLoginHref("/perfil"));
      return;
    }

    let cancelled = false;

    async function loadSolicitudes() {
      setFetchState("loading");
      setFetchError("");

      try {
        const response = await adminFetch("/api/cotizaciones/mis-solicitudes");
        const data = (await response.json()) as {
          solicitudes?: ClientSolicitudCotizacion[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "No se pudieron cargar las cotizaciones.");
        }

        if (!cancelled) {
          setSolicitudes(data.solicitudes ?? []);
          setFetchState("ready");
        }
      } catch (error) {
        if (!cancelled) {
          setFetchError(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar las cotizaciones.",
          );
          setFetchState("error");
        }
      }
    }

    void loadSolicitudes();

    return () => {
      cancelled = true;
    };
  }, [adminFetch, configured, loading, router, user]);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      if (isGoogleOAuthConfigured()) {
        try {
          googleLogout();
        } catch {
          // Ignorar si GIS no está disponible
        }
      }
      await signOut();
      router.replace("/");
    } catch (err) {
      console.error(getFirebaseAuthErrorMessage(err));
    } finally {
      setSigningOut(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-orange" />
        <p className="text-base font-medium text-steel-mid">Cargando su perfil…</p>
      </div>
    );
  }

  const displayName = user.displayName ?? "Mi cuenta";
  const totalSolicitudes = solicitudes.length;
  const enProceso = solicitudes.filter(
    (s) => s.enOT || s.enEnsamblado || s.produccion || s.cotizacionEstado === "en_revision",
  ).length;
  const respondidas = solicitudes.filter(
    (s) => s.cotizacionEstado === "enviada" || s.cotizacionEstado === "aprobada",
  ).length;

  return (
    <div className="space-y-10">
      {/* Tarjeta Perfil de Usuario */}
      <SteelPanel className="relative overflow-hidden border border-steel-dark/25 p-6 md:p-8 shadow-2xl heat-glow">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <Avatar size="lg" className="size-16 shrink-0 ring-4 ring-orange/40 shadow-xl md:size-20">
              <AvatarImage src={user.photoURL ?? undefined} alt={displayName} />
              <AvatarFallback className="bg-surface text-xl font-bold text-orange">
                {getInitials(user.displayName, user.email)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate font-display text-2xl font-bold tracking-wide text-white md:text-3xl">
                  {displayName}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verificado
                </span>
                {isStaff ? (
                  <span className="inline-flex items-center rounded-md border border-orange/40 bg-orange/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-orange">
                    Staff
                  </span>
                ) : null}
              </div>
              <p className="truncate text-sm text-steel-mid font-medium mt-0.5">{user.email}</p>
              <p className="mt-1 text-xs text-steel-dark">
                Panel de control de solicitudes y cotizaciones Fica Tostadores.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-steel-dark/15 pt-4 md:border-t-0 md:pt-0">
            <Link
              href="/contacto"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-orange px-4 text-xs font-semibold uppercase tracking-wider text-white shadow-md shadow-orange/20 transition-all hover:bg-orange-hover hover:shadow-orange/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="h-4 w-4" />
              Nueva cotización
            </Link>

            <Link
              href="/productos"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-steel-dark/30 bg-background/60 px-4 text-xs font-semibold uppercase tracking-wider text-steel-light transition-all hover:border-steel-mid hover:bg-surface"
            >
              <ShoppingBag className="h-4 w-4 text-orange" />
              Ver Catálogo
            </Link>

            <button
              type="button"
              disabled={signingOut}
              onClick={() => void handleSignOut()}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 text-xs font-semibold uppercase tracking-wider text-red-400 transition-all hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50"
              title="Cerrar sesión"
            >
              {signingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </SteelPanel>

      {/* Tarjetas resumen de métricas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-steel-dark/20 bg-panel/80 p-5 shadow-lg">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-orange/25 bg-orange/15 text-orange">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-white">{totalSolicitudes}</p>
            <p className="text-xs font-medium uppercase tracking-wider text-steel-mid">Total Solicitudes</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-steel-dark/20 bg-panel/80 p-5 shadow-lg">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/15 text-amber-400">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-white">{enProceso}</p>
            <p className="text-xs font-medium uppercase tracking-wider text-steel-mid">En Taller / Revisión</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-steel-dark/20 bg-panel/80 p-5 shadow-lg">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/15 text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-white">{respondidas}</p>
            <p className="text-xs font-medium uppercase tracking-wider text-steel-mid">Respondidas</p>
          </div>
        </div>
      </div>

      {/* Historial de Solicitudes */}
      <section id="cotizaciones" className="scroll-mt-24">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-steel-dark/15 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange">
              Historial
            </p>
            <h3 className="mt-1 font-display text-2xl tracking-wide text-steel-light">
              Mis Solicitudes de Cotización
            </h3>
          </div>
          {totalSolicitudes > 0 && (
            <span className="rounded-full border border-steel-dark/30 bg-surface px-3 py-1 text-xs font-medium text-steel-mid">
              {totalSolicitudes} {totalSolicitudes === 1 ? "registro" : "registros"}
            </span>
          )}
        </div>

        {fetchState === "loading" ? (
          <div className="flex flex-col items-center justify-center py-12 text-steel-mid">
            <Loader2 className="mb-2 h-6 w-6 animate-spin text-orange" />
            <p className="text-sm">Cargando sus solicitudes de cotización…</p>
          </div>
        ) : null}

        {fetchState === "error" ? (
          <div className="rounded-xl border border-orange/40 bg-orange/10 p-4 text-sm text-orange">
            {fetchError}
          </div>
        ) : null}

        {fetchState === "ready" && solicitudes.length === 0 ? (
          <SteelPanel className="heat-glow border border-steel-dark/25 p-8 text-center md:p-12">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl border border-orange/30 bg-orange/15 text-orange shadow-lg">
              <Package className="h-8 w-8" />
            </div>
            <h4 className="font-display text-xl tracking-wide text-white">
              No tienes solicitudes de cotización activas
            </h4>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-steel-mid">
              En Fica Tostadores fabricamos tostadores de café industriales a medida. Explora nuestro catálogo o comunícate con nuestro equipo para recibir un presupuesto personalizado.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 rounded-xl bg-orange px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-orange-hover"
              >
                <Plus className="h-4 w-4" /> Solicitar Cotización
              </Link>
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 rounded-xl border border-steel-dark/30 bg-surface px-5 py-3 text-xs font-semibold uppercase tracking-wider text-steel-light transition-all hover:border-orange hover:text-orange"
              >
                Ver Tostadores
              </Link>
            </div>
          </SteelPanel>
        ) : null}

        {fetchState === "ready" && solicitudes.length > 0 ? (
          <Stagger className="space-y-4">
            {solicitudes.map((solicitud) => (
              <StaggerItem key={solicitud.id}>
                <SolicitudCard solicitud={solicitud} />
              </StaggerItem>
            ))}
          </Stagger>
        ) : null}
      </section>

      {/* Accesos Rápidos y Ayuda */}
      <div className="grid grid-cols-1 gap-4 border-t border-steel-dark/15 pt-6 sm:grid-cols-3">
        <Link
          href="/servicio-tecnico"
          className="group rounded-2xl border border-steel-dark/20 bg-surface/40 p-5 transition-all hover:border-orange/40 hover:bg-surface/80"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-orange/10 text-orange transition-colors group-hover:bg-orange group-hover:text-white">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-display text-sm font-semibold text-white transition-colors group-hover:text-orange">
                Servicio Técnico
              </h4>
              <p className="text-xs text-steel-dark">Mantenimiento y repuestos</p>
            </div>
          </div>
        </Link>

        <Link
          href="/productos"
          className="group rounded-2xl border border-steel-dark/20 bg-surface/40 p-5 transition-all hover:border-orange/40 hover:bg-surface/80"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-orange/10 text-orange transition-colors group-hover:bg-orange group-hover:text-white">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-display text-sm font-semibold text-white transition-colors group-hover:text-orange">
                Catálogo Fica
              </h4>
              <p className="text-xs text-steel-dark">Tostadores e insumos</p>
            </div>
          </div>
        </Link>

        <Link
          href="/contacto"
          className="group rounded-2xl border border-steel-dark/20 bg-surface/40 p-5 transition-all hover:border-orange/40 hover:bg-surface/80"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-orange/10 text-orange transition-colors group-hover:bg-orange group-hover:text-white">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-display text-sm font-semibold text-white transition-colors group-hover:text-orange">
                Soporte & Asesoría
              </h4>
              <p className="text-xs text-steel-dark">Contacto directo</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

