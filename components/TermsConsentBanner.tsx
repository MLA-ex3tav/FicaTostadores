"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import SteelPanel from "@/components/SteelPanel";
import { TERMS_ACCEPTED_STORAGE_KEY } from "@/lib/legal";

function hasAcceptedTerms(): boolean {
  try {
    return window.localStorage.getItem(TERMS_ACCEPTED_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export default function TermsConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);
  const [declinedNotice, setDeclinedNotice] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!hasAcceptedTerms()) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab" || focusable.length === 0) {
        return;
      }

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        }
        return;
      }

      if (document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [visible]);

  useEffect(() => {
    if (!declinedNotice) {
      return;
    }

    const timeout = window.setTimeout(() => setDeclinedNotice(false), 6000);
    return () => window.clearTimeout(timeout);
  }, [declinedNotice]);

  const handleAccept = useCallback(() => {
    if (!checked) {
      return;
    }

    try {
      window.localStorage.setItem(TERMS_ACCEPTED_STORAGE_KEY, "true");
    } catch {
      // localStorage unavailable — dismiss for this session only
    }

    setVisible(false);
  }, [checked]);

  const handleDecline = useCallback(() => {
    setVisible(false);
    setDeclinedNotice(true);
  }, []);

  if (!visible && !declinedNotice) {
    return null;
  }

  return (
    <>
      {visible && (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-[300] flex items-end justify-center bg-background/85 px-4 pb-6 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
        >
          <SteelPanel className="w-full max-w-lg">
            <p
              id={titleId}
              className="font-display text-xl tracking-wide text-steel-light"
            >
              Términos y privacidad
            </p>
            <p
              id={descriptionId}
              className="mt-3 text-sm leading-relaxed text-steel-mid"
            >
              Al utilizar este sitio usted acepta nuestros{" "}
              <Link
                href="/terminos"
                className="text-orange underline-offset-2 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Términos y condiciones
              </Link>{" "}
              y nuestra{" "}
              <Link
                href="/privacidad"
                className="text-orange underline-offset-2 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Política de privacidad
              </Link>
              .
            </p>

            <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm text-steel-mid">
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) => setChecked(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-steel-dark/40 bg-input-bg accent-orange"
              />
              <span>
                He leído y acepto los términos y condiciones y la política de
                privacidad.
              </span>
            </label>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleDecline}
                className="flex-1 rounded-xl border border-steel-mid/40 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-steel-light transition-colors hover:border-orange hover:text-orange"
              >
                Rechazar
              </button>
              <button
                type="button"
                onClick={handleAccept}
                disabled={!checked}
                className="flex-1 rounded-xl bg-orange px-4 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-orange-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                Aceptar
              </button>
            </div>
          </SteelPanel>
        </div>
      )}

      {declinedNotice && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-4 right-4 z-[301] mx-auto max-w-lg rounded-xl border border-steel-dark/30 bg-panel px-4 py-3 text-sm text-steel-mid shadow-lg sm:left-auto sm:right-6"
        >
          Puede seguir navegando el sitio. Le volveremos a solicitar la
          aceptación en su próxima visita.
        </div>
      )}
    </>
  );
}
