/**
 * Script de limpieza de cotizaciones duplicadas en solicitudes_cotizacion.
 *
 * Uso:
 *   node --env-file=.env.local scripts/cleanup-solicitudes-duplicadas.mjs        # dry-run
 *   node --env-file=.env.local scripts/cleanup-solicitudes-duplicadas.mjs --apply # borra
 *
 * Detecta dos tipos de duplicados generados por el flujo de edición de la app
 * (cuando el backend ignoraba el `id` y creaba un documento nuevo):
 *
 *   1. Varios docs con el MISMO campo `id` normalizado → conserva el documento
 *      canónico (docId === id) y elimina el resto.
 *   2. Docs SIN campo `id` con la MISMA firma de cliente + productos el MISMO
 *      día → conserva el más reciente y elimina el resto.
 *
 * Por defecto solo imprime el plan; con --apply borra de verdad.
 */
import { readFile } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const COLLECTION = "solicitudes_cotizacion";
const APPLY = process.argv.includes("--apply");

function stripEnvQuotes(value) {
  return value?.trim().replace(/^["']|["']$/g, "") ?? "";
}

function parseServiceAccountFromEnvJson() {
  const raw = stripEnvQuotes(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

  if (!raw) {
    return null;
  }

  try {
    const jsonText = raw.startsWith("{")
      ? raw
      : Buffer.from(raw, "base64").toString("utf8");
    return JSON.parse(jsonText);
  } catch {
    return null;
  }
}

async function parseServiceAccountFromPath() {
  const pathValue = stripEnvQuotes(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);

  if (!pathValue) {
    return null;
  }

  try {
    const absolutePath = isAbsolute(pathValue)
      ? pathValue
      : resolve(process.cwd(), pathValue);
    const jsonText = await readFile(absolutePath, "utf8");
    return JSON.parse(jsonText);
  } catch {
    return null;
  }
}

async function getFirestoreDb() {
  const serviceAccount =
    parseServiceAccountFromEnvJson() ?? (await parseServiceAccountFromPath());

  if (!serviceAccount) {
    throw new Error(
      "Defina FIREBASE_SERVICE_ACCOUNT_JSON o FIREBASE_SERVICE_ACCOUNT_PATH en .env.local.",
    );
  }

  if (getApps().length === 0) {
    initializeApp({ credential: cert(serviceAccount) });
  }

  return getFirestore();
}

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.\-]/g, "");

function isoDay(value) {
  if (!value) return "";
  const text = String(value);
  const iso = text.includes("T") ? text.slice(0, 10) : text.slice(0, 10);
  return iso;
}

function productsSignature(products) {
  if (!Array.isArray(products)) return "";
  return products
    .map((p) => {
      const rec = p && typeof p === "object" ? p : {};
      return `${normalize(rec.name)}x${rec.quantity ?? 1}`;
    })
    .sort()
    .join("|");
}

function clientSignature(data) {
  return [
    normalize(data.clientName),
    normalize(data.clientPhone),
    normalize(data.clientRut),
    normalize(data.clientEmail),
  ].join("::");
}

function docDate(doc) {
  const data = doc.data();
  const createdAt = data.createdAt;
  if (createdAt && typeof createdAt.toDate === "function") {
    return createdAt.toDate().toISOString();
  }
  if (typeof createdAt === "string") return createdAt;
  return "";
}

async function main() {
  const db = await getFirestoreDb();
  const snapshot = await db.collection(COLLECTION).get();

  const docs = snapshot.docs.map((doc) => ({
    docId: doc.id,
    data: doc.data(),
    date: docDate(doc),
  }));

  const toDelete = new Set();
  const groupsByIdField = new Map();
  const groupsBySignature = new Map();

  for (const item of docs) {
    const idField = String(item.data.id ?? "").trim();

    if (idField) {
      const key = idField;
      if (!groupsByIdField.has(key)) groupsByIdField.set(key, []);
      groupsByIdField.get(key).push(item);
    } else {
      const sig = `${clientSignature(item.data)}::${productsSignature(item.data.products)}::${isoDay(item.date)}`;
      if (!groupsBySignature.has(sig)) groupsBySignature.set(sig, []);
      groupsBySignature.get(sig).push(item);
    }
  }

  const plan = [];

  for (const [key, group] of groupsByIdField) {
    if (group.length < 2) continue;

    const canonical = group.find((item) => item.docId === key);
    const keep =
      canonical ??
      [...group].sort((a, b) => (a.date < b.date ? 1 : -1))[0];

    const removals = group
      .filter((item) => item.docId !== keep.docId)
      .map((item) => item.docId);

    plan.push({
      kind: "mismo-id",
      key,
      keep: keep.docId,
      removals,
    });

    for (const docId of removals) toDelete.add(docId);
  }

  for (const [sig, group] of groupsBySignature) {
    if (group.length < 2) continue;

    const keep = [...group].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
    const removals = group
      .filter((item) => item.docId !== keep.docId)
      .map((item) => item.docId);

    plan.push({
      kind: "misma-firma",
      key: sig,
      keep: keep.docId,
      removals,
    });

    for (const docId of removals) toDelete.add(docId);
  }

  console.log(`Docs totales: ${docs.length}`);
  console.log(`Plan de limpieza (${plan.length} grupos duplicados):`);
  console.log("");

  for (const group of plan) {
    console.log(`- [${group.kind}] ${group.key}`);
    console.log(`    conservar: ${group.keep}`);
    for (const docId of group.removals) {
      console.log(`    borrar:   ${docId}`);
    }
  }

  console.log("");
  console.log(`Se eliminarían ${toDelete.size} documentos.`);

  if (!APPLY) {
    console.log("Modo dry-run: no se borró nada. Use --apply para aplicar.");
    return;
  }

  const batchSize = 400;
  const ids = [...toDelete];
  const batches = [];

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = db.batch();
    const chunk = ids.slice(i, i + batchSize);
    for (const docId of chunk) {
      batch.delete(db.collection(COLLECTION).doc(docId));
    }
    batches.push(batch.commit());
  }

  await Promise.all(batches);
  console.log(`Borrados ${ids.length} documentos.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
