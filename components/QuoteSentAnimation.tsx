"use client";

import { Check, FileText, Users } from "lucide-react";
import { useEffect, useState } from "react";
import "@/components/quote-sent-animation.css";

interface QuoteSentAnimationProps {
  requestId?: string | null;
  onSendAnother?: () => void;
  sendingStatus?: string;
  arrivedSubtitle?: string;
  title?: string;
  description?: string;
}

export default function QuoteSentAnimation({
  requestId,
  onSendAnother,
  sendingStatus = "Enviando solicitud…",
  arrivedSubtitle = "Nuestro equipo la revisará pronto",
  title = "Solicitud enviada",
  description = "Recibimos su cotización. Si no se abrió automáticamente, puede continuar la conversación por WhatsApp con nuestro equipo de ventas.",
}: QuoteSentAnimationProps) {
  const [arrived, setArrived] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      setArrived(true);
      setShowDetails(true);
      return;
    }

    const arrivedTimer = window.setTimeout(() => setArrived(true), 1150);
    const detailsTimer = window.setTimeout(() => setShowDetails(true), 1950);

    return () => {
      window.clearTimeout(arrivedTimer);
      window.clearTimeout(detailsTimer);
    };
  }, []);

  return (
    <div className="quote-sent-animation space-y-6 py-4 text-center">
      <div
        className="mx-auto flex max-w-xs items-center justify-center gap-3 sm:gap-4"
        aria-hidden
      >
        <div className="quote-sent-animation__origin">
          <FileText className="h-5 w-5" strokeWidth={1.75} />
        </div>

        <div className="quote-sent-animation__track">
          <span className="quote-sent-animation__pulse" />
        </div>

        <div
          className={`quote-sent-animation__destination ${
            arrived ? "quote-sent-animation__destination--arrived" : ""
          }`}
        >
          <Users className="h-5 w-5" strokeWidth={1.75} />
          <span
            className={`quote-sent-animation__check ${
              arrived ? "quote-sent-animation__check--visible" : ""
            }`}
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <p
          className={`quote-sent-animation__status text-sm font-semibold uppercase tracking-[0.2em] ${
            arrived
              ? "quote-sent-animation__status--arrived"
              : "quote-sent-animation__status--sending"
          }`}
          aria-live="polite"
        >
          {arrived ? "Solicitud recibida" : sendingStatus}
        </p>
        {arrived ? (
          <p className="text-xs uppercase tracking-widest text-steel-dark">
            {arrivedSubtitle}
          </p>
        ) : null}
      </div>

      {showDetails ? (
        <div className="quote-sent-animation__details space-y-4">
          <p className="font-display text-2xl tracking-wide text-steel-light">
            {title}
          </p>
          <p className="text-base leading-relaxed text-steel-mid">
            {description}
          </p>
          {requestId ? (
            <p className="text-sm text-steel-dark">
              Referencia:{" "}
              <span className="font-mono text-steel-mid">{requestId}</span>
            </p>
          ) : null}
          {onSendAnother ? (
            <button
              type="button"
              onClick={onSendAnother}
              className="mt-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold uppercase tracking-wider text-steel-light transition-colors hover:border-orange/40 hover:text-orange"
            >
              Enviar otra solicitud
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
