import { CheckCircle2, Clock, FileText, XCircle } from "lucide-react";
import {
  cotizacionStatusToneClass,
  resolveCotizacionStatusDisplay,
} from "@/lib/cotizaciones/client-status";

interface CotizacionStatusBadgeProps {
  cotizacionEstado?: string | null;
  cotizacionEstadoLabel?: string | null;
  className?: string;
  enOT?: boolean;
}

export default function CotizacionStatusBadge({
  cotizacionEstado,
  cotizacionEstadoLabel,
  className = "",
  enOT = false,
}: CotizacionStatusBadgeProps) {
  const status = resolveCotizacionStatusDisplay(
    cotizacionEstado,
    cotizacionEstadoLabel,
  );

  const getStatusConfig = () => {
    switch (status.tone) {
      case "success":
        return {
          icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />,
          label: enOT ? "Aprobada (OT)" : status.label || "Aprobada",
          badgeStyle: "border-emerald-500/50 bg-emerald-500/15 text-emerald-300 shadow-lg shadow-emerald-500/10",
        };
      case "danger":
        return {
          icon: <XCircle className="h-3.5 w-3.5 text-red-400" />,
          label: status.label || "Rechazada",
          badgeStyle: "border-red-500/50 bg-red-500/15 text-red-300 shadow-lg shadow-red-500/10",
        };
      case "pending":
        return {
          icon: <Clock className="h-3.5 w-3.5 text-orange" />,
          label: status.label || "En revisión",
          badgeStyle: "border-orange/50 bg-orange/15 text-orange shadow-lg shadow-orange/10",
        };
      default:
        return {
          icon: <FileText className="h-3.5 w-3.5 text-steel-mid" />,
          label: status.label,
          badgeStyle: cotizacionStatusToneClass(status.tone),
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md transition-all ${config.badgeStyle} ${className}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
}
