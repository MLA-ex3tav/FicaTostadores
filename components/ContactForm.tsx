"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import es from "react-phone-number-input/locale/es";
import { useQuoteSelection } from "@/lib/quote-selection";
import {
  buildQuoteWhatsAppUrl,
  openWhatsAppContact,
} from "@/lib/quoting";
import SteelPanel from "./SteelPanel";

export default function ContactForm() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("producto");
  const { products, addProduct, clearProducts } = useQuoteSelection();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState<string | undefined>();
  const [message, setMessage] = useState("");
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    if (!productId) {
      return;
    }

    void fetch(`/api/products/${productId}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { product?: { id: string; name: string; capacity: string } } | null) => {
        if (!data?.product) {
          return;
        }

        addProduct({
          id: data.product.id,
          name: data.product.name,
          capacity: data.product.capacity,
        });
      });
  }, [productId, addProduct]);

  const isPhoneValid = Boolean(phone && isValidPhoneNumber(phone));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!phone || !isValidPhoneNumber(phone)) {
      setPhoneError("Ingrese un número de teléfono válido.");
      return;
    }

    setPhoneError("");
    openWhatsAppContact(
      buildQuoteWhatsAppUrl(
        name,
        phone,
        message,
        products.length > 0
          ? products.map((product) => ({
              name: product.name,
              capacity: product.capacity,
            }))
          : undefined,
      ),
    );
    clearProducts();
  }

  return (
    <SteelPanel>
      <p className="mb-6 text-sm text-steel-mid">
        Complete sus datos y le abriremos WhatsApp para enviar la cotización.
        {products.length === 0 && " También puede agregar productos desde el catálogo."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-xs uppercase tracking-widest text-steel-mid"
          >
            Nombre
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Su nombre completo"
            className="industrial-input"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="mb-2 block text-xs uppercase tracking-widest text-steel-mid"
          >
            WhatsApp / teléfono
          </label>
          <PhoneInput
            id="phone"
            international
            defaultCountry="CL"
            labels={es}
            placeholder="Ingrese su número"
            value={phone}
            onChange={setPhone}
            className="phone-input-wrapper"
          />
          {phoneError && (
            <p className="mt-1 text-xs text-orange">{phoneError}</p>
          )}
          {phone && !isPhoneValid && !phoneError && (
            <p className="mt-1 text-xs text-steel-dark">
              Verifique que el número sea correcto.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="message"
            className="mb-2 block text-xs uppercase tracking-widest text-steel-mid"
          >
            Mensaje <span className="text-steel-dark">(opcional)</span>
          </label>
          <textarea
            id="message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              products.length > 0
                ? "Detalles adicionales sobre su consulta..."
                : "Cuéntenos qué equipo necesita o su consulta..."
            }
            className="industrial-input resize-y"
          />
        </div>

        <button
          type="submit"
          disabled={!name || !isPhoneValid}
          className="w-full rounded-xl bg-orange py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-orange-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          Cotizar por WhatsApp
        </button>
      </form>
    </SteelPanel>
  );
}
