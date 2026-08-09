"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "@/components/contact-phone.css";
import flags from "react-phone-number-input/flags";
import es from "react-phone-number-input/locale/es";
import PhoneCountrySelect from "@/components/PhoneCountrySelect";
import { AMERICA_COUNTRIES } from "@/lib/phone-countries";
import QuoteSentAnimation from "@/components/QuoteSentAnimation";
import {
  getClienteShippingProfile,
  saveClienteShippingProfile,
} from "@/lib/auth-sync-client";
import { useFirebaseAuth } from "@/lib/firebase-auth";
import { buildQuoteProductItem } from "@/lib/quote-product";
import type { Product } from "@/lib/products";
import {
  buildQuoteWhatsAppUrl,
  openWhatsAppContact,
} from "@/lib/quoting";
import { SLUG_PATTERN, sanitizeText } from "@/lib/sanitize";
import {
  hasShippingInfo,
  sanitizeShippingInfo,
  type ClienteShippingProfile,
  type ShippingInfo,
} from "@/lib/shipping-profile";
import { useQuoteSelection } from "@/lib/quote-selection";

const fieldLabelClass =
  "mb-2.5 block text-sm font-medium uppercase tracking-widest text-steel-mid md:mb-2 md:text-xs md:font-normal";

function buildShippingPayload(fields: {
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}): ShippingInfo | null {
  return sanitizeShippingInfo({
    addressLine1: fields.addressLine1,
    addressLine2: fields.addressLine2,
    city: fields.city,
    region: fields.region,
    postalCode: fields.postalCode,
    country: fields.country || "Chile",
  });
}

function buildProfilePayload(
  contact: { name: string; phone: string; email: string },
  shipping: ShippingInfo | null,
): ClienteShippingProfile {
  return {
    contactName: contact.name,
    phone: contact.phone,
    email: contact.email || null,
    addressLine1: shipping?.addressLine1 ?? null,
    addressLine2: shipping?.addressLine2 ?? null,
    city: shipping?.city ?? null,
    region: shipping?.region ?? null,
    postalCode: shipping?.postalCode ?? null,
    country: shipping?.country ?? "Chile",
  };
}

interface ContactFormProps {
  formId?: string;
  hideSubmitButton?: boolean;
  onSuccess?: (requestId: string | null, whatsAppUrl?: string) => void;
}

