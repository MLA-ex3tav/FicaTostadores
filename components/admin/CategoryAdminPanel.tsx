"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
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
        <h3 className="font-display text-lg text-steel-light">Nueva categoría</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="category-catalog" className="text-xs uppercase tracking-widest text-steel-dark">
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
            <label htmlFor="category-label" className="text-xs uppercase tracking-widest text-steel-dark">
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
            <label htmlFor="category-description" className="text-xs uppercase tracking-widest text-steel-dark">
              Descripción (opcional)
            </label>
            <textarea
              id="category-description"
              rows={2}
              value={newDescription}
              onChange={(event) => setNewDescription(event.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-4 rounded-xl bg-orange px-5 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-orange-hover disabled:opacity-60"
        >
          Crear categoría
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-[var(--input-bg)]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/[0.06] text-xs uppercase tracking-widest text-steel-dark">
            <tr>
              <th className="px-4 py-3 font-medium">Catálogo</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Identificador</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {config.categories.map((category) => (
              <tr
                key={category.id}
                className="border-b border-white/[0.04] last:border-b-0"
              >
                <td className="px-4 py-4 text-steel-mid">
                  {getCatalogLabel(category.catalogId, config)}
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
                      <p className="text-steel-light">{category.label}</p>
                      {category.description && (
                        <p className="mt-1 text-xs text-steel-dark">
                          {category.description}
                        </p>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 text-steel-mid">{category.id}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-3">
                    {editingId === category.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => void handleSaveEdit(category.id)}
                          disabled={saving}
                          className="text-xs text-orange hover:text-orange-hover"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setEditLabel("");
                            setEditDescription("");
                          }}
                          className="text-xs text-steel-mid hover:text-orange"
                        >
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
                          className="text-xs text-orange hover:text-orange-hover"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(category.id)}
                          disabled={saving}
                          className="text-xs text-steel-mid hover:text-orange"
                        >
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

      {error && (
        <p className="rounded-lg border border-orange/40 bg-orange/10 px-4 py-3 text-sm text-orange">
          {error}
        </p>
      )}
    </div>
  );
}
