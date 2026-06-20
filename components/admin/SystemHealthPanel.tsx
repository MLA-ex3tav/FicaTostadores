import {
  HEALTH_CATEGORY_LABELS,
  type HealthCategory,
  type HealthCheck,
  type HealthStatus,
  type SystemHealthReport,
} from "@/lib/system-health";

interface SystemHealthPanelProps {
  report: SystemHealthReport;
}

const STATUS_LABELS: Record<HealthStatus, string> = {
  ok: "Operativo",
  warning: "Advertencia",
  error: "Error",
};

function statusBadgeClass(status: HealthStatus): string {
  switch (status) {
    case "ok":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case "warning":
      return "border-orange/30 bg-orange/10 text-orange";
    case "error":
      return "border-red-500/30 bg-red-500/10 text-red-300";
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

function groupChecksByCategory(
  checks: HealthCheck[],
): Map<HealthCategory, HealthCheck[]> {
  const groups = new Map<HealthCategory, HealthCheck[]>();

  for (const check of checks) {
    const existing = groups.get(check.category) ?? [];
    existing.push(check);
    groups.set(check.category, existing);
  }

  return groups;
}

function formatCheckedAt(iso: string): string {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default function SystemHealthPanel({ report }: SystemHealthPanelProps) {
  const grouped = groupChecksByCategory(report.checks);
  const categoryOrder: HealthCategory[] = [
    "firebase",
    "vercel",
    "integraciones",
    "paginas",
    "api",
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/[0.06] bg-[var(--input-bg)] px-4 py-4">
          <p className="text-xs uppercase tracking-widest text-steel-dark">
            Operativos
          </p>
          <p className="mt-2 font-display text-3xl text-emerald-300">
            {report.summary.ok}
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-[var(--input-bg)] px-4 py-4">
          <p className="text-xs uppercase tracking-widest text-steel-dark">
            Advertencias
          </p>
          <p className="mt-2 font-display text-3xl text-orange">
            {report.summary.warning}
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-[var(--input-bg)] px-4 py-4">
          <p className="text-xs uppercase tracking-widest text-steel-dark">
            Errores
          </p>
          <p className="mt-2 font-display text-3xl text-red-300">
            {report.summary.error}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-[var(--input-bg)] px-4 py-4 text-sm text-steel-mid">
        <p>
          Última verificación:{" "}
          <span className="text-steel-light">
            {formatCheckedAt(report.checkedAt)}
          </span>
        </p>
        <p className="mt-1">
          Entorno:{" "}
          <span className="text-steel-light">{report.environment}</span>
        </p>
        {report.deploymentUrl ? (
          <p className="mt-1">
            Base de comprobación:{" "}
            <span className="text-steel-light">{report.deploymentUrl}</span>
          </p>
        ) : null}
      </div>

      {categoryOrder.map((category) => {
        const checks = grouped.get(category);

        if (!checks?.length) {
          return null;
        }

        return (
          <section key={category}>
            <h2 className="font-display text-xl tracking-wide text-steel-light">
              {HEALTH_CATEGORY_LABELS[category]}
            </h2>
            <div className="mt-4 overflow-x-auto rounded-xl border border-white/[0.06] bg-[var(--input-bg)]">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/[0.06] text-xs uppercase tracking-widest text-steel-dark">
                  <tr>
                    <th className="px-4 py-3 font-medium">Servicio</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {checks.map((check) => (
                    <tr
                      key={check.id}
                      className="border-b border-white/[0.04] last:border-b-0 align-top"
                    >
                      <td className="px-4 py-4 text-steel-light">
                        {check.name}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${statusBadgeClass(check.status)}`}
                        >
                          {STATUS_LABELS[check.status]}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-steel-mid">
                        <p>{check.message}</p>
                        {check.details?.length ? (
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-steel-dark">
                            {check.details.map((detail) => (
                              <li key={detail}>{detail}</li>
                            ))}
                          </ul>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
