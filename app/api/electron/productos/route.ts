import {
  extractElectronSecretFromRequest,
  isElectronSecretConfigured,
  verifyElectronAppSecret,
} from "@/lib/electron-presence";
import { electronJson, electronOptionsResponse } from "@/lib/electron-cors";
import { getFirebaseAdminFirestore } from "@/lib/firebase-admin";
import { PRODUCTOS_COLLECTION } from "@/lib/catalog/constants";
import { FieldValue } from "firebase-admin/firestore";
import { revalidateProductPages } from "@/lib/revalidate-products";
import { slugifyProductId } from "@/lib/product-utils";

/**
 * POST /api/electron/productos
 *
 * Crea un producto nuevo en el catálogo (documento de Firestore). Protegido con
 * el secreto compartido (Authorization: Bearer COTIZACIONES_APP_SECRET).
 *
 * Body: objeto con campos editables (mismos límites que PATCH [id]) más
 * opcionalmente `id` (slug). Si no se envía `id`, se genera desde el nombre.
 *
 * Respuesta: { ok: true, id }
 * 409 si ya existe el ID. 400 si no viene nombre.
 */

const TEXT_FIELDS: Record<string, number> = {
  name: 160,
  modelo: 120,
  serie: 120,
  catalog: 120,
  catalogo: 120,
  category: 120,
  categoria: 120,
  capacity: 120,
  description: 500,
  longDescription: 5000,
  promoTag: 100,
  promoDescription: 300,
};

const STRING_ARRAY_FIELDS = ["specs", "features", "disabledColors"] as const;

const BOOLEAN_FIELDS = [
  "isOutOfStock",
  "disableColors",
  "isPromo",
  "isFeatured",
] as const;

const PRICE_FIELDS = ["listPrice", "price", "precio"] as const;

function cleanPrice(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, value);
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/[^0-9.-]/g, ""));
    if (Number.isFinite(parsed)) return Math.max(0, parsed);
  }
  return null;
}

function cleanText(value: unknown, max: number): string | null {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return null;
  return text.slice(0, max);
}

export function OPTIONS() {
  return electronOptionsResponse();
}

export async function POST(request: Request) {
  if (!verifyElectronAppSecret(extractElectronSecretFromRequest(request))) {
    const status = isElectronSecretConfigured() ? 401 : 503;

    return electronJson(
      {
        error:
          status === 401
            ? "Secreto de app inválido o ausente."
            : "COTIZACIONES_APP_SECRET no configurado en el servidor.",
      },
      { status },
    );
  }

  let body: Record<string, unknown> = {};

  try {
    const text = await request.text();

    if (text.trim()) {
      body = JSON.parse(text) as Record<string, unknown>;
    }
  } catch {
    return electronJson({ error: "Cuerpo JSON inválido." }, { status: 400 });
  }

  const name = cleanText(body["name"], 160);

  if (!name) {
    return electronJson(
      { error: "El campo name (nombre) es obligatorio." },
      { status: 400 },
    );
  }

  const product: Record<string, unknown> = { name };

  for (const [field, max] of Object.entries(TEXT_FIELDS)) {
    if (field === "name") continue;
    if (body[field] === undefined) continue;
    product[field] = cleanText(body[field], max) ?? "";
  }

  for (const field of STRING_ARRAY_FIELDS) {
    if (body[field] === undefined) continue;

    if (!Array.isArray(body[field])) {
      return electronJson(
        { error: `El campo ${field} debe ser una lista de textos.` },
        { status: 400 },
      );
    }

    product[field] = body[field]
      .map((value) => cleanText(value, 300))
      .filter(Boolean);
  }

  for (const field of BOOLEAN_FIELDS) {
    if (body[field] === undefined) continue;
    product[field] = Boolean(body[field]);
  }

  for (const field of PRICE_FIELDS) {
    if (body[field] === undefined) continue;
    const price = cleanPrice(body[field]);
    if (price !== null) product[field] = price;
  }

  // Imágenes (desde el editor de la app de escritorio).
  if (body["images"] !== undefined) {
    if (!Array.isArray(body["images"])) {
      return electronJson(
        { error: "El campo images debe ser una lista de imágenes." },
        { status: 400 },
      );
    }

    product["images"] = body["images"]
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;
        const carousel = (record.carousel as Record<string, unknown> | null)?.src;
        const productSrc = (record.product as Record<string, unknown> | null)?.src;
        const carouselSrc =
          typeof carousel === "string" && carousel.trim()
            ? carousel.trim()
            : null;
        const productViewSrc =
          typeof productSrc === "string" && productSrc.trim()
            ? productSrc.trim()
            : null;

        if (!carouselSrc && !productViewSrc) return null;

        return {
          carousel: { src: carouselSrc ?? productViewSrc! },
          product: { src: productViewSrc ?? carouselSrc! },
        };
      })
      .filter(Boolean)
      .slice(0, 20);
  }

  const requestedId =
    typeof body["id"] === "string" ? body["id"].trim() : "";

  const id =
    requestedId && slugifyProductId(requestedId)
      ? requestedId
      : slugifyProductId(String(name));

  if (!slugifyProductId(id)) {
    return electronJson({ error: "ID de producto inválido." }, { status: 400 });
  }

  const db = getFirebaseAdminFirestore();

  if (!db) {
    return electronJson(
      {
        error:
          "Firebase Admin no configurado. Defina FIREBASE_SERVICE_ACCOUNT_JSON o FIREBASE_SERVICE_ACCOUNT_PATH.",
      },
      { status: 503 },
    );
  }

  try {
    const ref = db.collection(PRODUCTOS_COLLECTION).doc(id);
    const snapshot = await ref.get();

    if (snapshot.exists) {
      return electronJson(
        { error: `Ya existe un producto con ID: ${id}` },
        { status: 409 },
      );
    }

    await ref.set({
      ...product,
      id,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    revalidateProductPages(id);

    return electronJson({ ok: true, id, product: { id, ...product } }, { status: 201 });
  } catch (error) {
    console.error("[electron/productos/post]", error);

    return electronJson(
      { error: "No se pudo crear el producto." },
      { status: 500 },
    );
  }
}
