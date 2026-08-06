"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Check, LayoutGrid, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  defaultCatalogConfig,
  type CatalogConfig,
} from "@/lib/catalog-config";
import { slugifyProductId } from "@/lib/product-utils";
import { useFirebaseAuth } from "@/lib/firebase-auth";

function uniqueCatalogId(label: string, config: CatalogConfig): string {
  const base = slugifyProductId(label) || "catalogo";
  let candidate = base;
  let index = 2;

  while (config.catalogs.some((catalog) => catalog.id === candidate)) {
    candidate = `${base}-${index}`;
    index += 1;
  }

  return candidate;
}

export default function CatalogAdminPanel() {
  const { adminFetch } = useFirebaseAuth();
  const [config, setConfig] = useState<CatalogConfig>(defaultCatalogConfig);
  const [newLabel, setNewLabel] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void adminFetch("/api/admin/catalog-config")
      .then((response) => response.json())
      .then((data: CatalogConfig) => setConfig(data))
      .catch(() => setError("No se pudo cargar la configuración."))
      .finally(() => setLoading(false));
  }, [adminFetch]);

  async function saveConfig(nextConfig: CatalogConfig): Promise<boolean> {
    setSaving(true);
    setError("");

    try {
      const response = await adminFetch("/api/admin/catalog-config", {
        method: "PUT",
        body: JSON.stringify(nextConfig),
      });

      const data = (await response.json()) as CatalogConfig & { error?: string };

      if (!response.ok) {
        setError(data.error ?? "No se pudo guardar.");
        return false;
      }

      setConfig(data);
      return true;
    } catch {
      setError("Error de conexión al guardar.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    const label = newLabel.trim();

    if (!label) {
      setError("Ingrese un nombre para el catálogo.");
      return;
    }

    const id = uniqueCatalogId(label, config);
    const nextConfig: CatalogConfig = {
      ...config,
      catalogs: [...config.catalogs, { id, label }],
    };

    const saved = await saveConfig(nextConfig);
    if (saved) {
      setNewLabel("");
    }
  }

  async function handleSaveEdit(catalogId: string) {
    const label = editLabel.trim();

    if (!label) {
      setError("El nombre no puede estar vacío.");
      return;
    }

    const nextConfig: CatalogConfig = {
      ...config,
      catalogs: config.catalogs.map((catalog) =>
        catalog.id === catalogId ? { ...catalog, label } : catalog,
      ),
    };

    const saved = await saveConfig(nextConfig);
    if (saved) {
      setEditingId(null);
      setEditLabel("");
    }
  }

  async function handleDelete(catalogId: string) {
    const catalog = config.catalogs.find((item) => item.id === catalogId);
    if (!catalog) {
      return;
    }

    const confirmed = window.confirm(
      `¿Eliminar el catálogo "${catalog.label}"? También se quitarán sus categorías.`,
    );

    if (!confirmed) {
      return;
    }

    const nextConfig: CatalogConfig = {
      catalogs: config.catalogs.filter((item) => item.id !== catalogId),
      categories: config.categories.filter(
        (category) => category.catalogId !== catalogId,
      ),
    };

    await saveConfig(nextConfig);
  }

  const inputClass = "industrial-input mt-1.5 text-sm";
  const labelClass = "text-xs uppercase tracking-widest text-steel-dark";

  if (loading) {
    return <p className="text-sm text-steel-mid">Cargando catálogos…</p>;
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleCreate}
        className="rounded-xl border border-white/[0.06] bg-[var(--input-bg)] p-6"
      >
        <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-orange/15 text-orange">
            <LayoutGrid className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <h3 className="font-display text-base uppercase tracking-wide text-steel-light">
              Nuevo catálogo
            </h3>
            <p className="mt-0.5 text-xs text-steel-dark">
              Una línea de productos: café, frutos secos, cacao…
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-end gap-3">
          <div className="min-w-[14rem] flex-1">
            <label htmlFor="catalog-label" className={labelClass}>
              Nombre
            </label>
            <input
              id="catalog-label"
              value={newLabel}
              onChange={(event) => setNewLabel(event.target.value)}
              placeholder="Ej. Tostadores de cacao"
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-orange px-5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-orange-hover disabled:opacity-60"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Crear catálogo
          </button>
        </div>
        <p className="mt-2 text-xs text-steel-dark">
          El identificador se genera automáticamente desde el nombre.
        </p>
      </form>

      {config.catalogs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-steel-dark/30 bg-[var(--input-bg)] px-6 py-12 text-center">
          <p className="font-display text-lg text-steel-light">
            Aún no hay catálogos
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-steel-mid">
            Crea el primero arriba para empezar a organizar los productos por
            línea.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto border-t border-b border-white/[0.08]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/[0.08] bg-surface/80 text-xs font-semibold uppercase tracking-wider text-steel-mid">
              <tr>
                <th className="px-4 py-3.5 font-semibold">Nombre</th>
                <th className="px-4 py-3.5 font-semibold">Identificador</th>
                <th className="px-4 py-3.5 font-semibold">Categorías</th>
                <th className="px-4 py-3.5 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {config.catalogs.map((catalog) => {
                const categoryCount = config.categories.filter(
                  (category) => category.catalogId === catalog.id,
                ).length;

                return (
                  <tr
                    key={catalog.id}
                    className="border-b border-white/[0.04] last:border-b-0"
                  >
                    <td className="px-4 py-4">
                      {editingId === catalog.id ? (
                        <input
                          value={editLabel}
                          onChange={(event) => setEditLabel(event.target.value)}
                          className="industrial-input text-sm"
                        />
                      ) : (
                        <span className="font-display text-base text-steel-light">
                          {catalog.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-steel-mid">{catalog.id}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${
                          categoryCount > 0
                            ? "border-steel-dark/25 bg-background/40 text-steel-mid"
                            : "border-steel-dark/25 text-steel-dark"
                        }`}
                      >
                        {categoryCount === 0
                          ? "Sin categorías"
                          : `${categoryCount} categoría${categoryCount === 1 ? "" : "s"}`}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        {editingId === catalog.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => void handleSaveEdit(catalog.id)}
                              disabled={saving}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Guardar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(null);
                                setEditLabel("");
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-surface px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-steel-mid transition-colors hover:border-white/20 hover:text-steel-light"
                            >
                              <X className="h-3.5 w-3.5" />
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(catalog.id);
                                setEditLabel(catalog.label);
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-surface px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-orange transition-colors hover:border-orange/50 hover:bg-orange/10"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDelete(catalog.id)}
                              disabled={saving}
                              className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-surface px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-red-400 transition-colors hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-orange/40 bg-orange/10 px-4 py-3 text-sm text-orange">
          {error}
        </p>
      )}
    </div>
  );
}
