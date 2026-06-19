"use client";

import ImageFocusEditor from "@/components/admin/ImageFocusEditor";
import { useFirebaseAuth } from "@/lib/firebase-auth";
import {
  CAROUSEL_IMAGE_SPEC,
  createProductImage,
  PRODUCT_IMAGE_SPEC,
  type ProductImage,
} from "@/lib/product-images";
import { useRef, useState } from "react";

interface ProductImagesFieldProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
}

export default function ProductImagesField({
  images,
  onChange,
}: ProductImagesFieldProps) {
  const { adminFetch } = useFirebaseAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(selected: FileList | null) {
    if (!selected?.length) {
      return;
    }

    setUploading(true);
    setError("");

    const nextImages = [...images];

    try {
      for (const file of Array.from(selected)) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await adminFetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const data = (await response.json()) as { url?: string; error?: string };

        if (!response.ok || !data.url) {
          setError(
            data.error ??
              `No se pudo subir una imagen (${response.status}).`,
          );
          return;
        }

        nextImages.push(createProductImage(data.url));
      }

      onChange(nextImages);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Error de conexión al subir imágenes.",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function removeImage(index: number) {
    onChange(images.filter((_, itemIndex) => itemIndex !== index));
  }

  function updateImage(index: number, patch: Partial<ProductImage>) {
    onChange(
      images.map((image, itemIndex) =>
        itemIndex === index ? { ...image, ...patch } : image,
      ),
    );
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg text-steel-light">Imágenes</h2>
          <p className="mt-1 text-xs text-steel-dark">
            Ajuste la vista carrusel (inicio) y la vista productos (catálogo y
            ficha). Use fotos en alta resolución según las medidas recomendadas.
          </p>
          <ul className="mt-2 space-y-1 text-[0.65rem] text-steel-mid">
            <li>
              <span className="text-orange">Carrusel:</span>{" "}
              {CAROUSEL_IMAGE_SPEC.hint}
            </li>
            <li>
              <span className="text-orange">Productos:</span>{" "}
              {PRODUCT_IMAGE_SPEC.hint}
            </li>
          </ul>
        </div>
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="text-xs text-orange hover:text-orange-hover disabled:opacity-60"
        >
          {uploading ? "Subiendo…" : "+ Agregar imágenes"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => void handleFiles(event.target.files)}
      />

      {images.length > 0 ? (
        <div className="mt-4 space-y-6">
          {images.map((image, index) => (
            <div
              key={`${image.src}-${index}`}
              className="rounded-xl border border-white/[0.06] bg-[var(--input-bg)] p-4"
            >
              <div className="mb-4 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-steel-mid">
                  {index === 0 ? "Imagen principal" : `Imagen ${index + 1}`}
                </span>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="shrink-0 text-xs text-steel-mid hover:text-orange"
                >
                  Quitar
                </button>
              </div>

              <div
                className={`grid gap-4 ${
                  index === 0 ? "md:grid-cols-2" : "max-w-md"
                }`}
              >
                {index === 0 ? (
                  <ImageFocusEditor
                    src={image.src}
                    label={CAROUSEL_IMAGE_SPEC.label}
                    resolutionHint={CAROUSEL_IMAGE_SPEC.hint}
                    aspectClassName="aspect-[5/2] w-full"
                    focus={image.carousel}
                    onChange={(carousel) => updateImage(index, { carousel })}
                  />
                ) : null}
                <ImageFocusEditor
                  src={image.src}
                  label={PRODUCT_IMAGE_SPEC.label}
                  resolutionHint={PRODUCT_IMAGE_SPEC.hint}
                  aspectClassName="aspect-[4/3] w-full"
                  focus={image.product}
                  onChange={(product) => updateImage(index, { product })}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-lg border border-dashed border-steel-dark/40 px-4 py-6 text-sm text-steel-mid">
          Sin imágenes. Suba fotos del equipo y encuadre cómo se verán en el
          sitio.
          <span className="mt-3 block text-xs leading-relaxed text-steel-dark">
            Resolución recomendada — Carrusel: {CAROUSEL_IMAGE_SPEC.hint}.
            Productos: {PRODUCT_IMAGE_SPEC.hint}.
          </span>
        </p>
      )}

      {error && <p className="mt-3 text-sm text-orange">{error}</p>}
    </section>
  );
}
