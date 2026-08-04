"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  PRODUCT_COLORS,
  getProductColorById,
} from "@/lib/product-colors";

interface ProductColorPickerProps {
  value: string;
  onChange: (colorId: string) => void;
  className?: string;
}

export default function ProductColorPicker({
  value,
  onChange,
  className,
}: ProductColorPickerProps) {
  const [hoveredColorId, setHoveredColorId] = useState<string | null>(null);

  const activeColor = getProductColorById(hoveredColorId ?? value);

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="flex items-center gap-2.5 text-sm">
        <span className="text-xs uppercase tracking-[0.18em] font-semibold text-steel-dark">
          Color del equipo:
        </span>
        <span className="font-medium text-steel-light transition-colors">
          {activeColor?.name ?? "Seleccionar color"}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        {PRODUCT_COLORS.map((color) => {
          const isSelected = value === color.id;
          const isLight =
            color.id === "blanco" ||
            color.id === "amarillo" ||
            color.id === "verde-claro";

          return (
            <button
              key={color.id}
              type="button"
              onClick={() => onChange(color.id)}
              onMouseEnter={() => setHoveredColorId(color.id)}
              onMouseLeave={() => setHoveredColorId(null)}
              aria-pressed={isSelected}
              aria-label={`Color ${color.name}`}
              title={color.name}
              className={cn(
                "group relative h-7 w-7 rounded-full transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange",
                isSelected
                  ? "scale-110 ring-2 ring-orange ring-offset-2 ring-offset-panel"
                  : "opacity-75 hover:opacity-100 hover:scale-110",
              )}
            >
              <span
                className={cn(
                  "block h-full w-full rounded-full border border-black/30 shadow-inner",
                  isLight && "border-steel-dark/40",
                )}
                style={{ backgroundColor: color.hex }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
