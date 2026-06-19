"use client";



import Link from "next/link";

import { useRouter } from "next/navigation";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import ProductImagesField from "@/components/admin/ProductImagesField";
import CustomSelect from "@/components/CustomSelect";

import {

  defaultCatalogConfig,

  type CatalogConfig,

} from "@/lib/catalog-config";

import { formatCapacity, parseCapacity, type CapacityUnit } from "@/lib/capacity";

import type { Product, ProductAddOn } from "@/lib/products";

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

  const [error, setError] = useState("");

  const [saving, setSaving] = useState(false);



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

      images: product.images?.filter((image) => image.src) ?? [],

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



      const data = (await response.json()) as { error?: string };



      if (!response.ok) {

        setError(data.error ?? "No se pudo guardar el producto.");

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

    }

  }



  const inputClass = "industrial-input mt-1.5 text-sm";

  const labelClass = "text-xs uppercase tracking-widest text-steel-dark";

  const capacityPreview = formatCapacity(capacityValue, capacityUnit);



  return (

    <form onSubmit={handleSubmit} className="space-y-8">

      <div className="grid gap-6 md:grid-cols-2">

        <div>

          <label htmlFor="name" className={labelClass}>

            Nombre

          </label>

          <input

            id="name"

            required

            value={product.name}

            onChange={(event) => updateField("name", event.target.value)}

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

            onChange={(event) => updateField("id", event.target.value)}

            placeholder={slugifyProductId(product.name) || "tlc-3kg"}

            className={inputClass}

          />

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

            <Link href="/admin/catalogos" className="text-orange hover:text-orange-hover">

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

            <Link href="/admin/categorias" className="text-orange hover:text-orange-hover">

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



      <ProductImagesField

        images={product.images ?? []}

        onChange={(images) => updateField("images", images)}

      />



      <div>

        <label htmlFor="description" className={labelClass}>

          Descripción corta

        </label>

        <textarea

          id="description"

          required

          rows={3}

          value={product.description}

          onChange={(event) => updateField("description", event.target.value)}

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

          className={inputClass}

        />

      </div>



      <section>

        <div className="flex items-center justify-between gap-4">

          <h2 className="font-display text-lg text-steel-light">Especificaciones</h2>

          <button

            type="button"

            onClick={() => updateField("specs", [...product.specs, ""])}

            className="text-xs text-orange hover:text-orange-hover"

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

                className={inputClass}

              />

              <button

                type="button"

                onClick={() =>

                  updateField(

                    "specs",

                    product.specs.filter((_, itemIndex) => itemIndex !== index),

                  )

                }

                className="shrink-0 px-3 text-xs text-steel-dark hover:text-orange"

              >

                Quitar

              </button>

            </div>

          ))}

        </div>

      </section>



      <section>

        <div className="flex items-center justify-between gap-4">

          <h2 className="font-display text-lg text-steel-light">Características</h2>

          <button

            type="button"

            onClick={() => updateField("features", [...product.features, ""])}

            className="text-xs text-orange hover:text-orange-hover"

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

                className="shrink-0 px-3 text-xs text-steel-dark hover:text-orange"

              >

                Quitar

              </button>

            </div>

          ))}

        </div>

      </section>



      <section>

        <div className="flex items-center justify-between gap-4">

          <h2 className="font-display text-lg text-steel-light">Ficha técnica</h2>

          <button

            type="button"

            onClick={() =>

              updateField("technicalDetails", [

                ...product.technicalDetails,

                { label: "", value: "" },

              ])

            }

            className="text-xs text-orange hover:text-orange-hover"

          >

            + Agregar

          </button>

        </div>

        <div className="mt-3 space-y-2">

          {product.technicalDetails.map((detail, index) => (

            <div key={index} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">

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

                className="px-3 text-xs text-steel-dark hover:text-orange"

              >

                Quitar

              </button>

            </div>

          ))}

        </div>

      </section>



      <section>

        <div className="flex items-center justify-between gap-4">

          <h2 className="font-display text-lg text-steel-light">Agregados</h2>

          <button

            type="button"

            onClick={() => updateField("addOns", [...product.addOns, emptyAddOn()])}

            className="text-xs text-orange hover:text-orange-hover"

          >

            + Agregar

          </button>

        </div>

        <div className="mt-3 space-y-4">

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

                    product.addOns.filter((_, itemIndex) => itemIndex !== index),

                  )

                }

                className="mt-2 text-xs text-steel-dark hover:text-orange"

              >

                Quitar agregado

              </button>

            </div>

          ))}

        </div>

      </section>



      {error && (

        <p className="rounded-lg border border-orange/40 bg-orange/10 px-4 py-3 text-sm text-orange">

          {error}

        </p>

      )}



      <div className="flex flex-wrap items-center gap-3">

        <button

          type="submit"

          disabled={saving}

          className="rounded-xl bg-orange px-5 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-orange-hover disabled:opacity-60"

        >

          {saving ? "Guardando…" : mode === "create" ? "Crear producto" : "Guardar cambios"}

        </button>

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

      </div>

    </form>

  );

}


