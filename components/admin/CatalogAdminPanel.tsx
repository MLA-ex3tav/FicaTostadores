"use client";

import { useEffect, useState, type FormEvent } from "react";
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

  if (loading) {
    return <p className="text-sm text-steel-mid">Cargando catálogos…</p>;
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleCreate}
        className="rounded-xl border border-white/[0.06] bg-[var(--input-bg)] p-6"
      >
        <h3 className="font-display text-lg text-steel-light">Nuevo catálogo</h3>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-[14rem] flex-1">
            <label htmlFor="catalog-label" className="text-xs uppercase tracking-widest text-steel-dark">
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
            className="rounded-xl bg-orange px-5 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-orange-hover disabled:opacity-60"
          >
            Crear
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-[var(--input-bg)]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/[0.06] text-xs uppercase tracking-widest text-steel-dark">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Identificador</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {config.catalogs.map((catalog) => (
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
                    <span className="text-steel-light">{catalog.label}</span>
                  )}
                </td>
                <td className="px-4 py-4 text-steel-mid">{catalog.id}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-3">
                    {editingId === catalog.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => void handleSaveEdit(catalog.id)}
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
                            setEditingId(catalog.id);
                            setEditLabel(catalog.label);
                          }}
                          className="text-xs text-orange hover:text-orange-hover"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(catalog.id)}
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
