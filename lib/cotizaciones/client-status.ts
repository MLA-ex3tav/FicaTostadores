export type CotizacionStatusTone = "pending" | "success" | "danger" | "neutral";

export interface CotizacionStatusDisplay {
  label: string;
  tone: CotizacionStatusTone;
}

function normalize(value: string | null | undefined): string {
  if (!value || typeof value !== "string") {
    return "";
  }
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");
}

export function resolveCotizacionStatusDisplay(
  cotizacionEstado: string | null | undefined,
  cotizacionEstadoLabel: string | null | undefined,
): CotizacionStatusDisplay {
  const normEstado = normalize(cotizacionEstado);
  const normLabel = normalize(cotizacionEstadoLabel);
  const combined = `${normEstado} ${normLabel}`;

  // 🔴 RECHAZADA / CANCELADA -> RED (danger)
  if (
    combined.includes("rechazad") ||
    combined.includes("cancelad") ||
    combined.includes("anulad")
  ) {
    return {
      label: cotizacionEstadoLabel?.trim() || "Rechazada",
      tone: "danger",
    };
  }

  // 🟢 APROBADA / OT / ENVIADA -> GREEN (success)
  if (
    combined.includes("aprob") ||
    combined.includes("ot") ||
    combined.includes("orden_de_trabajo") ||
    combined.includes("aceptad") ||
    combined.includes("enviad")
  ) {
    const isOT = combined.includes("ot") || combined.includes("orden");
    return {
      label:
        cotizacionEstadoLabel?.trim() ||
        (isOT ? "Aprobada (OT)" : "Aprobada"),
      tone: "success",
    };
  }

  // 🟧 EN REVISIÓN / PENDIENTE -> ORANGE (pending)
  if (
    combined.includes("revis") ||
    combined.includes("pendien") ||
    combined.includes("proceso") ||
    combined.includes("recibid") ||
    !normEstado
  ) {
    return {
      label: cotizacionEstadoLabel?.trim() || "En revisión",
      tone: "pending",
    };
  }

  return {
    label: cotizacionEstadoLabel?.trim() || cotizacionEstado?.trim() || "En revisión",
    tone: "pending",
  };
}

export function cotizacionStatusToneClass(tone: CotizacionStatusTone): string {
  switch (tone) {
    case "pending":
      return "border-orange/50 bg-orange/15 text-orange shadow-md shadow-orange/10";
    case "success":
      return "border-emerald-500/50 bg-emerald-500/15 text-emerald-300 shadow-md shadow-emerald-500/10";
    case "danger":
      return "border-red-500/50 bg-red-500/15 text-red-300 shadow-md shadow-red-500/10";
    case "neutral":
      return "border-steel-dark/40 bg-white/[0.04] text-steel-mid";
    default: {
      const _exhaustive: never = tone;
      return String(_exhaustive);
    }
  }
}
