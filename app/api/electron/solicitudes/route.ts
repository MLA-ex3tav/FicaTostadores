import { FieldValue } from "firebase-admin/firestore";
import {
  extractElectronSecretFromRequest,
  isElectronSecretConfigured,
  verifyElectronAppSecret,
} from "@/lib/electron-presence";
import { electronJson, electronOptionsResponse } from "@/lib/electron-cors";
import { getFirebaseAdminFirestore } from "@/lib/firebase-admin";
import { SOLICITUDES_COTIZACION_COLLECTION } from "@/lib/cotizaciones/constants";
import { SOLICITUDES_SOPORTE_TECNICO_COLLECTION } from "@/lib/soporte-tecnico/constants";

/**
 * GET /api/electron/solicitudes?tipo=cotizaciones|soporte
 *
 * Lectura de solicitudes para la app de escritorio (Tauri). La app no tiene
 * login de Firebase y las reglas de Firestore exigen rol staff, así que la
 * lectura se hace aquí con Admin SDK y se protege con el secreto compartido
 * (Authorization: Bearer COTIZACIONES_APP_SECRET), igual que el heartbeat.
 *
 * POST /api/electron/solicitudes
 *
 * Registra una orden de trabajo (OT) creada desde la app móvil. El documento
 * queda en solicitudes_cotizacion con estado "aprobada_ot" y enOT: true, para
 * que aparezca directamente en la pestaña Órdenes de Trabajo de la app de
 * escritorio y del admin web.
 */

const COLLECTIONS_BY_TIPO: Record<string, string> = {
  cotizaciones: SOLICITUDES_COTIZACION_COLLECTION,
  soporte: SOLICITUDES_SOPORTE_TECNICO_COLLECTION,
};

const MAX_SOLICITUDES = 100;

interface CrearSolicitudBody {
  clientName?: unknown;
  clientPhone?: unknown;
  clientRut?: unknown;
  clientEmail?: unknown;
  clientComuna?: unknown;
  clientAddress?: unknown;
  message?: unknown;
  shipping?: unknown;
  products?: unknown;
}

interface LineaProducto {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseProductLines(value: unknown): LineaProducto[] {
  if (!Array.isArray(value)) return [];

  const lines: LineaProducto[] = [];

  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;
    const name = cleanText(record.name, 200);
    const productId = cleanText(record.productId ?? record.id, 120);

    if (!name && !productId) continue;

    const quantity = Math.max(1, Math.round(toNumber(record.quantity ?? record.cantidad) ?? 1));
    const unitPrice = Math.max(0, toNumber(record.unitPrice ?? record.price ?? record.precio) ?? 0);

    lines.push({
      productId,
      name,
      quantity,
      unitPrice,
    });
  }

  return lines.slice(0, 20);
}

function serializeFirestoreValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value ?? null;
  }

  if (Array.isArray(value)) {
    return value.map(serializeFirestoreValue);
  }

  if (typeof value === "object") {
    const maybeTimestamp = value as { toDate?: () => Date };

    if (typeof maybeTimestamp.toDate === "function") {
      return maybeTimestamp.toDate().toISOString();
    }

    const output: Record<string, unknown> = {};

    for (const [key, entry] of Object.entries(value)) {
      output[key] = serializeFirestoreValue(entry);
    }

    return output;
  }

  return value;
}

export function OPTIONS() {
  return electronOptionsResponse();
}

export async function GET(request: Request) {
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

  const tipo = new URL(request.url).searchParams.get("tipo") ?? "cotizaciones";
  const collectionName = COLLECTIONS_BY_TIPO[tipo];

  if (!collectionName) {
    return electronJson(
      { error: `Tipo inválido: ${tipo}. Use cotizaciones|soporte.` },
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
    const snapshot = await db
      .collection(collectionName)
      .orderBy("createdAt", "desc")
      .limit(MAX_SOLICITUDES)
      .get();

    const solicitudes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(serializeFirestoreValue(doc.data()) as Record<string, unknown>),
    }));

    return electronJson({ ok: true, tipo, count: solicitudes.length, solicitudes });
  } catch (error) {
    console.error(`[electron/solicitudes:${tipo}]`, error);

    return electronJson(
      { error: "No se pudieron leer las solicitudes." },
      { status: 500 },
    );
  }
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

  let body: CrearSolicitudBody = {};

  try {
    const text = await request.text();

    if (text.trim()) {
      body = JSON.parse(text) as CrearSolicitudBody;
    }
  } catch {
    return electronJson({ error: "Cuerpo JSON inválido." }, { status: 400 });
  }

  const clientName = cleanText(body.clientName, 120);
  const clientPhone = cleanText(body.clientPhone, 32);
  const products = parseProductLines(body.products);

  if (!clientName) {
    return electronJson(
      { error: 'Campo "clientName" requerido.' },
      { status: 400 },
    );
  }

  if (products.length === 0) {
    return electronJson(
      { error: 'Campo "products" requerido con al menos un producto.' },
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

  const subtotal = products.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);

  try {
    const docRef = db.collection(SOLICITUDES_COTIZACION_COLLECTION).doc();
    const now = FieldValue.serverTimestamp();

    const productsData = products.map((line) => ({
      id: line.productId || undefined,
      productId: line.productId || null,
      name: line.name,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      lineTotal: line.unitPrice * line.quantity,
      capacity: undefined,
      catalog: "movil",
    }));

    await docRef.set({
      source: "movil",
      clientName,
      clientPhone: clientPhone || null,
      clientRut: cleanText(body.clientRut, 24) || null,
      clientEmail: cleanText(body.clientEmail, 200) || null,
      clientComuna: cleanText(body.clientComuna, 100) || null,
      clientAddress: cleanText(body.clientAddress, 240) || null,
      message: cleanText(body.message, 1000) || null,
      shipping: body.shipping && typeof body.shipping === "object" ? body.shipping : null,
      products: productsData,
      pricing: {
        subtotal,
        precioFinal: subtotal,
        iva: Math.round(subtotal * 0.19),
        total: Math.round(subtotal * 1.19),
      },
      subtotal,
      estado: "aprobada_ot",
      cotizacionEstado: "aprobada_ot",
      cotizacionEstadoLabel: "Aprobada (OT)",
      enOT: true,
      produccion: false,
      produccionEtapa: "por_iniciar",
      produccionEtapaLabel: "Por iniciar",
      aprobadaAt: now,
      createdAt: now,
      actualizadoEn: now,
    });

    return electronJson(
      { ok: true, id: docRef.id, estado: "aprobada_ot" },
      { status: 201 },
    );
  } catch (error) {
    console.error("[electron/solicitudes POST]", error);

    return electronJson(
      { error: "No se pudo registrar la orden de trabajo." },
      { status: 500 },
    );
  }
}
