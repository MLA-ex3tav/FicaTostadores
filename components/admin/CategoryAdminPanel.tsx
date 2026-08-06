"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Check, Pencil, Plus, Tag, Trash2, X } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";
import {
  defaultCatalogConfig,
  getCatalogLabel,
  type CatalogConfig,
} from "@/lib/catalog-config";
import { slugifyProductId } from "@/lib/product-utils";
import { useFirebaseAuth } from "@/lib/firebase-auth";

function uniqueCategoryId(label: string, config: CatalogConfig): string {
  const base = slugifyProductId(label) || "categoria";
  let candidate = base;
  let index = 2;

  while (config.categories.some((category) => category.id === candidate)) {
    candidate = `${base}-${index}`;
    index += 1;
  }

  return candidate;
}

export default function CategoryAdminPanel() {
  const { adminFetch } = useFirebaseAuth();
  const [config, setConfig] = useState<CatalogConfig>(defaultCatalogConfig);
  const [catalogId, setCatalogId] = useState("cafe");
  const [newLabel, setNewLabel] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void adminFetch("/api/admin/catalog-config")
      .then((response) => response.json())
      .then((data: CatalogConfig) => {
        setConfig(data);
        setCatalogId(data.catalogs[0]?.id ?? "cafe");
      })
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
      setError("Ingrese un nombre para la categoría.");
      return;
    }

    if (!catalogId) {
      setError("Seleccione un catálogo.");
      return;
    }

    const id = uniqueCategoryId(label, config);
    const nextConfig: CatalogConfig = {
      ...config,
      categories: [
        ...config.categories,
        {
          id,
          catalogId,
          label,
          description: newDescription.trim(),
        },
      ],
    };

    const saved = await saveConfig(nextConfig);
    if (saved) {
      setNewLabel("");
      setNewDescription("");
    }
  }

  async function handleSaveEdit(categoryId: string) {
    const label = editLabel.trim();

    if (!label) {
      setError("El nombre no puede estar vacío.");
      return;
    }

    const nextConfig: CatalogConfig = {
      ...config,
      categories: config.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              label,
              description: editDescription.trim(),
            }
          : category,
      ),
    };

    const saved = await saveConfig(nextConfig);
    if (saved) {
      setEditingId(null);
      setEditLabel("");
      setEditDescription("");
    }
  }

  async function handleDelete(categoryId: string) {
    const category = config.categories.find((item) => item.id === categoryId);
    if (!category) {
      return;
    }

    const confirmed = window.confirm(
      `¿Eliminar la categoría "${category.label}"?`,
    );

    if (!confirmed) {
      return;
    }

    const nextConfig: CatalogConfig = {
      ...config,
      categories: config.categories.filter((item) => item.id !== categoryId),
    };

    await saveConfig(nextConfig);
  }

  const inputClass = "industrial-input mt-1.5 text-sm";
  const labelClass = "text-xs uppercase tracking-widest text-steel-dark";

  const catalogOptions = useMemo(
    () =>
      config.catalogs.map((catalog) => ({
        value: catalog.id,
        label: catalog.label,
      })),
    [config.catalogs],
  );

  if (loading) {
    return <p className="text-sm text-steel-mid">Cargando categorías…</p>;
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleCreate}
        className="rounded-xl border border-white/[0.06] bg-[var(--input-bg)] p-6"
      >
        <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-orange/15 text-orange">
            <Tag className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <h3 className="font-display text-base uppercase tracking-wide text-steel-light">
              Nueva categoría
            </h3>
            <p className="mt-0.5 text-xs text-steel-dark">
              Tipo de equipo dentro de un catálogo (comercial, industrial…).
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="category-catalog" className={labelClass}>
              Catálogo
            </label>
            <CustomSelect
              id="category-catalog"
              value={catalogId}
              onChange={setCatalogId}
              options={catalogOptions}
              aria-label="Catálogo"
              className="mt-1.5"
            />
          </div>
          <div>
            <label htmlFor="category-label" className={labelClass}>
              Nombre
            </label>
            <input
              id="category-label"
              value={newLabel}
              onChange={(event) => setNewLabel(event.target.value)}
              placeholder="Ej. Tostadores comerciales"
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="category-description" className={labelClass}>
              Descripción (opcional)
            </label>
            <textarea
              id="category-description"
              rows={2}
              value={newDescription}
              onChange={(event) => setNewDescription(event.target.value)}
              placeholder="Qué tipo de equipos agrupa esta categoría."
              className={inputClass}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-5 inline-flex h-12 items-center gap-2 rounded-xl bg-orange px-5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-orange-hover disabled:opacity-60"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Crear categoría
        </button>
      </form>

      {config.categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-steel-dark/30 bg-[var(--input-bg)] px-6 py-12 text-center">
          <p className="font-display text-lg text-steel-light">
            Aún no hay categorías
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-steel-mid">
            Crea la primera arriba para poder agrupar y filtrar los productos
            del sitio.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto border-t border-b border-white/[0.08]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/[0.08] bg-surface/80 text-xs font-semibold uppercase tracking-wider text-steel-mid">
              <tr>
                <th className="px-4 py-3.5 font-semibold">Catálogo</th>
                <th className="px-4 py-3.5 font-semibold">Nombre</th>
                <th className="px-4 py-3.5 font-semibold">Identificador</th>
                <th className="px-4 py-3.5 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {config.categories.map((category) => (
                <tr
                  key={category.id}
                  className="border-b border-white/[0.04] last:border-b-0"
                >
                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-full border border-steel-dark/25 bg-background/40 px-2.5 py-1 text-xs text-steel-mid">
                      {getCatalogLabel(category.catalogId, config)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {editingId === category.id ? (
                      <div className="space-y-2">
                        <input
                          value={editLabel}
                          onChange={(event) => setEditLabel(event.target.value)}
                          className="industrial-input text-sm"
                        />
                        <textarea
                          value={editDescription}
                          onChange={(event) =>
                            setEditDescription(event.target.value)
                          }
                          rows={2}
                          className="industrial-input text-sm"
                          placeholder="Descripción"
                        />
                      </div>
                    ) : (
                      <div>
                        <p className="font-display text-base text-steel-light">
                          {category.label}
                        </p>
                        {category.description && (
                          <p className="mt-1 text-xs text-steel-dark">
                            {category.description}
                          </p>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-steel-mid">{category.id}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      {editingId === category.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => void handleSaveEdit(category.id)}
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
                              setEditDescription("");
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
                              setEditingId(category.id);
                              setEditLabel(category.label);
                              setEditDescription(category.description);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-surface px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-orange transition-colors hover:border-orange/50 hover:bg-orange/10"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(category.id)}
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
              ))}
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
