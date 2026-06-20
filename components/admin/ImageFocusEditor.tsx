"use client";

import {
  clampFocus,
  focusToObjectPosition,
  type ProductImageFocus,
} from "@/lib/product-images";
import { useCallback } from "react";

interface ImageFocusEditorProps {
  src: string;
  label: string;
  resolutionHint: string;
  aspectClassName: string;
  focus: ProductImageFocus;
  onChange: (focus: ProductImageFocus) => void;
  onReplaceImage?: () => void;
  replaceImageLabel?: string;
  replacingImage?: boolean;
}

export default function ImageFocusEditor({
  src,
  label,
  resolutionHint,
  aspectClassName,
  focus,
  onChange,
  onReplaceImage,
  replaceImageLabel,
  replacingImage = false,
}: ImageFocusEditorProps) {
  const updateFromPointer = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = clampFocus(((event.clientX - rect.left) / rect.width) * 100);
      const y = clampFocus(((event.clientY - rect.top) / rect.height) * 100);
      onChange({ x, y });
    },
    [onChange],
  );

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-steel-mid">
          {label}
        </p>
        {onReplaceImage ? (
          <button
            type="button"
            disabled={replacingImage}
            onClick={onReplaceImage}
            className="text-[0.65rem] text-orange hover:text-orange-hover disabled:opacity-60"
          >
            {replacingImage ? "Subiendo…" : (replaceImageLabel ?? "Cambiar imagen")}
          </button>
        ) : null}
      </div>
      <p className="mb-2 text-[0.6rem] leading-snug text-orange/90">
        Recomendado: {resolutionHint}
      </p>
      <div
        className={`relative overflow-hidden rounded-lg border border-white/[0.08] bg-black/40 ${aspectClassName} touch-none`}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          updateFromPointer(event);
        }}
        onPointerMove={(event) => {
          if (event.buttons !== 1) {
            return;
          }

          updateFromPointer(event);
        }}
        role="img"
        aria-label={`${label}: arrastre para encuadrar`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: focusToObjectPosition(focus) }}
        />
        <div
          className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-orange bg-orange/30 shadow-[0_0_0_1px_rgba(0,0,0,0.5)]"
          style={{ left: `${focus.x}%`, top: `${focus.y}%` }}
          aria-hidden="true"
        />
      </div>
      <p className="mt-1 text-[0.6rem] text-steel-dark">
        Clic o arrastre para encuadrar
      </p>
    </div>
  );
}
