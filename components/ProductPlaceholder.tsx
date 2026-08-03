interface ProductPlaceholderProps {
  className?: string;
  flat?: boolean;
}

export default function ProductPlaceholder({
  className = "h-48",
  flat = false,
}: ProductPlaceholderProps) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-t-xl ${
        flat
          ? "bg-surface"
          : "bg-gradient-to-br from-[#4a5059] via-[#3a3f48] to-[#525862]"
      } ${className}`}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 6px)",
        }}
        aria-hidden="true"
      />
      <svg
        className="relative h-16 w-16 text-steel-dark/60"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="3" y="6" width="18" height="12" rx="1" />
        <circle cx="8" cy="12" r="2" />
        <path d="M14 10h4M14 14h4" />
      </svg>
    </div>
  );
}
