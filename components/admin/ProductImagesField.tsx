"use client";

import ImageFocusEditor from "@/components/admin/ImageFocusEditor";
import { useFirebaseAuth } from "@/lib/firebase-auth";
import {
  CAROUSEL_IMAGE_SPEC,
  createGalleryImage,
  createProductImage,
  PRODUCT_IMAGE_SPEC,
  type ProductImage,
  type ProductImageView,
} from "@/lib/product-images";
import { useRef, useState } from "react";

interface ProductImagesFieldProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
}

type PrimaryViewKey = "carousel" | "product";

export default function ProductImagesField({
  images,
  onChange,
}: ProductImagesFieldProps) {
  const { adminFetch } = useFirebaseAuth();
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const carouselInputRef = useRef<HTMLInputElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [replacingView, setReplacingView] = useState<PrimaryViewKey | null>(
    null,
  );
  const [error, setError] = useState("");

  async function uploadFile(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await adminFetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as { url?: string; error?: string };

    if (!response.ok || !data.url) {
      setError(
        data.error ?? `No se pudo subir una imagen (${response.status}).`,
      );
      return null;
    }

    return data.url;
  }

  async function handleGalleryFiles(selected: FileList | null) {
    if (!selected?.length) {
      return;
    }

    setUploading(true);
    setError("");

    const nextImages = [...images];

    try {
      for (const file of Array.from(selected)) {
        const url = await uploadFile(file);
        if (!url) {
          return;
        }

        nextImages.push(createGalleryImage(url));
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
      if (galleryInputRef.current) {
        galleryInputRef.current.value = "";
      }
    }
  }

  async function handlePrimaryViewFile(
    view: PrimaryViewKey,
    selected: FileList | null,
  ) {
    if (!selected?.length || images.length === 0) {
      return;
    }

    setReplacingView(view);
    setError("");

    try {
      const url = await uploadFile(selected[0]);
      if (!url) {
        return;
      }

      onChange(
        images.map((image, index) => {
          if (index !== 0) {
            return image;
          }

          return {
            ...image,
            [view]: {
              ...image[view],
              src: url,
            } satisfies ProductImageView,
          };
        }),
      );
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Error de conexión al subir imágenes.",
      );
    } finally {
      setReplacingView(null);
      const inputRef =
        view === "carousel" ? carouselInputRef : productInputRef;
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  async function handleInitialPrimaryUpload(selected: FileList | null) {
    if (!selected?.length) {
      return;
    }

    setUploading(true);
    setError("");

    try {
      const url = await uploadFile(selected[0]);
      if (!url) {
        return;
      }

      onChange([createProductImage(url)]);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Error de conexión al subir imágenes.",
      );
    } finally {
      setUploading(false);
      if (galleryInputRef.current) {
        galleryInputRef.current.value = "";
      }
    }
  }

  function removeImage(index: number) {
    onChange(images.filter((_, itemIndex) => itemIndex !== index));
  }

  function updateView(
    index: number,
    view: keyof ProductImage,
    patch: Partial<ProductImageView>,
  ) {
    onChange(
      images.map((image, itemIndex) =>
        itemIndex === index
          ? {
              ...image,
              [view]: { ...image[view], ...patch },
            }
          : image,
      ),
    );
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg text-steel-light">Imágenes</h2>
          <p className="mt-1 text-xs text-steel-dark">
            La imagen principal puede usar archivos distintos para el carrusel
            (inicio) y la vista de productos (catálogo y ficha). Las imágenes
            adicionales solo se muestran en la ficha del producto.
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
          onClick={() => {
            if (images.length === 0) {
              galleryInputRef.current?.click();
              return;
            }

            galleryInputRef.current?.click();
          }}
          className="text-xs text-orange hover:text-orange-hover disabled:opacity-60"
        >
          {uploading
            ? "Subiendo…"
            : images.length === 0
              ? "+ Agregar imagen principal"
              : "+ Agregar imágenes"}
        </button>
      </div>

      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple={images.length > 0}
        className="hidden"
        onChange={(event) => {
          const files = event.target.files;
          if (images.length === 0) {
            void handleInitialPrimaryUpload(files);
            return;
          }

          void handleGalleryFiles(files);
        }}
      />
      <input
        ref={carouselInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) =>
          void handlePrimaryViewFile("carousel", event.target.files)
        }
      />
      <input
        ref={productInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) =>
          void handlePrimaryViewFile("product", event.target.files)
        }
      />

      {images.length > 0 ? (
        <div className="mt-4 space-y-6">
          {images.map((image, index) => (
            <div
              key={`${image.carousel.src}-${image.product.src}-${index}`}
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
                    src={image.carousel.src}
                    label={CAROUSEL_IMAGE_SPEC.label}
                    resolutionHint={CAROUSEL_IMAGE_SPEC.hint}
                    aspectClassName="aspect-[5/2] w-full"
                    focus={image.carousel.focus}
                    onChange={(focus) => updateView(index, "carousel", { focus })}
                    onReplaceImage={() => carouselInputRef.current?.click()}
                    replaceImageLabel="Cambiar imagen carrusel"
                    replacingImage={replacingView === "carousel"}
                  />
                ) : null}
                <ImageFocusEditor
                  src={image.product.src}
                  label={PRODUCT_IMAGE_SPEC.label}
                  resolutionHint={PRODUCT_IMAGE_SPEC.hint}
                  aspectClassName="aspect-[4/3] w-full"
                  focus={image.product.focus}
                  onChange={(focus) => updateView(index, "product", { focus })}
                  onReplaceImage={
                    index === 0
                      ? () => productInputRef.current?.click()
                      : undefined
                  }
                  replaceImageLabel="Cambiar imagen productos"
                  replacingImage={index === 0 && replacingView === "product"}
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
