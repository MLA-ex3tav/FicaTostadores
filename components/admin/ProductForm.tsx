"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  AlignLeft,
  ClipboardList,
  FileText,
  Image as ImageIcon,
  ListChecks,
  Save,
  Send,
  Wrench,
} from "lucide-react";
import ProductImagesField from "@/components/admin/ProductImagesField";
import CustomSelect from "@/components/CustomSelect";
import {
  defaultCatalogConfig,
  getCatalogLabel,
  type CatalogConfig,
} from "@/lib/catalog-config";
import { getCategoryLabel } from "@/lib/product-categories";
import {
  formatCapacity,
  parseCapacity,
  type CapacityUnit,
} from "@/lib/capacity";
import type { Product, ProductAddOn } from "@/lib/products";
import { hasProductImageContent } from "@/lib/product-images";
import { slugifyProductId } from "@/lib/product-utils";
import { useFirebaseAuth } from "@/lib/firebase-auth";

interface ProductFormProps {
  initialProduct?: Product;
  mode: "create" | "edit";
  onSaved?: () => void;
  onCancel?: () => void;
  cancelLabel?: string;
}

function emptyAddOn(): ProductAddOn {
  return { id: "", name: "", description: "" };
}

function createEmptyProduct(): Product {
  return {
    id: "",
    catalog: "cafe",
    category: "cafe",
    name: "",
    capacity: "",
    description: "",
    longDescription: "",
    specs: [""],
    features: [""],
    technicalDetails: [{ label: "", value: "" }],
    addOns: [],
    images: [],
  };
}

function cleanLines(values: string[]): string[] {
  return values.map((value) => value.trim()).filter(Boolean);
}

function cleanAddOns(values: ProductAddOn[]): ProductAddOn[] {
  return values
    .map((addOn) => ({
      id: addOn.id.trim() || slugifyProductId(addOn.name),
      name: addOn.name.trim(),
      description: addOn.description.trim(),
    }))
    .filter((addOn) => addOn.name);
}

const SECTION_IDS = [
  "basico",
  "imagenes",
  "descripcion",
  "especificaciones",
  "ficha",
  "agregados",
] as const;

type SectionId = (typeof SECTION_IDS)[number];

