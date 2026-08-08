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

/**
 * DELETE /api/electron/productos/[id]
 *
 * Elimina un producto del catálogo (documento de Firestore). Protegido con el
 * secreto compartido (Authorization: Bearer COTIZACIONES_APP_SECRET).
 *
 * Respuesta: { ok: true, id }
 * 404 si el producto no existe.
 *
 * PATCH /api/electron/productos/[id]
 *
 * Actualiza campos editables de un producto (nombre, modelo, catálogo,
 * categoría, capacidad, descripciones, especificaciones, características,
 * serie, visibilidad y promociones). No administra imágenes. Protegido con el
 * mismo secreto.
 *
 * Body: objeto parcial con cualquiera de estos campos:
 *  - name, modelo, serie: string (≤160)
 *  - catalog, catalogo, category, categoria, capacity, description,
 *    longDescription, promoTag, promoDescription: string (límites distintos)
 *  - specs, features, disabledColors: string[]
 *  - isOutOfStock, disableColors, isPromo, isFeatured: boolean
 *  - disableColors: boolean
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

function cleanText(value: unknown, max: number): string | null {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return null;
  return text.slice(0, max);
}

export function OPTIONS() {
  return electronOptionsResponse();
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;

  if (!id || typeof id !== "string" || !id.trim()) {
    return electronJson({ error: "ID de producto requerido." }, { status: 400 });
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

  const updates: Record<string, unknown> = {};

  for (const [field, max] of Object.entries(TEXT_FIELDS)) {
    if (body[field] === undefined) continue;
    updates[field] = cleanText(body[field], max) ?? "";
  }

  for (const field of STRING_ARRAY_FIELDS) {
    if (body[field] === undefined) continue;

    if (!Array.isArray(body[field])) {
      return electronJson(
        { error: `El campo ${field} debe ser una lista de textos.` },
        { status: 400 },
      );
    }

    updates[field] = body[field]
      .map((value) => cleanText(value, 300))
      .filter(Boolean);
  }

  for (const field of BOOLEAN_FIELDS) {
    if (body[field] === undefined) continue;
    updates[field] = Boolean(body[field]);
  }

  if (Object.keys(updates).length === 0) {
    return electronJson(
      {
        error:
          "Al menos un campo editable requerido (nombre, modelo, catálogo, categoría, capacidad, descripción, especificaciones, características, visibilidad…).",
      },
      { status: 400 },
    );
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

    if (!snapshot.exists) {
      return electronJson(
        { error: `Producto no encontrado con ID: ${id}` },
        { status: 404 },
      );
    }

    await ref.update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });

    revalidateProductPages(id);

    return electronJson({ ok: true, id, updated: updates });
  } catch (error) {
    console.error(`[electron/productos/${id}/patch]`, error);

    return electronJson(
      { error: "No se pudo actualizar el producto." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!verifyElectronAppSecret(extractElectronSecretFromRequest(_request))) {
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

  const { id } = await params;

  if (!id || typeof id !== "string" || !id.trim()) {
    return electronJson({ error: "ID de producto requerido." }, { status: 400 });
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

    if (!snapshot.exists) {
      return electronJson(
        { error: `Producto no encontrado con ID: ${id}` },
        { status: 404 },
      );
    }

    await ref.delete();

    return electronJson({ ok: true, id });
  } catch (error) {
    console.error(`[electron/productos/${id}/delete]`, error);

    return electronJson(
      { error: "No se pudo eliminar el producto del catálogo." },
      { status: 500 },
    );
  }
}