export default function ContactForm({
  formId = "solicitud-cotizacion-form",
  hideSubmitButton = false,
  onSuccess,
}: ContactFormProps) {
  const searchParams = useSearchParams();
  const productId = searchParams.get("producto");
  const { products, addProduct, clearProducts } = useQuoteSelection();
  const { user, loading: authLoading } = useFirebaseAuth();
  const profileLoadedRef = useRef(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<string | undefined>();
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Chile");
  const [message, setMessage] = useState("");
  const [saveProfileForFuture, setSaveProfileForFuture] = useState(false);
  const [showShippingFields, setShowShippingFields] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [whatsAppUrl, setWhatsAppUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!productId || !SLUG_PATTERN.test(productId)) {
      return;
    }

    void fetch(`/api/products/${encodeURIComponent(productId)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { product?: Product } | null) => {
        if (!data?.product) {
          return;
        }

        addProduct(buildQuoteProductItem(data.product, []));
      });
  }, [productId, addProduct]);

  useEffect(() => {
    if (authLoading || !user || profileLoadedRef.current) {
      return;
    }

    profileLoadedRef.current = true;

    void getClienteShippingProfile(user.uid).then((profile) => {
      if (profile?.contactName) {
        setName(profile.contactName);
      } else if (user.displayName) {
        setName(user.displayName);
      }

      if (profile?.phone) {
        setPhone(profile.phone);
      }

      if (profile?.email) {
        setEmail(profile.email);
      } else if (user.email) {
        setEmail(user.email);
      }

      if (profile?.addressLine1) {
        setAddressLine1(profile.addressLine1);
      }

      if (profile?.addressLine2) {
        setAddressLine2(profile.addressLine2);
      }

      if (profile?.city) {
        setCity(profile.city);
      }

      if (profile?.region) {
        setRegion(profile.region);
      }

      if (profile?.postalCode) {
        setPostalCode(profile.postalCode);
      }

      if (profile?.country) {
        setCountry(profile.country);
      }
    });
  }, [authLoading, user]);

  useEffect(() => {
    if (!user) {
      profileLoadedRef.current = false;
      setSaveProfileForFuture(false);
    }
  }, [user]);

  const isPhoneValid = Boolean(phone && isValidPhoneNumber(phone));
  const googleEmail = user?.email?.trim() ?? "";
  const usesGoogleEmail = Boolean(googleEmail);

  function resolveSubmitEmail(): string {
    const typedEmail = sanitizeText(email, 200) ?? "";
    if (typedEmail) {
      return typedEmail;
    }

    return sanitizeText(googleEmail, 200) ?? "";
  }

  function resetForm() {
    setName("");
    setEmail("");
    setPhone(undefined);
    setAddressLine1("");
    setAddressLine2("");
    setCity("");
    setRegion("");
    setPostalCode("");
    setCountry("Chile");
    setMessage("");
    setSaveProfileForFuture(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!phone || !isValidPhoneNumber(phone)) {
      setPhoneError("Ingrese un número de teléfono válido.");
      return;
    }

    setPhoneError("");
    setSubmitError("");
    setSubmitSuccess(false);
    setRequestId(null);

    const safeName = sanitizeText(name, 120, { required: true }) ?? "";
    const safeMessage = sanitizeText(message, 1000) ?? "";
    const safeEmail = resolveSubmitEmail();

    if (!safeName) {
      setSubmitError("Ingrese un nombre válido.");
      return;
    }

    const shipping = buildShippingPayload({
      addressLine1,
      addressLine2,
      city,
      region,
      postalCode,
      country,
    });

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/cotizaciones/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: safeName,
          phone,
          email: safeEmail || undefined,
          message: safeMessage || undefined,
          clientUserId: user?.uid,
          shipping: shipping ?? undefined,
          products: products.map((product) => ({
            id: product.id,
            name: product.name,
            capacity: product.capacity,
            selectedColor: product.selectedColor ?? undefined,
            selectedColorId: product.selectedColorId ?? undefined,
            selectedAddOns: product.selectedAddOns?.map((addOn) => ({
              id: addOn.id,
              name: addOn.name,
            })),
          })),
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        id?: string;
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        setSubmitError(
          data.error ??
            "No se pudo enviar la solicitud. Intente de nuevo en unos minutos.",
        );
        return;
      }

      if (user && saveProfileForFuture) {
        await saveClienteShippingProfile(
          user,
          buildProfilePayload(
            { name: safeName, phone, email: safeEmail || googleEmail },
            shipping,
          ),
        );
      }

      const submittedProducts = products.map((product) => ({
        name: product.name,
        capacity: product.capacity,
        selectedColor: product.selectedColor ?? undefined,
        selectedColorId: product.selectedColorId ?? undefined,
        selectedAddOns: product.selectedAddOns?.map((addOn) => ({
          id: addOn.id,
          name: addOn.name,
        })),
      }));

      const submittedRequestId = data.id ?? null;

      const waUrl = buildQuoteWhatsAppUrl(
        safeName,
        phone,
        safeMessage,
        submittedProducts,
        {
          requestId: submittedRequestId ?? undefined,
          email: safeEmail || undefined,
        },
      );

      setWhatsAppUrl(waUrl);
      setSubmitSuccess(true);
      setRequestId(submittedRequestId);
      if (onSuccess) {
        onSuccess(submittedRequestId, waUrl);
      }
      resetForm();
      clearProducts();
    } catch {
      setSubmitError(
        "No se pudo conectar con el servidor. Verifique su conexión e intente de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const introText = (
    <>
      Complete sus datos y el equipo recibirá su solicitud al instante para
      preparar la cotización.
      {products.length === 0 && " También puede agregar productos desde el catálogo."}
    </>
  );

  const shippingFilled = hasShippingInfo({
    addressLine1: addressLine1 || null,
    addressLine2: addressLine2 || null,
    city: city || null,
    region: region || null,
    postalCode: postalCode || null,
    country: country || null,
  });

  if (submitSuccess) {
    return (
      <section className="mx-auto w-full rounded-lg border border-white/[0.06] bg-panel/40 px-4 py-8 sm:px-6">
        <QuoteSentAnimation
          requestId={requestId}
          whatsAppUrl={whatsAppUrl}
          onSendAnother={() => {
            setSubmitSuccess(false);
            setRequestId(null);
            setWhatsAppUrl(null);
          }}
        />
      </section>
    );
  }

  return (
    <section className="min-w-0 w-full rounded-2xl border border-white/[0.08] bg-panel p-6 sm:p-8 shadow-xl shadow-black/30">
      <div className="mb-6 flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div>
          <h2 className="font-display text-2xl uppercase tracking-wide text-steel-light">
            Datos de Solicitud
          </h2>
          <p className="mt-1 text-xs text-steel-mid">
            Complete sus datos para recibir la propuesta comercial oficial.
          </p>
        </div>
      </div>

      <form
        id={formId}
        onSubmit={handleSubmit}
        className="min-w-0 w-full space-y-6"
        noValidate
      >
        <fieldset className="min-w-0 w-full space-y-6">
          <legend className="sr-only">Datos de contacto</legend>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="name" className={fieldLabelClass}>
                Nombre Completo *
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
              <label htmlFor="phone" className={fieldLabelClass}>
                WhatsApp / Teléfono *
              </label>
              <div className="min-w-0 w-full">
                <PhoneInput
                  id="phone"
                  defaultCountry="CL"
                  countries={AMERICA_COUNTRIES}
                  labels={es}
                  flags={flags}
                  countrySelectComponent={PhoneCountrySelect}
                  placeholder="912345678"
                  value={phone}
                  onChange={setPhone}
                  className="phone-input-wrapper"
                />
              </div>
              {phoneError ? (
                <p className="mt-1.5 text-xs text-orange">{phoneError}</p>
              ) : null}
            </div>
          </div>

          <div>
            <label htmlFor="email" className={fieldLabelClass}>
              Correo Electrónico{" "}
              <span className="text-steel-dark">(opcional)</span>
            </label>
            <input
              id="email"
              type="email"
              maxLength={200}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="industrial-input max-md:min-h-12 max-md:text-base"
            />
            {usesGoogleEmail ? (
              <p className="mt-1.5 text-xs text-steel-dark">
                Autocompletado desde tu cuenta. Puedes editarlo si lo necesitas.
              </p>
            ) : null}
          </div>
        </fieldset>

        {/* Optional Shipping Address Accordion / Toggle with Smooth Animation */}
        <div className="border-t border-white/[0.06] pt-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowShippingFields((prev) => !prev)}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange hover:underline focus:outline-none transition-colors"
              aria-expanded={showShippingFields}
            >
              {showShippingFields
                ? "− Ocultar datos de despacho"
                : "+ Agregar dirección de despacho o entrega (Opcional)"}
            </button>
          </div>

          <div
            className={`grid transition-all duration-300 ease-in-out ${
              showShippingFields
                ? "grid-rows-[1fr] opacity-100 mt-4"
                : "grid-rows-[0fr] opacity-0"
            }`}
            style={{ transitionProperty: "grid-template-rows, opacity, margin-top" }}
          >
            <div className="min-h-0 overflow-hidden">
              <fieldset className="min-w-0 w-full space-y-6 pt-2">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <legend className="font-display text-base uppercase tracking-wide text-steel-light">
                    Datos de Envío y Despacho
                  </legend>
                  <span className="text-[11px] text-steel-dark font-normal">
                    (Dirección de entrega de la maquinaria)
                  </span>
                </div>

                <div>
                  <label htmlFor="addressLine1" className={fieldLabelClass}>
                    Calle y número
                  </label>
                  <input
                    id="addressLine1"
                    type="text"
                    maxLength={200}
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="Av. Principal 1234"
                    className="industrial-input max-md:min-h-12 max-md:text-base"
                  />
                </div>

                <div>
                  <label htmlFor="addressLine2" className={fieldLabelClass}>
                    Depto / block / referencia{" "}
                    <span className="text-steel-dark">(opcional)</span>
                  </label>
                  <input
                    id="addressLine2"
                    type="text"
                    maxLength={120}
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="Depto 502, bodega 3, etc."
                    className="industrial-input max-md:min-h-12 max-md:text-base"
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="city" className={fieldLabelClass}>
                      Comuna / Ciudad
                    </label>
                    <input
                      id="city"
                      type="text"
                      maxLength={80}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Temuco"
                      className="industrial-input max-md:min-h-12 max-md:text-base"
                    />
                  </div>

                  <div>
                    <label htmlFor="region" className={fieldLabelClass}>
                      Región
                    </label>
                    <input
                      id="region"
                      type="text"
                      maxLength={80}
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="Araucanía"
                      className="industrial-input max-md:min-h-12 max-md:text-base"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="postalCode" className={fieldLabelClass}>
                      Código postal{" "}
                      <span className="text-steel-dark">(opcional)</span>
                    </label>
                    <input
                      id="postalCode"
                      type="text"
                      maxLength={20}
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="4780000"
                      className="industrial-input max-md:min-h-12 max-md:text-base"
                    />
                  </div>

                  <div>
                    <label htmlFor="country" className={fieldLabelClass}>
                      País
                    </label>
                    <input
                      id="country"
                      type="text"
                      maxLength={80}
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Chile"
                      className="industrial-input max-md:min-h-12 max-md:text-base"
                    />
                  </div>
                </div>
              </fieldset>
            </div>
          </div>
        </div>

        {/* Message / Specifications */}
        <div className="border-t border-white/[0.06] pt-6">
          <label htmlFor="message" className={fieldLabelClass}>
            Mensaje o requerimientos especiales <span className="text-steel-dark">(opcional)</span>
          </label>
          <textarea
            id="message"
            rows={3}
            maxLength={1000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              products.length > 0
                ? "Escriba aquí dudas sobre voltaje, instalación o requerimientos especiales de su proyecto..."
                : "Cuéntenos qué equipo necesita o su consulta..."
            }
            className="industrial-input max-md:min-h-20 max-md:text-base resize-y"
          />
        </div>

        {submitError ? (
          <p className="text-sm text-orange">{submitError}</p>
        ) : null}

        {!hideSubmitButton && (
          <button
            type="submit"
            disabled={!name || !isPhoneValid || isSubmitting}
            className="min-h-12 w-full rounded-xl bg-orange py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-all hover:bg-orange-hover shadow-lg shadow-orange/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
          </button>
        )}

        <p className="text-center text-xs text-steel-dark">
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
    </section>
  );
}
