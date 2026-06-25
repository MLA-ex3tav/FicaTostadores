export type CotizacionEstadoKnown =
  | "en_revision"
  | "aprobado"
  | "rechazado";

export type CotizacionStatusTone = "pending" | "success" | "danger" | "neutral";

export interface CotizacionStatusDisplay {
  label: string;
  tone: CotizacionStatusTone;
}

function normalizeEstadoId(value: string | null | undefined): string | null {
  if (!value || typeof value !== "string") {
    return null;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");

  return normalized || null;
}

function isKnownEstado(value: string): value is CotizacionEstadoKnown {
  return value === "en_revision" || value === "aprobado" || value === "rechazado";
}

export function resolveCotizacionStatusDisplay(
  cotizacionEstado: string | null | undefined,
  cotizacionEstadoLabel: string | null | undefined,
): CotizacionStatusDisplay {
  const estadoId = normalizeEstadoId(cotizacionEstado);

  if (estadoId && isKnownEstado(estadoId)) {
    switch (estadoId) {
      case "en_revision":
        return {
          label: cotizacionEstadoLabel?.trim() || "En revisión",
          tone: "pending",
        };
      case "aprobado":
        return {
          label: cotizacionEstadoLabel?.trim() || "Aprobado",
          tone: "success",
        };
      case "rechazado":
        return {
          label: cotizacionEstadoLabel?.trim() || "Rechazado",
          tone: "danger",
        };
      default: {
        const _exhaustive: never = estadoId;
        return { label: String(_exhaustive), tone: "neutral" };
      }
    }
  }

  if (cotizacionEstadoLabel?.trim()) {
    return { label: cotizacionEstadoLabel.trim(), tone: "neutral" };
  }

  return { label: "En revisión", tone: "pending" };
}

export function cotizacionStatusToneClass(tone: CotizacionStatusTone): string {
  switch (tone) {
    case "pending":
      return "border-orange/40 bg-orange/10 text-orange";
    case "success":
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
    case "danger":
      return "border-red-500/40 bg-red-500/10 text-red-300";
    case "neutral":
      return "border-steel-dark/40 bg-white/[0.04] text-steel-mid";
    default: {
      const _exhaustive: never = tone;
      return String(_exhaustive);
    }
  }
}
