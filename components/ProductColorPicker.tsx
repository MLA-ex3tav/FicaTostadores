import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PRODUCT_COLORS,
  getProductColorById,
} from "@/lib/product-colors";

interface ProductColorPickerProps {
  value: string;
  onChange: (colorId: string) => void;
  disableColors?: boolean;
  disabledColors?: string[];
  className?: string;
}

export default function ProductColorPicker({
  value,
  onChange,
  disableColors = false,
  disabledColors = [],
  className,
}: ProductColorPickerProps) {
  if (disableColors) {
    return (
      <div className={cn("rounded-lg border border-white/[0.06] bg-background/20 p-3 text-center", className)}>
        <p className="text-xs text-steel-dark">
          Este modelo se entrega en su acabado industrial estándar (no requiere selección de color).
        </p>
      </div>
    );
  }

  const selected = getProductColorById(value);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-steel-dark">
          Color
        </p>
        <p className="truncate text-sm text-steel-light">
          {selected && !disabledColors.includes(selected.id)
            ? selected.name
            : "Seleccione un color"}
        </p>
      </div>

      <div
        className="grid grid-cols-2 gap-1.5"
        role="radiogroup"
        aria-label="Color del equipo"
      >
        {PRODUCT_COLORS.map((color) => {
          const isBlocked = disabledColors.includes(color.id);
          const isSelected = value === color.id && !isBlocked;
          const isLight =
            color.id === "blanco" ||
            color.id === "amarillo" ||
            color.id === "verde-claro";

          return (
            <button
              key={color.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-disabled={isBlocked}
              disabled={isBlocked}
              aria-label={isBlocked ? `${color.name} (No disponible)` : color.name}
              title={isBlocked ? `${color.name} (No disponible para este producto)` : color.name}
              onClick={() => {
                if (!isBlocked) {
                  onChange(color.id);
                }
              }}
              className={cn(
                "flex min-h-10 items-center gap-2.5 rounded-md border px-2 py-1.5 text-left transition-colors",
                isBlocked
                  ? "border-white/[0.04] bg-background/10 text-steel-dark opacity-35 cursor-not-allowed"
                  : isSelected
                    ? "border-orange/70 bg-orange/10 text-steel-light"
                    : "border-white/[0.08] bg-background/30 text-steel-mid hover:border-white/15 hover:text-steel-light",
              )}
            >
              <span
                className={cn(
                  "h-4 w-4 shrink-0 rounded-full border relative grid place-items-center",
                  isLight ? "border-steel-dark/50" : "border-black/40",
                )}
                style={{ backgroundColor: color.hex }}
                aria-hidden
              >
                {isBlocked && (
                  <Lock className="h-2.5 w-2.5 text-red-400 drop-shadow" />
                )}
              </span>
              <span className={cn("truncate text-xs leading-tight", isBlocked && "line-through opacity-70")}>
                {color.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
