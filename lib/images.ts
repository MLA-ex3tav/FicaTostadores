export const logoPath = "/images/general/logo.png";

export const IMAGE_DIRS = {
  hero: "/images/hero",
  general: "/images/general",
} as const;

export interface HeroCarouselImage {
  src: string;
  alt: string;
}

/** Coloque fotos en public/images/hero/01.jpg … 05.jpg */
export const heroCarouselImages: HeroCarouselImage[] = [
  {
    src: "/images/hero/01.jpg",
    alt: "Tostador industrial Fica en operación",
  },
  {
    src: "/images/hero/02.jpg",
    alt: "Línea de tostado de café TLC",
  },
  {
    src: "/images/hero/03.jpg",
    alt: "Maquinaria para frutos secos y granos",
  },
  {
    src: "/images/hero/04.jpg",
    alt: "Equipo de procesamiento Fica",
  },
  {
    src: "/images/hero/05.jpg",
    alt: "Planta de tostado industrial",
  },
];
