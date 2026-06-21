"use client";

import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildWhatsAppContactUrl,
  openWhatsAppContact,
} from "@/lib/quoting";
import { useQuoteSelection } from "@/lib/quote-selection";
import "@/components/site-chat-widget.css";

const DEFAULT_MESSAGE =
  "Hola, quisiera información sobre equipos Fica Tostadores.";
const PANEL_CLOSE_MS = 240;

function WhatsAppIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function WhatsAppFloatButton() {
  const pathname = usePathname();
  const { products } = useQuoteSelection();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const isAdmin = pathname.startsWith("/admin");

  const hasQuoteDock =
    products.length > 0 && pathname !== "/contacto";

  const positionClass = hasQuoteDock
    ? "bottom-24 right-5 md:bottom-28 md:right-6"
    : "bottom-5 right-5 md:bottom-6 md:right-6";

  const handleClose = useCallback(() => {
    if (closing) {
      return;
    }

    setClosing(true);
    setOpen(false);

    closeTimerRef.current = window.setTimeout(() => {
      setVisible(false);
      setClosing(false);
      closeTimerRef.current = null;
    }, PANEL_CLOSE_MS);
  }, [closing]);

  const handleOpen = useCallback(() => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setClosing(false);
    setVisible(true);
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open || isAdmin) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        handleClose();
      }
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, isAdmin, handleClose]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  if (isAdmin) {
    return null;
  }

  function togglePanel() {
    if (open) {
      handleClose();
      return;
    }

    handleOpen();
  }

  function handleOpenWhatsApp() {
    openWhatsAppContact(buildWhatsAppContactUrl(message));
    handleClose();
  }

  return (
    <div
      ref={panelRef}
      className={`fixed z-50 flex flex-col items-end gap-3 ${positionClass}`}
    >
      {visible ? (
        <div
          className={`site-chat-panel w-[min(100vw-2.5rem,20rem)] overflow-hidden rounded-2xl border border-white/[0.08] bg-panel shadow-[0_16px_48px_rgba(0,0,0,0.45)] ${
            closing ? "site-chat-panel--closing" : ""
          }`}
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] bg-[#25D366] px-4 py-3 text-white">
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-wider">
                WhatsApp Ventas
              </p>
              <p className="mt-0.5 text-xs text-white/85">
                Respondemos a la brevedad
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg p-1 text-white/90 transition-colors hover:bg-white/10"
              aria-label="Cerrar WhatsApp"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4 px-4 py-4">
            <div className="rounded-xl bg-background/70 px-3 py-2.5 text-sm leading-relaxed text-steel-mid">
              <MessageCircle
                className="mb-2 h-4 w-4 text-[#25D366]"
                aria-hidden
              />
              Escriba su consulta y continúe en WhatsApp con nuestro equipo.
            </div>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-widest text-steel-dark">
                Mensaje
              </span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={4}
                maxLength={500}
                className="industrial-input resize-none text-sm"
              />
            </label>

            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#20bd5a]"
            >
              <WhatsAppIcon />
              Abrir WhatsApp
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={togglePanel}
        aria-expanded={open}
        aria-label={open ? "Cerrar WhatsApp" : "Abrir WhatsApp"}
        className={`site-chat-launcher flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          open ? "site-chat-launcher--open" : ""
        }`}
      >
        {open ? (
          <X className="h-6 w-6" strokeWidth={2.25} />
        ) : (
          <WhatsAppIcon />
        )}
      </button>
    </div>
  );
}
