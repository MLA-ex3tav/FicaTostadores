import {
  extractElectronSecretFromRequest,
  isElectronSecretConfigured,
  verifyElectronAppSecret,
} from "@/lib/electron-presence";
import { electronJson, electronOptionsResponse } from "@/lib/electron-cors";
import { getFirebaseAdminFirestore } from "@/lib/firebase-admin";
import { SOLICITUDES_COTIZACION_COLLECTION } from "@/lib/cotizaciones/constants";

/**
 * POST /api/electron/solicitudes/cleanup-duplicados
 *
 * Detecta y elimina cotizaciones duplicadas generadas cuando el backend antiguo
 * ignoraba el `id` en el POST y creaba un documento nuevo en cada edición.
 *
 * Detecta dos tipos de duplicados:
 *   1. Varios docs con el MISMO campo `id` normalizado → conserva el documento
 *      canónico (docId === id, si existe) o el más reciente y borra el resto.
 *   2. Docs SIN campo `id` con la MISMA firma de cliente + productos el MISMO
 *      día → conserva el más reciente y borra el resto.
 *
 * Por defecto corre en modo dry-run (solo plan). Para aplicarlo:
 *   POST /api/electron/solicitudes/cleanup-duplicados?apply=true
 */

const normalize = (value: unknown): string =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.\-]/g, "");

function isoDay(value: unknown): string {
  const text = String(value ?? "");
  return text.includes("T") ? text.slice(0, 10) : text.slice(0, 10);
}

function productsSignature(products: unknown): string {
  if (!Array.isArray(products)) return "";
  return products
    .map((p) => {
      const rec = p && typeof p === "object" ? (p as Record<string, unknown>) : {};
      return `${normalize(rec.name)}x${rec.quantity ?? 1}`;
    })
    .sort()
    .join("|");
}

function clientSignature(data: Record<string, unknown>): string {
  return [
    normalize(data.clientName),
    normalize(data.clientPhone),
    normalize(data.clientRut),
    normalize(data.clientEmail),
  ].join("::");
}

function docDate(data: Record<string, unknown>): string {
  const createdAt = data.createdAt;
  if (createdAt && typeof createdAt === "object") {
    const ts = createdAt as { toDate?: () => Date };
    if (typeof ts.toDate === "function") {
      return ts.toDate().toISOString();
    }
  }
  return String(createdAt ?? "");
}

interface DuplicateEntry {
  docId: string;
  data: Record<string, unknown>;
  date: string;
}

interface GroupPlan {
  kind: "mismo-id" | "misma-firma";
  key: string;
  keep: string;
  removals: string[];
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

  const url = new URL(request.url);
  const apply = url.searchParams.get("apply") === "true";

  try {
    const snapshot = await db
      .collection(SOLICITUDES_COTIZACION_COLLECTION)
      .orderBy("createdAt", "desc")
      .get();

    const docs = snapshot.docs.map((doc) => ({
      docId: doc.id,
      data: doc.data(),
      date: docDate(doc.data()),
    }));

    const groupsByIdField = new Map<string, DuplicateEntry[]>();
    const groupsBySignature = new Map<string, DuplicateEntry[]>();

    for (const item of docs) {
      const idField = String(item.data.id ?? "").trim();

      if (idField) {
        const key = idField;
        if (!groupsByIdField.has(key)) groupsByIdField.set(key, []);
        groupsByIdField.get(key)!.push(item);
      } else {
        const sig = `${clientSignature(item.data)}::${productsSignature(
          item.data.products,
        )}::${isoDay(item.date)}`;
        if (!groupsBySignature.has(sig)) groupsBySignature.set(sig, []);
        groupsBySignature.get(sig)!.push(item);
      }
    }

    const plan: GroupPlan[] = [];

    plan.push(
      ...[...groupsByIdField.entries()]
        .filter(([, group]) => group.length >= 2)
        .map(([key, group]) => {
          const canonical = group.find((item) => item.docId === key);
          const keep = canonical ?? [...group].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
          return {
            kind: "mismo-id" as const,
            key,
            keep: keep.docId,
            removals: group.filter((item) => item.docId !== keep.docId).map((item) => item.docId),
          };
        }),
    );

    plan.push(
      ...[...groupsBySignature.entries()]
        .filter(([, group]) => group.length >= 2)
        .map(([key, group]) => {
          const keep = [...group].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
          return {
            kind: "misma-firma" as const,
            key,
            keep: keep.docId,
            removals: group.filter((item) => item.docId !== keep.docId).map((item) => item.docId),
          };
        }),
    );

    const removals = plan.flatMap((group) => group.removals);

    if (apply && removals.length > 0) {
      const batchSize = 400;
      const batches: Promise<unknown>[] = [];

      for (let i = 0; i < removals.length; i += batchSize) {
        const batch = db.batch();
        for (const docId of removals.slice(i, i + batchSize)) {
          batch.delete(db.collection(SOLICITUDES_COTIZACION_COLLECTION).doc(docId));
        }
        batches.push(batch.commit());
      }

      await Promise.all(batches);
    }

    return electronJson({
      ok: true,
      apply,
      totalDocs: docs.length,
      totalGroups: plan.length,
      deletedCount: apply ? removals.length : 0,
      groups: plan,
      deleted: apply ? removals : [],
    });
  } catch (error) {
    console.error("[electron/solicitudes/cleanup-duplicados]", error);

    return electronJson(
      { error: "No se pudieron procesar las solicitudes." },
      { status: 500 },
    );
  }
}