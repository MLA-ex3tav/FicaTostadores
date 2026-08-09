"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "@/components/contact-phone.css";
import flags from "react-phone-number-input/flags";
import es from "react-phone-number-input/locale/es";
import CustomSelect from "@/components/CustomSelect";
import PhoneCountrySelect from "@/components/PhoneCountrySelect";
import { AMERICA_COUNTRIES } from "@/lib/phone-countries";
import QuoteSentAnimation from "@/components/QuoteSentAnimation";
import { getCatalogLabel } from "@/lib/catalog-config";
import { getClienteShippingProfile } from "@/lib/auth-sync-client";
import { useFirebaseAuth } from "@/lib/firebase-auth";
import type { Product } from "@/lib/products";
import {
  buildTechnicalServiceWhatsAppUrl,
  openWhatsAppContact,
} from "@/lib/quoting";
import { SLUG_PATTERN, sanitizeText } from "@/lib/sanitize";
import {
  getTechnicalIssueCategoryLabel,
  TECHNICAL_ISSUE_CATEGORIES,
  type TechnicalIssueCategoryId,
} from "@/lib/soporte-tecnico/issue-categories";

const OTHER_EQUIPMENT_VALUE = "__otro_equipo__";

const fieldLabelClass =
  "mb-2.5 block text-sm font-medium uppercase tracking-widest text-steel-mid md:mb-2 md:text-xs md:font-normal";

const issueCategoryOptions = TECHNICAL_ISSUE_CATEGORIES.map((category) => ({
  value: category.id,
  label: category.label,
}));

interface TechnicalServiceFormProps {
  products: Product[];
}

function buildProductSelectOptions(products: Product[]) {
  const sorted = [...products].sort((left, right) => {
    const catalogCompare = left.catalog.localeCompare(right.catalog, "es");

    if (catalogCompare !== 0) {
      return catalogCompare;
    }

    return left.name.localeCompare(right.name, "es");
  });

  return [
    ...sorted.map((product) => ({
      value: product.id,
      label: `${product.name} — ${getCatalogLabel(product.catalog)}`,
    })),
    { value: OTHER_EQUIPMENT_VALUE, label: "Otro equipo (no listado)" },
  ];
}