const SECTIONS: { id: SectionId; label: string; icon: typeof FileText }[] = [
  { id: "basico", label: "Básico", icon: FileText },
  { id: "imagenes", label: "Imágenes", icon: ImageIcon },
  { id: "descripcion", label: "Descripción", icon: AlignLeft },
  { id: "especificaciones", label: "Especificaciones", icon: ListChecks },
  { id: "ficha", label: "Ficha técnica", icon: ClipboardList },
  { id: "agregados", label: "Agregados", icon: Wrench },
];

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function SectionCard({
  id,
  icon: Icon,
  title,
  helper,
  children,
}: {
  id: SectionId;
  icon: typeof FileText;
  title: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-xl border border-white/[0.06] bg-[var(--input-bg)] p-5 md:p-6"
    >
      <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-orange/15 text-orange">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-base uppercase tracking-wide text-steel-light">
            {title}
          </h2>
          {helper ? <p className="mt-0.5 text-xs text-steel-dark">{helper}</p> : null}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function ProductForm({
  initialProduct,
  mode,
  onSaved,
  onCancel,
  cancelLabel = "Cancelar",
}: ProductFormProps) {
  const router = useRouter();
  const { adminFetch } = useFirebaseAuth();

  const [catalogConfig, setCatalogConfig] =
    useState<CatalogConfig>(defaultCatalogConfig);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [product, setProduct] = useState<Product>(() => ({
    ...(initialProduct ?? createEmptyProduct()),
    images: initialProduct?.images ?? [],
  }));
  const [capacityValue, setCapacityValue] = useState(() =>
    parseCapacity(initialProduct?.capacity ?? "").value,
  );
  const [capacityUnit, setCapacityUnit] = useState<CapacityUnit>(() =>
    parseCapacity(initialProduct?.capacity ?? "").unit,
  );
  const [idTouched, setIdTouched] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("basico");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitIntent, setSubmitIntent] = useState<"save" | "save-new">("save");
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const savedNoticeTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (savedNoticeTimer.current !== null) {
        window.clearTimeout(savedNoticeTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      try {
        const response = await fetch("/api/catalog-config");
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as CatalogConfig;
        if (!cancelled) {
          setCatalogConfig(data);
        }
      } catch {
        // Usa defaults locales si falla la carga.
      } finally {
        if (!cancelled) {
          setConfigLoaded(true);
        }
      }
    }

    void loadConfig();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!initialProduct) {
      return;
    }

    setProduct({
      ...initialProduct,
      images: initialProduct.images ?? [],
    });
    const parsedCapacity = parseCapacity(initialProduct.capacity);
    setCapacityValue(parsedCapacity.value);
    setCapacityUnit(parsedCapacity.unit);
    setIdTouched(Boolean(initialProduct.id));
  }, [initialProduct]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as SectionId);
          }
        }
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );

    for (const id of SECTION_IDS) {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    }

    return () => observer.disconnect();
  }, []);

  const categories = useMemo(
    () =>
      catalogConfig.categories.filter(
        (category) => category.catalogId === product.catalog,
      ),
    [catalogConfig.categories, product.catalog],
  );

  const catalogOptions = useMemo(
    () =>
      catalogConfig.catalogs.map((catalog) => ({
        value: catalog.id,
        label: catalog.label,
      })),
    [catalogConfig.catalogs],
  );

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: category.id,
        label: category.label,
      })),
    [categories],
  );

  const capacityUnitOptions = useMemo(
    () => [
      { value: "por-lote", label: "por lote" },
      { value: "por-hora", label: "por hora" },
      { value: "custom", label: "Texto libre" },
    ],
    [],
  );

  const capacityPreview = formatCapacity(capacityValue, capacityUnit);
  const suggestedId = product.id.trim() || slugifyProductId(product.name);
  const imageCount = product.images?.filter(hasProductImageContent).length ?? 0;
  const thumbnailUrl =
    product.images?.[0]?.product?.src ?? product.images?.[0]?.carousel?.src ?? null;

  function updateField<K extends keyof Product>(key: K, value: Product[K]) {
    setProduct((current) => ({ ...current, [key]: value }));
  }

  function handleCatalogChange(catalogId: string) {
    const nextCategories = catalogConfig.categories.filter(
      (category) => category.catalogId === catalogId,
    );

    setProduct((current) => ({
      ...current,
      catalog: catalogId,
      category: nextCategories[0]?.id ?? current.category,
    }));
  }

  function handleNameChange(name: string) {
    setProduct((current) => ({
      ...current,
      name,
      ...(idTouched ? {} : { id: slugifyProductId(name) }),
    }));
  }

  function scrollToSection(id: SectionId) {
    const element = document.getElementById(id);
    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  }

  function showSavedNotice(message: string) {
    setSavedNotice(message);
    if (savedNoticeTimer.current !== null) {
      window.clearTimeout(savedNoticeTimer.current);
    }
    savedNoticeTimer.current = window.setTimeout(
      () => setSavedNotice(null),
      4000,
    );
  }

  function resetForm() {
    setProduct(createEmptyProduct());
    setCapacityValue("");
    setCapacityUnit("por-lote");
    setIdTouched(false);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);

    const formattedCapacity = formatCapacity(capacityValue, capacityUnit);
    if (!formattedCapacity) {
      setError("Ingrese la capacidad del producto.");
      setSaving(false);
      return;
    }

    const payload: Product = {
      ...product,
      id: product.id.trim() || slugifyProductId(product.name),
      capacity: formattedCapacity,
      images: product.images?.filter(hasProductImageContent) ?? [],
      specs: cleanLines(product.specs),
      features: cleanLines(product.features),
      technicalDetails: product.technicalDetails
        .map((detail) => ({
          label: detail.label.trim(),
          value: detail.value.trim(),
        }))
        .filter((detail) => detail.label && detail.value),
      addOns: cleanAddOns(product.addOns),
    };

    const url =
      mode === "create"
        ? "/api/admin/products"
        : `/api/admin/products/${initialProduct?.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    try {
      const response = await adminFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        error?: string;
        product?: Product;
      };

      if (!response.ok) {
        setError(data.error ?? "No se pudo guardar el producto.");
        return;
      }

      if (data.product) {
        setProduct({
          ...data.product,
          images: data.product.images ?? [],
        });
        const parsedCapacity = parseCapacity(data.product.capacity);
        setCapacityValue(parsedCapacity.value);
        setCapacityUnit(parsedCapacity.unit);
      }

      if (mode === "create" && submitIntent === "save-new") {
        showSavedNotice("Producto guardado. Agrega el siguiente.");
        resetForm();
        router.refresh();
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
        return;
      }

      if (onSaved) {
        onSaved();
      } else {
        router.push("/admin/productos");
      }

      router.refresh();
    } catch {
      setError("Error de conexión al guardar.");
    } finally {
      setSaving(false);
      setSubmitIntent("save");
    }
  }

  const inputClass = "industrial-input mt-1.5 text-sm";
  const labelClass = "text-xs uppercase tracking-widest text-steel-dark";
  const primaryButtonClass =
    "inline-flex h-12 items-center gap-2 rounded-xl bg-orange px-5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-orange-hover disabled:opacity-60";
  const secondaryButtonClass =
    "inline-flex h-12 items-center gap-2 rounded-xl border border-steel-dark/25 bg-background/40 px-5 text-sm font-semibold uppercase tracking-wider text-steel-mid transition-colors hover:border-orange/50 hover:text-orange disabled:opacity-60";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {savedNotice ? (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {savedNotice}
        </p>
      ) : null}

      <nav
        aria-label="Secciones del formulario"
        className="sticky top-0 z-10 -mx-4 border-b border-white/[0.06] bg-background/90 px-4 py-3 backdrop-blur md:-mx-6 md:px-6"
      >
        <div className="flex gap-1.5 overflow-x-auto">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollToSection(section.id)}
                aria-current={isActive ? "true" : undefined}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${
                  isActive
                    ? "bg-orange/15 text-orange ring-1 ring-inset ring-orange/30"
                    : "text-steel-mid hover:bg-panel/60 hover:text-orange"
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {section.label}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 space-y-8">
          <SectionCard id="basico" icon={FileText} title="Básico" helper="Nombre, identificación y agrupación del equipo">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="name" className={labelClass}>
                  Nombre
                </label>
                <input
                  id="name"
                  required
                  value={product.name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  placeholder="Ej. Tostador de cacao TLC-3"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="id" className={labelClass}>
                  Identificador (URL)
                </label>
                <input
                  id="id"
                  value={product.id}
                  onChange={(event) => {
                    setIdTouched(true);
                    updateField("id", event.target.value);
                  }}
                  placeholder={suggestedId || "tlc-3kg"}
                  className={inputClass}
                />
                <p className="mt-1.5 text-xs text-steel-dark">
                  Si lo dejas vacío se genera desde el nombre. URL final:{" "}
                  <span className="text-orange">/productos/{suggestedId}</span>
                </p>
              </div>

              <div>
                <label htmlFor="catalog" className={labelClass}>
                  Catálogo
                </label>
                <CustomSelect
                  id="catalog"
                  value={product.catalog}
                  onChange={handleCatalogChange}
                  disabled={!configLoaded}
                  options={catalogOptions}
                  aria-label="Catálogo"
                  className="mt-1.5"
                />
                <p className="mt-1.5 text-xs text-steel-dark">
                  <Link
                    href="/admin/catalogos"
                    className="text-orange hover:text-orange-hover"
                  >
                    Gestionar catálogos
                  </Link>
                </p>
              </div>

              <div>
                <label htmlFor="category" className={labelClass}>
                  Categoría
                </label>
                <CustomSelect
                  id="category"
                  value={product.category}
                  onChange={(value) => updateField("category", value)}
                  disabled={!configLoaded || categories.length === 0}
                  options={categoryOptions}
                  aria-label="Categoría"
                  className="mt-1.5"
                />
                <p className="mt-1.5 text-xs text-steel-dark">
                  {categories.length === 0 ? (
                    "Este catálogo no tiene categorías todavía. "
                  ) : null}
                  <Link
                    href="/admin/categorias"
                    className="text-orange hover:text-orange-hover"
                  >
                    Gestionar categorías
                  </Link>
                </p>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="capacity" className={labelClass}>
                  Capacidad
                </label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  <input
                    id="capacity"
                    required
                    value={capacityValue}
                    onChange={(event) => setCapacityValue(event.target.value)}
                    placeholder="50 kg"
                    className="industrial-input min-w-[10rem] flex-1 text-sm"
                  />
                  <CustomSelect
                    value={capacityUnit}
                    onChange={(value) => setCapacityUnit(value as CapacityUnit)}
                    options={capacityUnitOptions}
                    aria-label="Unidad de capacidad"
                    className="w-auto shrink-0"
                  />
                </div>
                {capacityPreview && capacityUnit !== "custom" && (
                  <p className="mt-2 text-xs text-steel-mid">
                    Se guardará como:{" "}
                    <span className="text-orange">{capacityPreview}</span>
                  </p>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard id="imagenes" icon={ImageIcon} title="Imágenes">
            <ProductImagesField
              images={product.images ?? []}
              onChange={(images) => updateField("images", images)}
            />
          </SectionCard>

          <SectionCard
            id="descripcion"
            icon={AlignLeft}
            title="Descripción"
            helper="Texto corto (tarjetas) y descripción completa (ficha)"
          >
            <div className="space-y-6">
              <div>
                <label htmlFor="description" className={labelClass}>
                  Descripción corta
                </label>
                <textarea
                  id="description"
                  required
                  rows={3}
                  value={product.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  placeholder="Una o dos líneas para las tarjetas del catálogo."
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="longDescription" className={labelClass}>
                  Descripción larga
                </label>
                <textarea
                  id="longDescription"
                  required
                  rows={5}
                  value={product.longDescription}
                  onChange={(event) =>
                    updateField("longDescription", event.target.value)
                  }
                  placeholder="Descripción completa de la ficha del producto."
                  className={inputClass}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard id="especificaciones" icon={ListChecks} title="Especificaciones" helper="Características destacadas del equipo">
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-steel-mid">
                    Especificaciones
                  </h3>
                  <button
                    type="button"
                    onClick={() => updateField("specs", [...product.specs, ""])}
                    className="text-xs font-medium text-orange hover:text-orange-hover"
                  >
                    + Agregar
                  </button>
                </div>
                <div className="mt-3 space-y-2">
                  {product.specs.map((spec, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        value={spec}
                        onChange={(event) => {
                          const next = [...product.specs];
                          next[index] = event.target.value;
                          updateField("specs", next);
                        }}
                        placeholder="Ej. 1.800 W de potencia"
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateField(
                            "specs",
                            product.specs.filter(
                              (_, itemIndex) => itemIndex !== index,
                            ),
                          )
                        }
                        className="shrink-0 self-center rounded-lg border border-steel-dark/25 bg-background/40 px-3 py-1.5 text-xs text-steel-dark transition-colors hover:border-orange/50 hover:text-orange"
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-steel-mid">
                    Características
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      updateField("features", [...product.features, ""])
                    }
                    className="text-xs font-medium text-orange hover:text-orange-hover"
                  >
                    + Agregar
                  </button>
                </div>
                <div className="mt-3 space-y-2">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        value={feature}
                        onChange={(event) => {
                          const next = [...product.features];
                          next[index] = event.target.value;
                          updateField("features", next);
                        }}
                        placeholder="Ej. Fácil de limpiar"
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateField(
                            "features",
                            product.features.filter(
                              (_, itemIndex) => itemIndex !== index,
                            ),
                          )
                        }
                        className="shrink-0 self-center rounded-lg border border-steel-dark/25 bg-background/40 px-3 py-1.5 text-xs text-steel-dark transition-colors hover:border-orange/50 hover:text-orange"
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard id="ficha" icon={ClipboardList} title="Ficha técnica" helper="Datos técnicos en pares etiqueta/valor">
            <div className="space-y-2">
              {product.technicalDetails.map((detail, index) => (
                <div
                  key={index}
                  className="grid gap-2 md:grid-cols-[1fr_1fr_auto]"
                >
                  <input
                    value={detail.label}
                    placeholder="Etiqueta"
                    onChange={(event) => {
                      const next = [...product.technicalDetails];
                      next[index] = { ...next[index], label: event.target.value };
                      updateField("technicalDetails", next);
                    }}
                    className={inputClass}
                  />
                  <input
                    value={detail.value}
                    placeholder="Valor"
                    onChange={(event) => {
                      const next = [...product.technicalDetails];
                      next[index] = { ...next[index], value: event.target.value };
                      updateField("technicalDetails", next);
                    }}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        "technicalDetails",
                        product.technicalDetails.filter(
                          (_, itemIndex) => itemIndex !== index,
                        ),
                      )
                    }
                    className="self-center rounded-lg border border-steel-dark/25 bg-background/40 px-3 py-1.5 text-xs text-steel-dark transition-colors hover:border-orange/50 hover:text-orange"
                  >
                    Quitar
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  updateField("technicalDetails", [
                    ...product.technicalDetails,
                    { label: "", value: "" },
                  ])
                }
                className="text-xs font-medium text-orange hover:text-orange-hover"
              >
                + Agregar campo
              </button>
            </div>
          </SectionCard>

          <SectionCard id="agregados" icon={Wrench} title="Agregados" helper="Opciones o accesorios que acompañan al equipo">
            <div className="space-y-4">
              {product.addOns.map((addOn, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-white/[0.06] bg-[var(--input-bg)] p-4"
                >
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      value={addOn.name}
                      placeholder="Nombre"
                      onChange={(event) => {
                        const next = [...product.addOns];
                        next[index] = { ...next[index], name: event.target.value };
                        updateField("addOns", next);
                      }}
                      className={inputClass}
                    />
                    <input
                      value={addOn.id}
                      placeholder="ID (opcional)"
                      onChange={(event) => {
                        const next = [...product.addOns];
                        next[index] = { ...next[index], id: event.target.value };
                        updateField("addOns", next);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <textarea
                    value={addOn.description}
                    placeholder="Descripción"
                    rows={2}
                    onChange={(event) => {
                      const next = [...product.addOns];
                      next[index] = {
                        ...next[index],
                        description: event.target.value,
                      };
                      updateField("addOns", next);
                    }}
                    className={`${inputClass} mt-3`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        "addOns",
                        product.addOns.filter(
                          (_, itemIndex) => itemIndex !== index,
                        ),
                      )
                    }
                    className="mt-2 self-start rounded-lg border border-steel-dark/25 bg-background/40 px-3 py-1.5 text-xs text-steel-dark transition-colors hover:border-orange/50 hover:text-orange"
                  >
                    Quitar agregado
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  updateField("addOns", [...product.addOns, emptyAddOn()])
                }
                className="text-xs font-medium text-orange hover:text-orange-hover"
              >
                + Agregar accesorio
              </button>
            </div>
          </SectionCard>
        </div>

        <aside className="hidden xl:sticky xl:top-20 xl:block">
          <div className="rounded-xl border border-white/[0.06] bg-[var(--input-bg)] p-4">
            <p className="text-[11px] uppercase tracking-widest text-steel-dark">
              Ficha en vivo
            </p>

            <div className="mt-3 overflow-hidden rounded-lg border border-white/[0.06] bg-background/50">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt=""
                  className="h-28 w-full object-cover"
                />
              ) : (
                <div className="grid h-28 place-items-center bg-panel/40 text-steel-dark">
                  <ImageIcon className="h-6 w-6" aria-hidden />
                </div>
              )}
              <div className="p-3">
                <p className="truncate font-display text-sm text-steel-light">
                  {product.name.trim() || "Nombre del producto"}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-steel-dark">
                  /productos/{suggestedId || "…"}
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {capacityPreview ? (
                    <span className="rounded-full border border-orange/40 bg-orange/10 px-2 py-0.5 text-[11px] text-orange">
                      {capacityPreview}
                    </span>
                  ) : null}
                  <span className="rounded-full border border-steel-dark/25 bg-background/40 px-2 py-0.5 text-[11px] text-steel-mid">
                    {getCatalogLabel(product.catalog, catalogConfig)}
                  </span>
                  <span className="rounded-full border border-steel-dark/25 bg-background/40 px-2 py-0.5 text-[11px] text-steel-mid">
                    {getCategoryLabel(product.category, catalogConfig)}
                  </span>
                </div>
                <p className="mt-2.5 text-[11px] text-steel-dark">
                  {imageCount > 0
                    ? `${imageCount} imagen${imageCount === 1 ? "" : "es"}`
                    : "Sin imágenes"}
                </p>
              </div>
            </div>

            <p className="mt-3 text-[11px] leading-relaxed text-steel-dark">
              Así se verá la ficha del producto en el catálogo. Actualiza en
              tiempo real mientras escribes.
            </p>
          </div>
        </aside>
      </div>

      {error && (
        <p className="rounded-lg border border-orange/40 bg-orange/10 px-4 py-3 text-sm text-orange">
          {error}
        </p>
      )}

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-white/[0.06] bg-background/90 px-4 py-4 backdrop-blur md:-mx-6 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="text-sm text-steel-mid transition-colors hover:text-orange"
            >
              {cancelLabel}
            </button>
          ) : (
            <Link
              href="/admin/productos"
              className="text-sm text-steel-mid transition-colors hover:text-orange"
            >
              {cancelLabel}
            </Link>
          )}

          <div className="ml-auto flex flex-wrap items-center gap-3">
            {mode === "create" ? (
              <button
                type="submit"
                onClick={() => setSubmitIntent("save-new")}
                disabled={saving}
                className={secondaryButtonClass}
              >
                <Save className="h-4 w-4" aria-hidden />
                {saving && submitIntent === "save-new"
                  ? "Guardando…"
                  : "Guardar y crear otro"}
              </button>
            ) : null}

            <button
              type="submit"
              onClick={() => setSubmitIntent("save")}
              disabled={saving}
              className={primaryButtonClass}
            >
              <Send className="h-4 w-4" aria-hidden />
              {saving && submitIntent === "save"
                ? "Guardando…"
                : mode === "create"
                  ? "Crear producto"
                  : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
