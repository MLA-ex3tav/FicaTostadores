"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface NotificationBannerProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
}

export default function NotificationBanner({
  message,
  visible,
  onDismiss,
}: NotificationBannerProps) {
  useEffect(() => {
    if (!visible) {
      return;
    }

    const timer = window.setTimeout(onDismiss, 4000);
    return () => window.clearTimeout(timer);
  }, [visible, message, onDismiss]);

  if (!visible || !message) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-[150] w-[min(100%-2rem,22rem)] -translate-x-1/2 md:bottom-auto md:left-auto md:right-6 md:top-24 md:translate-x-0"
    >
      <div className="flex items-start gap-3 rounded-lg border border-orange/30 bg-[var(--input-bg)] px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        <p className="min-w-0 flex-1 text-sm leading-relaxed text-steel-light">
          {message}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 p-0.5 text-steel-dark transition-colors hover:text-orange"
          aria-label="Cerrar notificación"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
