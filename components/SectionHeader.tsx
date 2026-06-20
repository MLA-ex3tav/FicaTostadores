import type { ReactNode } from "react";

export const sectionEyebrowClass =
  "text-sm uppercase tracking-[0.3em] text-steel-dark";

export const sectionTitleClass =
  "font-display text-3xl tracking-wide text-steel-light md:text-4xl";

export const sectionDescriptionClass =
  "text-base leading-relaxed text-steel-mid";

interface SectionHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  as?: "h1" | "h2";
  align?: "left" | "center";
  className?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  as: Heading = "h2",
  align = "left",
  className = "",
}: SectionHeaderProps) {
  const wrapperClass =
    align === "center"
      ? `mx-auto max-w-2xl text-center ${className}`.trim()
      : `max-w-xl ${className}`.trim();

  return (
    <div className={wrapperClass}>
      {eyebrow ? <p className={sectionEyebrowClass}>{eyebrow}</p> : null}
      <Heading className={`mt-2 ${sectionTitleClass}`}>{title}</Heading>
      {description ? (
        <p className={`mt-3 ${sectionDescriptionClass}`}>{description}</p>
      ) : null}
    </div>
  );
}
