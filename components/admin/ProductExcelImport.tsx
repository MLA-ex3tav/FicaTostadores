"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  Upload,
} from "lucide-react";
import {
  defaultCatalogConfig,
  getCatalogLabel,
  getCategoryLabel,
  type CatalogConfig,
} from "@/lib/catalog-config";
import { useFirebaseAuth } from "@/lib/firebase-auth";
import type { ExcelImportItem } from "@/lib/products/excel-import";

interface PreviewResponse {
  items?: ExcelImportItem[];
  total?: number;
  error?: string;
}

interface ImportResult {
  created: number;
  updated: number;
  total: number;
  errors: { id: string; name: string; message: string }[];
}

function formatPrice(value: number | null): string {
  if (value === null) {
    return "—";
  }

  return `$${new Intl.NumberFormat("es-CL", {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

export default function ProductExcelImport({
  catalogConfig = defaultCatalogConfig,
}: {
  catalogConfig?: CatalogConfig;
}) {
  const router = useRouter();
  const { adminFetch } = useFirebaseAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState("");
  const [items, setItems] = useState<ExcelImportItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);

  const newCount = items.filter((item) => !item.exists).length;
  const updateCount = items.filter((item) => item.exists).length;

  function reset() {
    setItems([]);
    setSelected(new Set());
    setResult(null);
    setError("");
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }

    setError("");
    setResult(null);
    setFileName(file.name);
    setLoading(true);

    const form = new FormData();
    form.append("file", file);

    try {
      const response = await adminFetch("/api/admin/products/import/preview", {
        method: "POST",
        body: form,
      });
      const data = (await response.json()) as PreviewResponse;

      if (!response.ok) {
        setError(data.error ?? "No se pudo leer el archivo.");
        setItems([]);
        setSelected(new Set());
        return;
      }

      setItems(data.items ?? []);
      setSelected(new Set((data.items ?? []).map((item) => item.id)));
    } catch {
      setError("Error de conexión al leer el archivo.");
    } finally {
      setLoading(false);
    }
  }

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(items.map((item) => item.id)) : new Set());
  }

  async function handleImport() {
    const chosen = items.filter((item) => selected.has(item.id));

    if (chosen.length === 0) {
      return;
    }

    setImporting(true);
    setError("");

    try {
      const response = await adminFetch("/api/admin/products/import", {
        method: "POST",
        body: JSON.stringify(
          chosen.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            capacity: item.capacity,
            group: item.group,
            serie: item.serie,
            technicalDetails: item.technicalDetails,
          })),
        ),
      });
      const data = (await response.json()) as ImportResult & { error?: string };

      if (!response.ok) {
        setError(data.error ?? "No se pudo importar.");
        return;
      }

      setResult(data);
    } catch {
      setError("Error de conexión al importar.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <section className="mt-12 border-t border-white/[0.08] pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-orange/15 text-orange">
            <FileSpreadsheet className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <h3 className="font-display text-base uppercase tracking-wide text-steel-light">
              Importar desde Excel
            </h3>
            <p className="mt-0.5 text-xs text-steel-dark">
              Listado de precios (hoja TABLA MAESTRA). Crea productos nuevos y
              actualiza el precio de los existentes (solo para las apps).
            </p>
          </div>
        </div>
        {items.length > 0 ? (
          <button
            type="button"
            onClick={reset}
            className="text-xs font-medium text-steel-mid transition-colors hover:text-orange"
          >
            Limpiar
          </button>
        ) : null}
      </div>

      {result ? (
        <div className="mt-5 space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
              <p className="text-xs uppercase tracking-widest text-emerald-300">
                Creados
              </p>
              <p className="mt-1 font-display text-2xl text-emerald-200">
                {result.created}
              </p>
            </div>
            <div className="rounded-xl border border-orange/40 bg-orange/10 px-4 py-3">
              <p className="text-xs uppercase tracking-widest text-orange">
                Precio actualizado
              </p>
              <p className="mt-1 font-display text-2xl text-orange">
                {result.updated}
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-background/40 px-4 py-3">
              <p className="text-xs uppercase tracking-widest text-steel-dark">
                Procesados
              </p>
              <p className="mt-1 font-display text-2xl text-steel-mid">
                {result.total}
              </p>
            </div>
          </div>

          {result.errors.length > 0 ? (
            <div className="rounded-lg border border-orange/40 bg-orange/10 px-4 py-3 text-sm text-orange">
              <p className="font-medium">Filas omitidas:</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5">
                {result.errors.map((entry) => (
                  <li key={entry.id}>
                    {entry.name} — {entry.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => {
              router.refresh();
              reset();
            }}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-orange px-5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-orange-hover"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Recargar lista
          </button>
        </div>
      ) : (
        <>
          <div className="mt-5">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-steel-dark/30 bg-background/30 px-6 py-8 text-center transition-colors hover:border-orange/50">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                className="sr-only"
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
              <Upload className="h-6 w-6 text-steel-dark" aria-hidden />
              <span className="text-sm text-steel-mid">
                {fileName ? (
                  <>
                    <span className="text-steel-light">{fileName}</span> —
                    haz clic para elegir otro
                  </>
                ) : (
                  <>
                    Haz clic para subir el{" "}
                    <span className="text-orange">Listado de precios.xlsx</span>
                  </>
                )}
              </span>
            </label>
          </div>

          {loading ? (
            <p className="mt-5 flex items-center gap-2 text-sm text-steel-mid">
              <Loader2 className="h-4 w-4 animate-spin text-orange" aria-hidden />
              Leyendo el archivo…
            </p>
          ) : null}

          {error ? (
            <p className="mt-5 rounded-lg border border-orange/40 bg-orange/10 px-4 py-3 text-sm text-orange">
              {error}
            </p>
          ) : null}

          {items.length > 0 && !loading ? (
            <>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-steel-mid">
                  {items.length} productos ·{" "}
                  <span className="text-emerald-300">{newCount} nuevos</span> ·{" "}
                  <span className="text-orange">
                    {updateCount} actualizarán precio
                  </span>
                </p>
                <label className="flex items-center gap-2 text-xs text-steel-mid">
                  <input
                    type="checkbox"
                    checked={selected.size === items.length && items.length > 0}
                    onChange={(event) => toggleAll(event.target.checked)}
                    className="accent-orange"
                  />
                  Seleccionar todos
                </label>
              </div>

              <div className="mt-3 overflow-x-auto rounded-lg border border-white/[0.06]">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-white/[0.06] text-xs uppercase tracking-widest text-steel-dark">
                    <tr>
                      <th className="w-10 px-3 py-2.5"></th>
                      <th className="px-3 py-2.5 font-medium">Código</th>
                      <th className="px-3 py-2.5 font-medium">Nombre</th>
                      <th className="px-3 py-2.5 font-medium">Serie</th>
                      <th className="px-3 py-2.5 font-medium">Precio CLP</th>
                      <th className="px-3 py-2.5 font-medium">Rendimiento</th>
                      <th className="px-3 py-2.5 font-medium">Catálogo</th>
                      <th className="px-3 py-2.5 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-white/[0.04] last:border-b-0"
                      >
                        <td className="px-3 py-2.5">
                          <input
                            type="checkbox"
                            checked={selected.has(item.id)}
                            onChange={() => toggle(item.id)}
                            className="accent-orange"
                            aria-label={`Incluir ${item.name}`}
                          />
                        </td>
                        <td className="px-3 py-2.5 font-mono text-xs text-steel-mid">
                          {item.code}
                        </td>
                        <td className="px-3 py-2.5 text-steel-light">
                          {item.name}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-steel-mid">
                          {item.serie}
                        </td>
                        <td className="px-3 py-2.5 text-steel-mid">
                          {formatPrice(item.price)}
                        </td>
                        <td className="px-3 py-2.5 text-steel-mid">
                          {item.capacity || "—"}
                          {item.sacos ? (
                            <span className="ml-1.5 text-steel-dark">
                              · {item.sacos}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-steel-mid">
                          {getCatalogLabel(item.catalog, catalogConfig)} ·{" "}
                          {getCategoryLabel(item.category, catalogConfig)}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="inline-flex items-center gap-1.5 text-xs">
                            {item.exists ? (
                              <span className="text-orange">
                                Actualiza precio
                              </span>
                            ) : (
                              <span className="text-emerald-300">Nuevo</span>
                            )}
                            {item.issues.map((issue) => (
                              <span
                                key={issue}
                                className="inline-flex items-center gap-0.5 text-steel-dark"
                                title={issue}
                              >
                                <AlertTriangle
                                  className="h-3 w-3"
                                  aria-hidden
                                />
                              </span>
                            ))}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => router.refresh()}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-steel-dark/25 bg-background/40 px-4 text-sm font-semibold uppercase tracking-wider text-steel-mid transition-colors hover:border-orange/50 hover:text-orange"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden />
                  Recargar
                </button>
                <button
                  type="button"
                  onClick={() => void handleImport()}
                  disabled={selected.size === 0 || importing}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-orange px-5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-orange-hover disabled:opacity-60"
                >
                  {importing ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" aria-hidden />
                  )}
                  {importing
                    ? "Importando…"
                    : `Importar ${selected.size} producto${
                        selected.size === 1 ? "" : "s"
                      }`}
                </button>
              </div>
            </>
          ) : null}
        </>
      )}
    </section>
  );
}
