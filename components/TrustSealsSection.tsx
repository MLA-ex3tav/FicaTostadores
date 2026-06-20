import SectionHeader from "@/components/SectionHeader";

interface TrustSealProps {
  topText: string;
  centerLabel?: string;
  bottomText: string;
}

function TrustSeal({ topText, centerLabel, bottomText }: TrustSealProps) {
  return (
    <figure className="h-full w-full">
      <div className="flex h-full flex-col items-center rounded-xl border border-steel-dark/20 bg-panel px-5 py-7 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-colors md:px-6 md:py-8">
        <p className="text-[0.7rem] uppercase leading-snug tracking-[0.14em] text-steel-dark">
          {topText}
        </p>

        {centerLabel ? (
          <p className="mt-2 font-display text-xl leading-tight tracking-wide text-steel-light md:text-2xl">
            {centerLabel}
          </p>
        ) : (
          <p className="mt-2 font-display text-xl leading-tight tracking-wide text-steel-light md:text-2xl">
            {bottomText}
          </p>
        )}

        {centerLabel ? (
          <p className="mt-2 text-[0.7rem] uppercase leading-snug tracking-[0.14em] text-steel-mid">
            {bottomText}
          </p>
        ) : null}
      </div>
    </figure>
  );
}

const seals: TrustSealProps[] = [
  {
    topText: "Fabricado en Chile",
    bottomText: "IX Región",
  },
  {
    topText: "Cumple norma sanitaria",
    centerLabel: "Acero inoxidable",
    bottomText: "Calidad certificada",
  },
  {
    topText: "Productos naturales",
    centerLabel: "Vida sana",
    bottomText: "Alimentación saludable",
  },
];

export default function TrustSealsSection() {
  return (
    <section
      aria-label="Sellos de calidad"
      className="border-t border-steel-dark/15 py-14 md:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeader
          eyebrow="Calidad"
          title={
            <>
              Compromiso <span className="text-orange">certificado</span>
            </>
          }
          align="center"
        />

        <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
          {seals.map((seal) => (
            <li key={seal.topText} className="h-full">
              <TrustSeal {...seal} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
