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

export default function ContactForm() {
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
  const [phoneError, setPhoneError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);

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
    if (usesGoogleEmail) {
      return sanitizeText(googleEmail, 200) ?? "";
    }

    return sanitizeText(email, 200) ?? "";
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

      openWhatsAppContact(
        buildQuoteWhatsAppUrl(
          safeName,
          phone,
          safeMessage,
          submittedProducts,
          {
            requestId: submittedRequestId ?? undefined,
            email: safeEmail || undefined,
          },
        ),
      );

      setSubmitSuccess(true);
      setRequestId(submittedRequestId);
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
          onSendAnother={() => {
            setSubmitSuccess(false);
            setRequestId(null);
          }}
        />
      </section>
    );
  }

  return (
    <section className="min-w-0 w-full rounded-lg border border-white/[0.06] bg-panel/40 px-4 py-6 sm:px-5 sm:py-7">
      <p className="mb-6 text-sm leading-relaxed text-steel-mid">{introText}</p>

      <form
        onSubmit={handleSubmit}
        className="min-w-0 w-full space-y-7 md:space-y-6"
        noValidate
      >
        <fieldset className="min-w-0 w-full space-y-7 md:space-y-6">
          <legend className="sr-only">Datos de contacto</legend>

          <div>
            <label htmlFor="name" className={fieldLabelClass}>
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

          <div>
            {usesGoogleEmail ? (
              <p className="rounded-lg border border-steel-dark/30 bg-background/60 px-4 py-3 text-sm leading-relaxed text-steel-mid">
                Correo de contacto:{" "}
                <strong className="text-steel-light">{googleEmail}</strong>
              </p>
            ) : (
              <>
                <label htmlFor="email" className={fieldLabelClass}>
                  Correo <span className="text-steel-dark">(opcional)</span>
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
              </>
            )}
          </div>

          <div className="min-w-0">
            <label htmlFor="phone" className={fieldLabelClass}>
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

        <fieldset className="min-w-0 w-full space-y-7 border-t border-white/[0.06] pt-7 md:space-y-6 md:pt-6">
          <legend className="mb-1 font-display text-lg tracking-wide text-steel-light md:text-base">
            Datos de envío{" "}
            <span className="text-sm font-normal normal-case text-steel-dark">
              (opcional)
            </span>
          </legend>
          <p className="text-sm leading-relaxed text-steel-mid">
            Si necesita despacho del equipo, indique la dirección de entrega.
          </p>

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

          <div className="grid gap-7 md:grid-cols-2 md:gap-6">
            <div>
              <label htmlFor="city" className={fieldLabelClass}>
                Comuna / ciudad
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

          <div className="grid gap-7 md:grid-cols-2 md:gap-6">
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

        <div className="border-t border-white/[0.06] pt-7 md:pt-6">
          <label htmlFor="message" className={fieldLabelClass}>
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

        {user ? (
          <label className="flex items-start gap-3 rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm leading-relaxed text-steel-mid">
            <input
              type="checkbox"
              checked={saveProfileForFuture}
              onChange={(event) => setSaveProfileForFuture(event.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-orange"
            />
            <span>
              Guardar nombre, contacto
              {shippingFilled ? " y dirección de envío" : ""} para futuras
              cotizaciones en esta cuenta de Google.
            </span>
          </label>
        ) : null}

        {submitError ? (
          <p className="text-base text-orange md:text-sm">{submitError}</p>
        ) : null}

        <button
          type="submit"
          disabled={!name || !isPhoneValid || isSubmitting}
          className="min-h-12 w-full rounded-xl bg-orange py-4 text-base font-semibold uppercase tracking-wider text-white transition-colors hover:bg-orange-hover disabled:cursor-not-allowed disabled:opacity-40 md:min-h-0 md:py-3 md:text-sm"
        >
          {isSubmitting ? "Enviando solicitud..." : "Enviar solicitud de cotización"}
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
    </section>
  );
}
