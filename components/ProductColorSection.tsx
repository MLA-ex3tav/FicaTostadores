"use client";

import ProductColorPicker from "@/components/ProductColorPicker";

interface ProductColorSectionProps {
  selectedColorId: string;
  onColorChange: (colorId: string) => void;
  disableColors?: boolean;
  disabledColors?: string[];
  compact?: boolean;
}

export default function ProductColorSection({
  selectedColorId,
  onColorChange,
  disableColors,
  disabledColors,
  compact = false,
}: ProductColorSectionProps) {
  return (
    <section className={compact ? undefined : "mb-8 border border-white/[0.08] bg-panel/50 p-4"}>
      <ProductColorPicker
        value={selectedColorId}
        onChange={onColorChange}
        disableColors={disableColors}
        disabledColors={disabledColors}
      />
    </section>
  );
}
