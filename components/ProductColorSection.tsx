"use client";

import ProductColorPicker from "@/components/ProductColorPicker";
import SectionLabel from "@/components/SectionLabel";
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
    <section className="mb-10">
      <SectionLabel>
        Color especial para su <span className="text-orange">tostaduría</span>
      </SectionLabel>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-steel-mid">
        Tenemos el color especial para su tostaduría. Elija el acabado de pintura
        para su equipo.
      </p>

      <SteelPanel className="mt-6 md:py-6">
        <p className="text-xs uppercase tracking-[0.2em] text-steel-dark">
          Seleccione su color
        </p>
        <ProductColorPicker
          value={selectedColorId}
          onChange={onColorChange}
          className="mt-4"
        />
      </SteelPanel>
    </section>
  );
}
