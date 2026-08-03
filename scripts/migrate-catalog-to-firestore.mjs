import { readFile } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { head } from "@vercel/blob";

const PRODUCTOS_COLLECTION = "productos";
const CATALOGO_CONFIG_COLLECTION = "catalogo_config";
const CATALOGO_CONFIG_DEFAULT_DOC_ID = "default";

const BLOB_PRODUCTS_PATH = "products.json";
const BLOB_CATALOG_CONFIG_PATH = "catalog-config.json";
const LOCAL_PRODUCTS_FILE = resolve(process.cwd(), "data", "products.json");
const LOCAL_CATALOG_CONFIG_FILE = resolve(
  process.cwd(),
  "data",
  "catalog-config.json",
);

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

function getBlobCommandOptions() {
  const token = stripEnvQuotes(process.env.BLOB_READ_WRITE_TOKEN);
  const oidcToken = stripEnvQuotes(process.env.VERCEL_OIDC_TOKEN);
  const storeId = stripEnvQuotes(process.env.BLOB_STORE_ID);

  if (token) {
    return { token };
  }

  if (oidcToken && storeId) {
    return { oidcToken, storeId };
  }

  if (storeId) {
    return { storeId };
  }

  return {};
}

function isVercelBlobConfigured() {
  return Boolean(
    stripEnvQuotes(process.env.BLOB_READ_WRITE_TOKEN) ||
      stripEnvQuotes(process.env.BLOB_STORE_ID),
  );
}

async function readJsonFromBlob(pathname) {
  if (!isVercelBlobConfigured()) {
    return null;
  }

  try {
    const blob = await head(pathname, getBlobCommandOptions());
    if (!blob) {
      return null;
    }

    const response = await fetch(blob.url, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

async function readJsonFromLocalFile(filePath) {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function loadProductsSource() {
  const fromBlob = await readJsonFromBlob(BLOB_PRODUCTS_PATH);
  if (Array.isArray(fromBlob) && fromBlob.length > 0) {
    console.log(`Productos: origen Blob (${fromBlob.length})`);
    return fromBlob;
  }

  const fromFile = await readJsonFromLocalFile(LOCAL_PRODUCTS_FILE);
  if (Array.isArray(fromFile) && fromFile.length > 0) {
    console.log(`Productos: origen data/products.json (${fromFile.length})`);
    return fromFile;
  }

  throw new Error(
    "No se encontraron productos en Blob ni en data/products.json.",
  );
}

async function loadCatalogConfigSource() {
  const fromBlob = await readJsonFromBlob(BLOB_CATALOG_CONFIG_PATH);
  if (
    fromBlob &&
    Array.isArray(fromBlob.catalogs) &&
    Array.isArray(fromBlob.categories)
  ) {
    console.log("Catálogo: origen Blob");
    return fromBlob;
  }

  const fromFile = await readJsonFromLocalFile(LOCAL_CATALOG_CONFIG_FILE);
  if (
    fromFile &&
    Array.isArray(fromFile.catalogs) &&
    Array.isArray(fromFile.categories)
  ) {
    console.log("Catálogo: origen data/catalog-config.json");
    return fromFile;
  }

  throw new Error(
    "No se encontró catalog-config en Blob ni en data/catalog-config.json.",
  );
}

async function getFirestoreDb() {
  const serviceAccount =
    parseServiceAccountFromEnvJson() ?? (await parseServiceAccountFromPath());

  if (!serviceAccount) {
    throw new Error(
      "Defina FIREBASE_SERVICE_ACCOUNT_JSON o FIREBASE_SERVICE_ACCOUNT_PATH en .env.local.",
    );
  }

  if (!getApps().length) {
    initializeApp({ credential: cert(serviceAccount) });
  }

  return getFirestore();
}

async function migrateProducts(db, products) {
  const collection = db.collection(PRODUCTOS_COLLECTION);
  const existing = await collection.get();
  const nextIds = new Set(products.map((product) => product.id));
  const batch = db.batch();

  for (const doc of existing.docs) {
    if (!nextIds.has(doc.id)) {
      batch.delete(doc.ref);
    }
  }

  for (const product of products) {
    batch.set(collection.doc(product.id), {
      ...product,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  console.log(`Firestore: ${products.length} productos migrados.`);
}

async function migrateCatalogConfig(db, config) {
  await db
    .collection(CATALOGO_CONFIG_COLLECTION)
    .doc(CATALOGO_CONFIG_DEFAULT_DOC_ID)
    .set({
      ...config,
      updatedAt: FieldValue.serverTimestamp(),
    });

  console.log("Firestore: catalogo_config/default migrado.");
}

async function main() {
  const db = await getFirestoreDb();
  const [products, catalogConfig] = await Promise.all([
    loadProductsSource(),
    loadCatalogConfigSource(),
  ]);

  await migrateProducts(db, products);
  await migrateCatalogConfig(db, catalogConfig);

  console.log("Migración completada.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
