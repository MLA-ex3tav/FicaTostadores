import {
  cotizacionStatusToneClass,
  resolveCotizacionStatusDisplay,
} from "@/lib/cotizaciones/client-status";

interface CotizacionStatusBadgeProps {
  cotizacionEstado?: string | null;
  cotizacionEstadoLabel?: string | null;
  className?: string;
}

export default function CotizacionStatusBadge({
  cotizacionEstado,
  cotizacionEstadoLabel,
  className = "",
}: CotizacionStatusBadgeProps) {
  const status = resolveCotizacionStatusDisplay(
    cotizacionEstado,
    cotizacionEstadoLabel,
  );

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${cotizacionStatusToneClass(status.tone)} ${className}`}
    >
      {status.label}
    </span>
  );
}
