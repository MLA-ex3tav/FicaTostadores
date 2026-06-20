"use client";

import Image from "next/image";
import { Factory } from "lucide-react";
import { useState } from "react";

interface MediaImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  priority?: boolean;
  objectPosition?: string;
  sizes?: string;
  quality?: number;
}

export default function MediaImage({
  src,
  alt,
  className = "h-48 rounded-t-xl",
  fallbackClassName,
  priority = false,
  objectPosition = "50% 50%",
  sizes = "(max-width: 768px) 100vw, 33vw",
  quality = 80,
}: MediaImageProps) {
  const [hasError, setHasError] = useState(false);
  const containerClass = fallbackClassName ?? className;

  if (hasError) {
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#4a5059] via-[#3a3f48] to-[#525862] ${containerClass}`}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 6px)",
          }}
          aria-hidden="true"
        />
        <Factory className="relative h-16 w-16 text-steel-dark/60" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        style={{ objectPosition }}
        sizes={sizes}
        quality={quality}
        priority={priority}
        fetchPriority={priority ? "high" : "auto"}
        onError={() => setHasError(true)}
      />
    </div>
  );
}
