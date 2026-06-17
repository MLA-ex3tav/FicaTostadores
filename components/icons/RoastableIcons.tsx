interface IconProps {
  className?: string;
}

export function CoffeeIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M5 8h11a3 3 0 0 1 0 6H9a3 3 0 0 1-3-3V8z" />
      <path d="M16 10h1a2 2 0 0 1 0 4h-1M6 18h8" />
    </svg>
  );
}

export function CacaoIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M8 4c-2 2-3 5-2 8s3 5 6 6c3-1 5-4 6-7s-1-7-4-9-4 0-6 2z" />
      <path d="M14 6c2 2 3 5 2 8" />
    </svg>
  );
}

export function NutsIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <ellipse cx="12" cy="14" rx="6" ry="4" />
      <path d="M8 10c0-3 2-5 4-5s4 2 4 5" />
    </svg>
  );
}

export function GrainIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M12 3v18M8 7l4-2 4 2M7 11l5-2 5 2M6 15l6-2 6 2M8 19l4-1 4 1" />
    </svg>
  );
}

export function SeedsIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="8" cy="8" r="2" />
      <circle cx="16" cy="10" r="2" />
      <circle cx="10" cy="16" r="2" />
      <circle cx="15" cy="15" r="1.5" />
    </svg>
  );
}

export function SpiceIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M12 4l1 4 4 1-4 1-1 4-1-4-4-1 4-1 1-4z" />
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

export function RoasterIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="4" y="8" width="16" height="10" rx="1" />
      <circle cx="9" cy="13" r="2" />
      <path d="M14 11h5M14 15h5M8 4v4M16 4v4" />
    </svg>
  );
}

export function AutomationIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M12 6v6l4 2" />
      <circle cx="12" cy="12" r="9" />
      <path d="M8 3h2M14 3h2M8 21h2M14 21h2" />
    </svg>
  );
}

export function SupportIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M12 2a8 8 0 0 0-8 8v3a3 3 0 0 0 3 3h1v-5H6a6 6 0 1 1 12 0h-2v5h1a3 3 0 0 0 3-3v-3a8 8 0 0 0-8-8z" />
    </svg>
  );
}

export function CustomIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

export function GlobeIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  );
}

export function ShieldIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function ExportIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M12 3v12M8 11l4 4 4-4M5 19h14" />
    </svg>
  );
}
