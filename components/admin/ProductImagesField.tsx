"use client";

import MediaImage from "@/components/MediaImage";
import { useFirebaseAuth } from "@/lib/firebase-auth";
import { useRef, useState } from "react";

interface ProductImagesFieldProps {
  images: string[];
  onChange: (images: string[]) => void;
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

        nextImages.push(data.url);
      }

      onChange(nextImages);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
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

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg text-steel-light">Imágenes</h2>
          <p className="mt-1 text-xs text-steel-dark">
            Aparecen en la ficha del producto y en el carrusel del inicio.
          </p>
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
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="overflow-hidden rounded-xl border border-white/[0.06] bg-[var(--input-bg)]"
            >
              <div className="relative h-40">
                <MediaImage
                  src={src}
                  alt={`Imagen ${index + 1}`}
                  className="h-40 w-full"
                  fallbackClassName="h-40 w-full"
                />
              </div>
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="truncate text-xs text-steel-dark">
                  {index === 0 ? "Principal · carrusel" : `Imagen ${index + 1}`}
                </span>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="shrink-0 text-xs text-steel-mid hover:text-orange"
                >
                  Quitar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-lg border border-dashed border-steel-dark/40 px-4 py-6 text-sm text-steel-mid">
          Sin imágenes. Suba fotos del equipo para mostrarlas en el sitio y en
          el carrusel de la página de inicio.
        </p>
      )}

      {error && (
        <p className="mt-3 text-sm text-orange">{error}</p>
      )}
    </section>
  );
}
