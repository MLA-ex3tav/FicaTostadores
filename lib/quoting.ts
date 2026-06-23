/** Utilidades de cotización (WhatsApp directo — reserva para enlaces manuales) */

import { parsePhoneNumber, type CountryCode } from "libphonenumber-js";
import es from "react-phone-number-input/locale/es";
import { sanitizeText } from "@/lib/sanitize";

export const QUOTE_WHATSAPP = {
  e164: "56950718852",
} as const;

export interface QuoteProductAddOnContext {
  id: string;
  name: string;
}

export interface QuoteProductContext {
  name: string;
  capacity: string;
  selectedAddOns?: QuoteProductAddOnContext[];
}

function formatAddOnsLine(
  addOns?: QuoteProductAddOnContext[],
): string | null {
  if (!addOns || addOns.length === 0) {
    return null;
  }

  return `Agregados: ${addOns.map((addOn) => addOn.name).join(", ")}`;
}

function countryLabelFromPhone(phone: string): string | null {
  const parsed = parsePhoneNumber(phone);
  const code = parsed?.country;

  if (!code) {
    return null;
  }

  return es[code as CountryCode] ?? code;
}

function buildQuoteText(
  name: string,
  phone: string,
  message?: string,
  products?: QuoteProductContext[],
  options?: { requestId?: string; email?: string },
): string {
  const lines = [
    "Hola, solicito cotización — Fica Tostadores",
    `Nombre: ${name}`,
    `Teléfono: ${phone}`,
  ];

  const country = countryLabelFromPhone(phone);
  if (country) {
    lines.push(`País: ${country}`);
  }

  if (options?.email?.trim()) {
    lines.push(`Correo: ${options.email.trim()}`);
  }

  if (products && products.length > 0) {
    if (products.length === 1) {
      lines.push(`Producto: ${products[0].name}`);
      lines.push(`Capacidad: ${products[0].capacity}`);
      const addOnsLine = formatAddOnsLine(products[0].selectedAddOns);
      if (addOnsLine) {
        lines.push(addOnsLine);
      }
    } else {
      lines.push("Productos:");
      products.forEach((product, index) => {
        lines.push(`${index + 1}. ${product.name} — ${product.capacity}`);
        const addOnsLine = formatAddOnsLine(product.selectedAddOns);
        if (addOnsLine) {
          lines.push(`   ${addOnsLine}`);
        }
      });
    }
  }

  if (message?.trim()) {
    lines.push(`Mensaje: ${message.trim()}`);
  }

  if (options?.requestId?.trim()) {
    lines.push(`Referencia: ${options.requestId.trim()}`);
  }

  return lines.join("\n");
}

export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

/** wa.me en móvil (app), web.whatsapp.com en escritorio */
export function buildQuoteWhatsAppUrl(
  name: string,
  phone: string,
  message?: string,
  products?: QuoteProductContext[],
  options?: { requestId?: string; email?: string },
): string {
  const safeName = sanitizeText(name, 120, { required: true }) ?? "";
  const safeMessage = sanitizeText(message, 1000) ?? "";
  const safeEmail = sanitizeText(options?.email, 200) ?? "";
  const safeRequestId = sanitizeText(options?.requestId, 80) ?? "";
  const safeProducts = products
    ?.map((product) => ({
      name: sanitizeText(product.name, 200, { required: true }) ?? "",
      capacity: sanitizeText(product.capacity, 100, { required: true }) ?? "",
      selectedAddOns: product.selectedAddOns
        ?.map((addOn) => ({
          id: sanitizeText(addOn.id, 80, { required: true }) ?? "",
          name: sanitizeText(addOn.name, 200, { required: true }) ?? "",
        }))
        .filter((addOn) => addOn.id && addOn.name),
    }))
    .filter((product) => product.name && product.capacity);

  const text = encodeURIComponent(
    buildQuoteText(safeName, phone, safeMessage, safeProducts, {
      email: safeEmail || undefined,
      requestId: safeRequestId || undefined,
    }),
  );

  if (isMobileDevice()) {
    return `https://wa.me/${QUOTE_WHATSAPP.e164}?text=${text}`;
  }

  return `https://web.whatsapp.com/send?phone=${QUOTE_WHATSAPP.e164}&text=${text}`;
}

