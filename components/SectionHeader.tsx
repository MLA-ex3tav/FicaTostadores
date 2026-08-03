import type { ReactNode } from "react";

export const sectionEyebrowClass =
  "flex items-center gap-2.5 text-sm font-medium uppercase tracking-[0.3em] text-steel-dark";

export const sectionTitleClass =
  "font-display text-3xl tracking-wide text-steel-light md:text-4xl";

export const sectionDescriptionClass =
  "mt-3 text-base leading-relaxed text-steel-mid";

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
      {eyebrow ? (
        <p className={sectionEyebrowClass}>
          <span
            className="h-px w-7 shrink-0 bg-orange"
            aria-hidden="true"
          />
          {eyebrow}
        </p>
      ) : null}
      <Heading className={`mt-3 ${sectionTitleClass}`}>{title}</Heading>
      {description ? (
        <p className={sectionDescriptionClass}>{description}</p>
      ) : null}
    </div>
  );
}
