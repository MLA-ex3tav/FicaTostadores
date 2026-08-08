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
 * PATCH /api/electron/productos/[id]/precio
 *
 * Actualiza el precio de venta de un producto en Firestore (campo listPrice,
 * que es el que consume la web y la app móvil). Protegido con el secreto
 * compartido (Authorization: Bearer COTIZACIONES_APP_SECRET).
 *
 * Body: { "price": 1234567 }
 *
 * Esto permite que los precios guardados desde la app móvil queden
 * sincronizados para cualquier otra instalación (catálogo público de
 * Firestore), en lugar de vivir solo en el localStorage del dispositivo.
 */

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

  const price = body.price ?? body.listPrice;

  if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
    return electronJson(
      { error: 'Campo "price" requerido en el body (número ≥ 0).' },
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

    const rounded = Math.round(price);
    await ref.update({
      listPrice: rounded,
      price: rounded,
      precio: rounded,
      updatedAt: FieldValue.serverTimestamp(),
      priceUpdatedAt: FieldValue.serverTimestamp(),
    });

    revalidateProductPages(id);

    return electronJson({ ok: true, id, price: rounded });
  } catch (error) {
    console.error(`[electron/productos/${id}/precio]`, error);

    return electronJson(
      { error: "No se pudo actualizar el precio del producto." },
      { status: 500 },
    );
  }
}
