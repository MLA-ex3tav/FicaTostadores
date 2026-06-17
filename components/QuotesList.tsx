"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import SteelPanel from "@/components/SteelPanel";
import {
  fetchContactQuotes,
  formatQuoteDate,
  type ContactQuote,
} from "@/lib/contact-quotes";

export default function QuotesList() {
  const searchParams = useSearchParams();
  const justSent = searchParams.get("enviado") === "1";
  const [quotes, setQuotes] = useState<ContactQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadQuotes() {
      try {
        const data = await fetchContactQuotes();
        if (active) {
          setQuotes(data);
        }
      } catch {
        if (active) {
          setError("No se pudieron cargar las cotizaciones.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadQuotes();

    return () => {
      active = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-xl bg-panel" />
        ))}
      </div>
    );
  }

  return (
    <>
      {justSent && (
        <div
          className="mb-8 rounded-lg border border-orange/40 bg-orange/10 px-4 py-3 text-sm text-steel-light"
          role="status"
        >
          Consulta registrada. Si WhatsApp no se abrió, puede enviarla manualmente
          desde el botón de contacto.
        </div>
      )}

      {error && (
        <p className="mb-6 text-sm text-orange" role="alert">
          {error}
        </p>
      )}

      {quotes.length === 0 ? (
        <SteelPanel>
          <p className="text-sm text-steel-mid">
            Aún no hay cotizaciones registradas.
          </p>
          <Link
            href="/contacto"
            className="mt-4 inline-flex text-sm text-orange hover:text-orange-hover"
          >
            Solicitar cotización
          </Link>
        </SteelPanel>
      ) : (
        <div className="space-y-4">
          {quotes.map((quote) => (
            <SteelPanel key={quote.id} className="p-5 md:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-display text-lg tracking-wide text-steel-light">
                    {quote.name}
                  </p>
                  <p className="mt-1 text-sm text-orange">{quote.phone}</p>
                </div>
                <time
                  className="text-xs uppercase tracking-wider text-steel-dark"
                  dateTime={quote.createdAt?.toISOString()}
                >
                  {formatQuoteDate(quote.createdAt)}
                </time>
              </div>
              {quote.message && (
                <p className="mt-4 text-sm leading-relaxed text-steel-mid">
                  {quote.message}
                </p>
              )}
            </SteelPanel>
          ))}
        </div>
      )}
    </>
  );
}
