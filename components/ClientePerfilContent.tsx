"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CotizacionStatusBadge from "@/components/CotizacionStatusBadge";
import SteelPanel from "@/components/SteelPanel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ClientSolicitudCotizacion } from "@/lib/cotizaciones/types";
import { useFirebaseAuth } from "@/lib/firebase-auth";
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

  return (
    <article className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-steel-dark">
            Solicitud {solicitud.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="mt-1 text-sm text-steel-mid">
            {formatSolicitudDate(solicitud.createdAt)}
          </p>
        </div>
        <CotizacionStatusBadge
          cotizacionEstado={solicitud.cotizacionEstado}
          cotizacionEstadoLabel={solicitud.cotizacionEstadoLabel}
        />
      </div>

      <ul className="mt-5 space-y-3">
        {solicitud.products.map((product, index) => (
          <li
            key={`${solicitud.id}-${product.productId ?? product.name}-${index}`}
            className="rounded-lg border border-white/[0.06] bg-background/40 px-4 py-3"
          >
            <p className="font-display text-xl tracking-wide text-steel-light">
              {product.name}
            </p>
            <p className="mt-1 text-sm text-steel-dark">{product.capacity}</p>
            {product.selectedColor ? (
              <p className="mt-1 text-sm text-steel-mid">
                Color: {product.selectedColor}
              </p>
            ) : null}
            {product.selectedAddOns.length > 0 ? (
              <p className="mt-1 text-sm text-orange/80">
                + {product.selectedAddOns.map((addOn) => addOn.name).join(", ")}
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      {solicitud.message ? (
        <p className="mt-4 text-sm leading-relaxed text-steel-mid">
          <span className="text-steel-dark">Mensaje: </span>
          {solicitud.message}
        </p>
      ) : null}

      {productionHint ? (
        <p className="mt-4 text-sm text-steel-mid">
          <span className="text-steel-dark">Producción: </span>
          {productionHint}
        </p>
      ) : null}
    </article>
  );
}

export default function ClientePerfilContent() {
  const router = useRouter();
  const { user, loading, configured, adminFetch } = useFirebaseAuth();
  const [solicitudes, setSolicitudes] = useState<ClientSolicitudCotizacion[]>(
    [],
  );
  const [fetchState, setFetchState] = useState<
    "idle" | "loading" | "error" | "ready"
  >("idle");
  const [fetchError, setFetchError] = useState("");

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

  if (loading || !user) {
    return (
      <p className="text-center text-base text-steel-mid" role="status">
        Cargando perfil…
      </p>
    );
  }

  const displayName = user.displayName ?? "Mi cuenta";

  return (
    <section id="cotizaciones" className="scroll-mt-24">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.3em] text-steel-dark">
            Cotizaciones
          </p>
          <h2 className="mt-2 font-display text-3xl tracking-wide text-steel-light">
            Mis solicitudes
          </h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-steel-dark">
            <Avatar size="sm" className="size-7 ring-1 ring-steel-dark/30">
              <AvatarImage src={user.photoURL ?? undefined} alt={displayName} />
              <AvatarFallback className="bg-panel text-xs font-medium text-steel-light">
                {getInitials(user.displayName, user.email)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-steel-mid">{displayName}</span>
            {user.email ? (
              <>
                <span aria-hidden className="text-steel-dark/60">
                  ·
                </span>
                <span className="truncate">{user.email}</span>
              </>
            ) : null}
          </p>
        </div>
        <Link
          href="/contacto"
          className="rounded-xl border border-orange/40 px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-orange transition-colors hover:border-orange hover:bg-orange/10"
        >
          Nueva cotización
        </Link>
      </div>

        {fetchState === "loading" ? (
          <p className="text-base text-steel-mid" role="status">
            Cargando sus cotizaciones…
          </p>
        ) : null}

        {fetchState === "error" ? (
          <p className="rounded-lg border border-orange/40 bg-orange/10 px-4 py-3 text-sm text-orange">
            {fetchError}
          </p>
        ) : null}

        {fetchState === "ready" && solicitudes.length === 0 ? (
          <SteelPanel>
            <p className="text-base leading-relaxed text-steel-mid">
              Aún no tiene solicitudes de cotización asociadas a esta cuenta.
              Envíe una desde el formulario de contacto mientras esté conectado
              con Google.
            </p>
            <Link
              href="/contacto"
              className="mt-5 inline-flex rounded-xl bg-orange px-5 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-orange-hover"
            >
              Ir a cotizar
            </Link>
          </SteelPanel>
        ) : null}

        {fetchState === "ready" && solicitudes.length > 0 ? (
          <div className="space-y-4">
            {solicitudes.map((solicitud) => (
              <SolicitudCard key={solicitud.id} solicitud={solicitud} />
            ))}
          </div>
        ) : null}
    </section>
  );
}
