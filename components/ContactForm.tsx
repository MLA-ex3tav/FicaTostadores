"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "@/components/contact-phone.css";
import flags from "react-phone-number-input/flags";
import es from "react-phone-number-input/locale/es";
import PhoneCountrySelect from "@/components/PhoneCountrySelect";
import { useQuoteSelection } from "@/lib/quote-selection";
import {
  buildQuoteWhatsAppUrl,
  openWhatsAppContact,
} from "@/lib/quoting";
import { SLUG_PATTERN, sanitizeText } from "@/lib/sanitize";
import SteelPanel from "./SteelPanel";

export default function ContactForm() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("producto");
  const { products, addProduct, clearProducts } = useQuoteSelection();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState<string | undefined>();
  const [message, setMessage] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!productId || !SLUG_PATTERN.test(productId)) {
      return;
    }

    void fetch(`/api/products/${encodeURIComponent(productId)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { product?: { id: string; name: string; capacity: string } } | null) => {
        if (!data?.product) {
          return;
        }

        addProduct({
          id: data.product.id,
          name: data.product.name,
          capacity: data.product.capacity,
          selectedAddOns: [],
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
    setSubmitError("");

    const safeName = sanitizeText(name, 120, { required: true }) ?? "";
    const safeMessage = sanitizeText(message, 1000) ?? "";

    if (!safeName) {
      setSubmitError("Ingrese un nombre válido.");
      return;
    }

    const whatsAppUrl = buildQuoteWhatsAppUrl(
      safeName,
      phone,
      safeMessage,
      products.length > 0
        ? products.map((product) => ({
            name: product.name,
            capacity: product.capacity,
            selectedAddOns: product.selectedAddOns,
          }))
        : undefined,
    );

    try {
      openWhatsAppContact(whatsAppUrl);
      clearProducts();
    } catch {
      setSubmitError(
        "No se pudo abrir WhatsApp. Verifique que no tenga bloqueados los popups o intente de nuevo.",
      );
    }
  }

  const introText = (
    <>
      Complete sus datos y le abriremos WhatsApp para enviar la cotización.
      {products.length === 0 && " También puede agregar productos desde el catálogo."}
    </>
  );

  return (
    <SteelPanel className="min-w-0 w-full max-md:p-5">
      <div className="mb-8 space-y-3 border-b border-white/[0.06] pb-6 md:hidden">
        <h2 className="font-display text-2xl tracking-wide text-steel-light">
          Formulario de cotización
        </h2>
        <p className="text-base leading-relaxed text-steel-mid">{introText}</p>
      </div>

      <p className="mb-6 hidden text-sm text-steel-mid md:block">{introText}</p>

      <form
        onSubmit={handleSubmit}
        className="min-w-0 w-full space-y-7 md:space-y-6"
        noValidate
      >
        <fieldset className="min-w-0 w-full space-y-7 md:space-y-6">
          <legend className="sr-only">Datos de contacto</legend>

          <div>
            <label
              htmlFor="name"
              className="mb-2.5 block text-sm font-medium uppercase tracking-widest text-steel-mid md:mb-2 md:text-xs md:font-normal"
            >
              Nombre
            </label>
            <input
              id="name"
              type="text"
              required
              maxLength={120}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Su nombre completo"
              className="industrial-input max-md:min-h-12 max-md:text-base"
            />
          </div>

          <div className="min-w-0">
            <label
              htmlFor="phone"
              className="mb-2.5 block text-sm font-medium uppercase tracking-widest text-steel-mid md:mb-2 md:text-xs md:font-normal"
            >
              WhatsApp / teléfono
            </label>
            <div className="min-w-0 w-full">
              <PhoneInput
                id="phone"
                defaultCountry="CL"
                labels={es}
                flags={flags}
                countrySelectComponent={PhoneCountrySelect}
                placeholder="912345678"
                value={phone}
                onChange={setPhone}
                className="phone-input-wrapper"
              />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-steel-dark md:mt-1.5 md:text-xs">
              Ingrese solo el número local, sin repetir el código del país.
            </p>
            {phoneError ? (
              <p className="mt-2 text-sm text-orange md:mt-1 md:text-xs">{phoneError}</p>
            ) : null}
            {phone && !isPhoneValid && !phoneError ? (
              <p className="mt-2 text-sm text-steel-dark md:mt-1 md:text-xs">
                Verifique que el número sea correcto.
              </p>
            ) : null}
          </div>
        </fieldset>

        <div className="border-t border-white/[0.06] pt-7 md:border-t-0 md:pt-0">
          <label
            htmlFor="message"
            className="mb-2.5 block text-sm font-medium uppercase tracking-widest text-steel-mid md:mb-2 md:text-xs md:font-normal"
          >
            Mensaje <span className="text-steel-dark">(opcional)</span>
          </label>
          <textarea
            id="message"
            rows={4}
            maxLength={1000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              products.length > 0
                ? "Detalles adicionales sobre su consulta..."
                : "Cuéntenos qué equipo necesita o su consulta..."
            }
            className="industrial-input max-md:min-h-24 max-md:text-base resize-y"
          />
        </div>

        {submitError ? (
          <p className="text-base text-orange md:text-sm">{submitError}</p>
        ) : null}

        <button
          type="submit"
          disabled={!name || !isPhoneValid}
          className="min-h-12 w-full rounded-xl bg-orange py-4 text-base font-semibold uppercase tracking-wider text-white transition-colors hover:bg-orange-hover disabled:cursor-not-allowed disabled:opacity-40 md:min-h-0 md:py-3 md:text-sm"
        >
          Cotizar por WhatsApp
        </button>

        <p className="text-center text-sm leading-relaxed text-steel-dark md:text-xs">
          Al enviar, acepta nuestros{" "}
          <Link href="/terminos" className="text-orange hover:underline">
            Términos y condiciones
          </Link>{" "}
          y la{" "}
          <Link href="/privacidad" className="text-orange hover:underline">
            Política de privacidad
          </Link>
          .
        </p>
      </form>
    </SteelPanel>
  );
}