export default function TechnicalServiceForm({
  products,
}: TechnicalServiceFormProps) {
  const searchParams = useSearchParams();
  const productId = searchParams.get("producto");
  const { user, loading: authLoading, adminFetch } = useFirebaseAuth();
  const profileLoadedRef = useRef(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<string | undefined>();
  const [selectedEquipmentId, setSelectedEquipmentId] = useState("");
  const [customEquipmentModel, setCustomEquipmentModel] = useState("");
  const [issueCategory, setIssueCategory] =
    useState<TechnicalIssueCategoryId>("falla_operativa");
  const [issueDescription, setIssueDescription] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [whatsAppUrl, setWhatsAppUrl] = useState<string | null>(null);
  const [quotedProducts, setQuotedProducts] = useState<
    { productId: string; name: string; count: number }[]
  >([]);
  const [quotedLoaded, setQuotedLoaded] = useState(false);

  const productSelectOptions = useMemo(
    () => buildProductSelectOptions(products),
    [products],
  );

  const productsById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const isOtherEquipment = selectedEquipmentId === OTHER_EQUIPMENT_VALUE;
  const selectedProduct = selectedEquipmentId
    ? productsById.get(selectedEquipmentId)
    : undefined;

  useEffect(() => {
    if (!productId || !SLUG_PATTERN.test(productId)) {
      return;
    }

    if (!productsById.has(productId)) {
      return;
    }

    setSelectedEquipmentId(productId);
  }, [productId, productsById]);

  useEffect(() => {
    if (authLoading || !user || profileLoadedRef.current) {
      return;
    }

    profileLoadedRef.current = true;

    void getClienteShippingProfile(user.uid).then((profile) => {
      if (profile?.contactName) {
        setName(profile.contactName);
      }

      if (profile?.phone) {
        setPhone(profile.phone);
      }

      if (profile?.email) {
        setEmail(profile.email);
      } else if (user.email) {
        setEmail(user.email);
      }
    });
  }, [authLoading, user]);

  // Si el usuario tiene cuenta, sugerimos los equipos que ya cotizó.
  useEffect(() => {
    if (authLoading || !user || quotedLoaded) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const response = await adminFetch("/api/cotizaciones/mis-solicitudes");
        const data = (await response.json()) as {
          solicitudes?: {
            products?: {
              productId: string | null;
              name: string;
            }[];
          }[];
          error?: string;
        };

        if (!response.ok || !data.solicitudes) {
          return;
        }

        const counts = new Map<string, { name: string; count: number }>();

        for (const solicitud of data.solicitudes) {
          for (const product of solicitud.products ?? []) {
            if (!product?.productId) continue;
            const entry = counts.get(product.productId);
            if (entry) {
              entry.count += 1;
            } else {
              counts.set(product.productId, {
                name: product.name,
                count: 1,
              });
            }
          }
        }

        if (cancelled) return;

        const listed = Array.from(counts.entries()).map(
          ([productId, { name, count }]) => ({
            productId,
            name,
            count,
          }),
        );

        setQuotedProducts(listed);

        // Preselecciona el primer equipo cotizado que exista en el catálogo,
        // a menos que ya venga uno por query param.
        if (listed.length > 0 && !productId) {
          const first = listed.find((item) => productsById.has(item.productId));
          if (first) {
            setSelectedEquipmentId(first.productId);
          }
        }
      } catch {
        // Sin conexión o sin permisos: simplemente no hay sugerencia.
      } finally {
        if (!cancelled) {
          setQuotedLoaded(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, adminFetch, productId, productsById, quotedLoaded]);

  const googleEmail = user?.email?.trim() ?? "";
  const usesGoogleEmail = Boolean(googleEmail);
  const isPhoneValid = phone ? isValidPhoneNumber(phone) : false;

  function resolveSubmitEmail(): string {
    const typedEmail = sanitizeText(email, 200) ?? "";
    if (typedEmail) {
      return typedEmail;
    }

    return sanitizeText(googleEmail, 200) ?? "";
  }

  function resetForm() {
    setSelectedEquipmentId("");
    setCustomEquipmentModel("");
    setIssueCategory("falla_operativa");
    setIssueDescription("");
    setPhoneError("");
    setSubmitError("");
  }

  function resolveEquipmentModel(): {
    equipmentModel: string;
    linkedProductId: string | null;
  } | null {
    if (!selectedEquipmentId) {
      return null;
    }

    if (isOtherEquipment) {
      const trimmed = customEquipmentModel.trim();

      if (!trimmed) {
        return null;
      }

      return { equipmentModel: trimmed, linkedProductId: null };
    }

    const product = productsById.get(selectedEquipmentId);

    if (!product) {
      return null;
    }

    return {
      equipmentModel: product.name,
      linkedProductId: product.id,
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!phone || !isValidPhoneNumber(phone)) {
      setPhoneError("Ingrese un número de teléfono válido.");
      return;
    }

    const safeName = sanitizeText(name, 120, { required: true }) ?? "";
    const resolvedEquipment = resolveEquipmentModel();
    const safeIssueDescription =
      sanitizeText(issueDescription, 2000, { required: true }) ?? "";
    const safeEmail = resolveSubmitEmail();

    if (!safeName) {
      setSubmitError("Ingrese un nombre válido.");
      return;
    }

    if (!resolvedEquipment) {
      setSubmitError(
        isOtherEquipment
          ? "Indique el modelo del equipo."
          : "Seleccione el equipo de la lista.",
      );
      return;
    }

    const { equipmentModel: safeEquipmentModel, linkedProductId } =
      resolvedEquipment;

    if (!safeIssueDescription) {
      setSubmitError("Describa la falla o lo que necesita.");
      return;
    }

    setPhoneError("");
    setSubmitError("");
    setSubmitSuccess(false);
    setRequestId(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/soporte-tecnico/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: safeName,
          phone,
          email: safeEmail || undefined,
          equipmentModel: safeEquipmentModel,
          productId: linkedProductId ?? undefined,
          issueCategory,
          issueDescription: safeIssueDescription,
          clientUserId: user?.uid,
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        id?: string;
        error?: string;
      };

      if (!response.ok) {
        setSubmitError(
          data.error ??
            "No se pudo enviar la solicitud. Intente de nuevo en unos minutos.",
        );
        return;
      }

      const submittedRequestId = data.id ?? null;
      const issueCategoryLabel = getTechnicalIssueCategoryLabel(issueCategory);

      const waUrl = buildTechnicalServiceWhatsAppUrl(
        safeName,
        phone,
        {
          equipmentModel: safeEquipmentModel,
          issueCategoryLabel,
          issueDescription: safeIssueDescription,
        },
        {
          requestId: submittedRequestId ?? undefined,
          email: safeEmail || undefined,
        },
      );

      setWhatsAppUrl(waUrl);
      setSubmitSuccess(true);
      setRequestId(submittedRequestId);
      resetForm();
    } catch {
      setSubmitError(
        "No se pudo conectar con el servidor. Verifique su conexión e intente de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitSuccess) {
    return (
      <section className="mx-auto w-full rounded-lg border border-white/[0.06] bg-panel/40 px-4 py-8 sm:px-6">
        <QuoteSentAnimation
          requestId={requestId}
          whatsAppUrl={whatsAppUrl}
          sendingStatus="Enviando solicitud técnica…"
          arrivedSubtitle="Nuestro equipo técnico la revisará pronto"
          title="Solicitud técnica enviada"
          description="Recibimos su reporte. Puede continuar la conversación por WhatsApp con soporte técnico si lo desea."
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
    <section className="min-w-0 w-full rounded-lg border border-white/[0.06] bg-panel/40 px-4 py-6 sm:px-5 sm:py-7">
      <form
        onSubmit={handleSubmit}
        className="min-w-0 w-full space-y-7 md:space-y-6"
        noValidate
      >
        <fieldset className="min-w-0 w-full space-y-7 md:space-y-6">
          <legend className="mb-1 font-display text-lg tracking-wide text-steel-light md:text-base">
            Equipo y problema
          </legend>

          {quotedProducts.length > 0 ? (
            <div className="rounded-xl border border-orange/30 bg-orange/10 p-4">
              <p className="text-sm font-semibold text-orange">
                Detectamos tu equipo
              </p>
              <p className="mt-1 text-sm leading-relaxed text-steel-mid">
                Vimos que cotizaste{" "}
                {quotedProducts.length === 1
                  ? `${quotedProducts[0].name}`
                  : "alguno de estos equipos"}
                . ¿Es el que está fallando? Lo seleccionamos por ti.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {quotedProducts.map((quoted) => {
                  const exists = productsById.has(quoted.productId);
                  const isActive = selectedEquipmentId === quoted.productId;
                  return (
                    <button
                      key={quoted.productId}
                      type="button"
                      onClick={() => {
                        if (exists) {
                          setSelectedEquipmentId(quoted.productId);
                        }
                      }}
                      disabled={!exists}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        isActive
                          ? "border-orange bg-orange text-white"
                          : "border-steel-dark/30 bg-background/60 text-steel-light hover:border-orange/50"
                      } ${exists ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
                    >
                      {quoted.name}
                      {quoted.count > 1 ? (
                        <span className="rounded-full bg-white/10 px-1.5 text-[10px]">
                          ×{quoted.count}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div>
            <label htmlFor="equipmentModel" className={fieldLabelClass}>
              Equipo / modelo
            </label>
            <CustomSelect
              id="equipmentModel"
              value={selectedEquipmentId}
              onChange={setSelectedEquipmentId}
              options={productSelectOptions}
              placeholder="Seleccione su equipo"
              aria-label="Equipo o modelo"
              searchable
            />
            {isOtherEquipment ? (
              <input
                id="customEquipmentModel"
                type="text"
                required
                maxLength={200}
                value={customEquipmentModel}
                onChange={(event) =>
                  setCustomEquipmentModel(event.target.value)
                }
                placeholder="Indique marca, modelo o capacidad"
                className="industrial-input mt-3 max-md:min-h-12 max-md:text-base"
              />
            ) : selectedProduct ? (
              <p className="mt-2 text-xs text-steel-dark">
                {selectedProduct.capacity}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="issueCategory" className={fieldLabelClass}>
              Tipo de solicitud
            </label>
            <CustomSelect
              id="issueCategory"
              value={issueCategory}
              onChange={(value) =>
                setIssueCategory(value as TechnicalIssueCategoryId)
              }
              options={issueCategoryOptions}
              aria-label="Tipo de solicitud"
            />
          </div>

          <div>
            <label htmlFor="issueDescription" className={fieldLabelClass}>
              ¿Qué falló o qué necesita?
            </label>
            <textarea
              id="issueDescription"
              required
              rows={5}
              maxLength={2000}
              value={issueDescription}
              onChange={(event) => setIssueDescription(event.target.value)}
              placeholder="Describa síntomas, códigos de error, desde cuándo ocurre, etc."
              className="industrial-input min-h-[8rem] resize-y max-md:text-base"
            />
          </div>
        </fieldset>

        <fieldset className="min-w-0 w-full space-y-7 border-t border-white/[0.06] pt-7 md:space-y-6 md:pt-6">
          <legend className="mb-1 font-display text-lg tracking-wide text-steel-light md:text-base">
            Datos de contacto
          </legend>

          <div className="grid min-w-0 w-full grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-2">
            <div className="min-w-0">
              <label htmlFor="technical-name" className={fieldLabelClass}>
                Nombre
              </label>
              <input
                id="technical-name"
                type="text"
                required
                maxLength={120}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Su nombre completo"
                className="industrial-input max-md:min-h-12 max-md:text-base"
              />
            </div>

            <div className="min-w-0">
              <label htmlFor="technical-email" className={fieldLabelClass}>
                Correo <span className="text-steel-dark">(opcional)</span>
              </label>
              <input
                id="technical-email"
                type="email"
                maxLength={200}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="correo@ejemplo.com"
                className="industrial-input max-md:min-h-12 max-md:text-base"
              />
              {usesGoogleEmail ? (
                <p className="mt-1.5 text-xs text-steel-dark">
                  Autocompletado desde tu cuenta. Puedes editarlo si lo necesitas.
                </p>
              ) : null}
            </div>

            <div className="min-w-0 md:col-span-2">
              <label htmlFor="technical-phone" className={fieldLabelClass}>
                WhatsApp / teléfono
              </label>
              <div className="min-w-0 w-full">
              <PhoneInput
                id="technical-phone"
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
                <p className="mt-2 text-sm text-orange md:mt-1 md:text-xs">
                  {phoneError}
                </p>
              ) : null}
              {phone && !isPhoneValid && !phoneError ? (
                <p className="mt-2 text-sm text-steel-dark md:mt-1 md:text-xs">
                  Verifique que el número sea correcto.
                </p>
              ) : null}
            </div>
          </div>
        </fieldset>

        {submitError ? (
          <p className="text-sm text-orange" role="alert">
            {submitError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-orange px-5 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-orange-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Enviando solicitud…" : "Enviar solicitud técnica"}
        </button>
      </form>
    </section>
  );
}
