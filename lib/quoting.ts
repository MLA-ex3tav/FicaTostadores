/** WhatsApp solo para envío de cotizaciones desde el formulario */
export const QUOTE_WHATSAPP = {
  e164: "56949959571",
} as const;

export interface QuoteProductContext {
  name: string;
  capacity: string;
}

function buildQuoteText(
  name: string,
  phone: string,
  message?: string,
  products?: QuoteProductContext[],
): string {
  const lines = [
    "Hola, solicito cotización — Fica Tostadores",
    `Nombre: ${name}`,
    `Teléfono: ${phone}`,
  ];

  if (products && products.length > 0) {
    if (products.length === 1) {
      lines.push(`Producto: ${products[0].name}`);
      lines.push(`Capacidad: ${products[0].capacity}`);
    } else {
      lines.push("Productos:");
      products.forEach((product, index) => {
        lines.push(
          `${index + 1}. ${product.name} — ${product.capacity}`,
        );
      });
    }
  }

  if (message?.trim()) {
    lines.push(`Mensaje: ${message.trim()}`);
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
): string {
  const text = encodeURIComponent(
    buildQuoteText(name, phone, message, products),
  );

  if (isMobileDevice()) {
    return `https://wa.me/${QUOTE_WHATSAPP.e164}?text=${text}`;
  }

  return `https://web.whatsapp.com/send?phone=${QUOTE_WHATSAPP.e164}&text=${text}`;
}

/** Abre WhatsApp en el mismo gesto del clic (evita bloqueo de popups) */
export function openWhatsAppContact(url: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.rel = "noopener noreferrer";
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