/** Abre WhatsApp: app en móvil, nueva pestaña en escritorio. */
export function openWhatsAppContact(url: string): boolean {
  if (isMobileDevice()) {
    window.location.assign(url);
    return true;
  }

  const popup = window.open(url, "_blank", "noopener,noreferrer");

  if (popup) {
    return true;
  }

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  return true;
}

export function buildWhatsAppContactUrl(message?: string): string {
  const safeMessage = sanitizeText(message, 500) ?? "";
  const base = `https://wa.me/${QUOTE_WHATSAPP.e164}`;

  if (safeMessage) {
    return `${base}?text=${encodeURIComponent(safeMessage)}`;
  }

  return base;
}

export interface TechnicalServiceWhatsAppContext {
  equipmentModel: string;
  issueCategoryLabel: string;
  issueDescription: string;
  equipmentLocation?: string | null;
}

function buildTechnicalServiceText(
  name: string,
  phone: string,
  context: TechnicalServiceWhatsAppContext,
  options?: { requestId?: string; email?: string },
): string {
  const lines = [
    "Hola, solicito servicio técnico — Fica Tostadores",
    `Nombre: ${name}`,
    `Teléfono: ${phone}`,
  ];

  const country = countryLabelFromPhone(phone);
  if (country) {
    lines.push(`País: ${country}`);
  }

  if (options?.email?.trim()) {
    lines.push(`Correo: ${options.email.trim()}`);
  }

  lines.push(`Equipo: ${context.equipmentModel}`);
  lines.push(`Tipo de solicitud: ${context.issueCategoryLabel}`);
  lines.push(`Descripción: ${context.issueDescription}`);

  if (context.equipmentLocation?.trim()) {
    lines.push(`Ubicación del equipo: ${context.equipmentLocation.trim()}`);
  }

  if (options?.requestId?.trim()) {
    lines.push(`Referencia: ${options.requestId.trim()}`);
  }

  return lines.join("\n");
}

export function buildTechnicalServiceWhatsAppUrl(
  name: string,
  phone: string,
  context: TechnicalServiceWhatsAppContext,
  options?: { requestId?: string; email?: string },
): string {
  const safeName = sanitizeText(name, 120, { required: true }) ?? "";
  const safeEmail = sanitizeText(options?.email, 200) ?? "";
  const safeRequestId = sanitizeText(options?.requestId, 80) ?? "";
  const safeEquipmentModel =
    sanitizeText(context.equipmentModel, 200, { required: true }) ?? "";
  const safeIssueCategoryLabel =
    sanitizeText(context.issueCategoryLabel, 120, { required: true }) ?? "";
  const safeIssueDescription =
    sanitizeText(context.issueDescription, 2000, { required: true }) ?? "";
  const safeEquipmentLocation =
    sanitizeText(context.equipmentLocation, 300) ?? "";

  const text = encodeURIComponent(
    buildTechnicalServiceText(
      safeName,
      phone,
      {
        equipmentModel: safeEquipmentModel,
        issueCategoryLabel: safeIssueCategoryLabel,
        issueDescription: safeIssueDescription,
        equipmentLocation: safeEquipmentLocation || undefined,
      },
      {
        email: safeEmail || undefined,
        requestId: safeRequestId || undefined,
      },
    ),
  );

  if (isMobileDevice()) {
    return `https://wa.me/${QUOTE_WHATSAPP.e164}?text=${text}`;
  }

  return `https://web.whatsapp.com/send?phone=${QUOTE_WHATSAPP.e164}&text=${text}`;
}
