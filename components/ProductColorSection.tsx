"use client";

import ProductColorPicker from "@/components/ProductColorPicker";
import SteelPanel from "@/components/SteelPanel";

interface ProductColorSectionProps {
  selectedColorId: string;
  onColorChange: (colorId: string) => void;
}

export default function ProductColorSection({
  selectedColorId,
  onColorChange,
}: ProductColorSectionProps) {
  return (
    <section className="mb-8">
      <SteelPanel className="!py-4 !px-5 md:!px-6">
        <ProductColorPicker
          value={selectedColorId}
          onChange={onColorChange}
        />
      </SteelPanel>
    </section>
  );
}
