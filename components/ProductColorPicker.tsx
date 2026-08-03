"use client";

import { cn } from "@/lib/utils";
import {
  PRODUCT_COLORS,
  type ProductColorOption,
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
  return (
    <ul
      className={cn(
        "flex min-w-0 flex-nowrap items-start justify-between gap-1.5 overflow-x-auto overscroll-x-contain pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {PRODUCT_COLORS.map((color) => (
        <li key={color.id} className="w-[2.75rem] shrink-0 sm:w-[3rem]">
          <ColorSwatch
            color={color}
            selected={value === color.id}
            onSelect={() => onChange(color.id)}
          />
        </li>
      ))}
    </ul>
  );
}

function ColorSwatch({
  color,
  selected,
  onSelect,
}: {
  color: ProductColorOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const isLight =
    color.id === "blanco" || color.id === "amarillo" || color.id === "verde-claro";

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`Color ${color.name}`}
      title={color.name}
      className="group flex w-full flex-col items-center gap-1 text-center"
    >
      <span
        className={cn(
          "size-[2.75rem] shrink-0 rounded-lg border-2 border-steel-dark/20 shadow-sm transition-all group-hover:border-orange/50 sm:size-[3rem]",
          isLight && "ring-1 ring-inset ring-steel-dark/15",
          selected && "border-orange ring-2 ring-orange/35",
        )}
        style={{ backgroundColor: color.hex }}
      />
      <span className="line-clamp-2 w-full text-[8px] leading-tight tracking-wide text-steel-mid group-hover:text-steel-light sm:text-[9px]">
        {color.name}
      </span>
    </button>
  );
}
