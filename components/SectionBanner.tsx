import MediaImage from "./MediaImage";

interface SectionBannerProps {
  src: string;
  alt: string;
  className?: string;
}

export default function SectionBanner({
  src,
  alt,
  className = "h-44 md:h-56",
}: SectionBannerProps) {
  return (
    <MediaImage
      src={src}
      alt={alt}
      className={`w-full rounded-xl ${className}`}
      fallbackClassName={`w-full rounded-xl ${className}`}
    />
  );
}
