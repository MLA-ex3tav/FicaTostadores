import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { head, put } from "@vercel/blob";

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");
const BLOB_PATHNAME = "products.json";
const LOCAL_PREFIX = "/uploads/products/";

const EXTENSION_CONTENT_TYPE = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
  avif: "image/avif",
};

function stripEnvQuotes(value) {
  return value?.trim().replace(/^["']|["']$/g, "") ?? "";
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

function isLocalUploadPath(value) {
  return (
    typeof value === "string" &&
    value.startsWith(LOCAL_PREFIX) &&
    /^\/uploads\/products\/[a-z0-9-]+\.(jpe?g|png|gif|webp|heic|heif|avif)$/i.test(value)
  );
}

function contentTypeForFilename(filename) {
  const extension = filename.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_CONTENT_TYPE[extension] ?? "application/octet-stream";
}

function collectLocalUploadPaths(value, paths = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectLocalUploadPaths(item, paths);
    }
    return paths;
  }

  if (!value || typeof value !== "object") {
    return paths;
  }

  for (const [key, nested] of Object.entries(value)) {
    if (key === "src" && isLocalUploadPath(nested)) {
      paths.add(nested);
      continue;
    }

    collectLocalUploadPaths(nested, paths);
  }

  return paths;
}

function replaceLocalUploadPaths(value, urlByPath) {
  if (Array.isArray(value)) {
    return value.map((item) => replaceLocalUploadPaths(item, urlByPath));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const next = {};

  for (const [key, nested] of Object.entries(value)) {
    if (key === "src" && isLocalUploadPath(nested) && urlByPath.has(nested)) {
      next[key] = urlByPath.get(nested);
      continue;
    }

    next[key] = replaceLocalUploadPaths(nested, urlByPath);
  }

  return next;
}

async function loadProducts() {
  const blob = await head(BLOB_PATHNAME, getBlobCommandOptions());

  if (!blob) {
    throw new Error("No se encontró products.json en Vercel Blob.");
  }

  const response = await fetch(blob.url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`No se pudo leer products.json (${response.status}).`);
  }

  return response.json();
}

async function uploadLocalFile(localPath) {
  const filename = localPath.slice(LOCAL_PREFIX.length);
  const filePath = path.join(LOCAL_UPLOAD_DIR, filename);
  const buffer = await readFile(filePath);
  const blob = await put(`product-images/${filename}`, buffer, {
    ...getBlobCommandOptions(),
    access: "public",
    contentType: contentTypeForFilename(filename),
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return blob.url;
}

async function main() {
  const options = getBlobCommandOptions();

  if (!options.token && !options.storeId) {
    throw new Error(
      "Configure BLOB_READ_WRITE_TOKEN o BLOB_STORE_ID (por ejemplo con --env-file=.env.local).",
    );
  }

  const products = await loadProducts();
  const localPaths = [...collectLocalUploadPaths(products)];

  if (localPaths.length === 0) {
    console.log("No hay rutas /uploads/products/ en products.json.");
    return;
  }

  console.log(`Encontradas ${localPaths.length} rutas locales en products.json.`);

  const urlByPath = new Map();
  let uploaded = 0;
  let skipped = 0;

  for (const localPath of localPaths) {
    const filename = localPath.slice(LOCAL_PREFIX.length);
    const filePath = path.join(LOCAL_UPLOAD_DIR, filename);

    try {
      await readFile(filePath);
    } catch {
      console.warn(`  omitido (sin archivo local): ${localPath}`);
      skipped += 1;
      continue;
    }

    const blobUrl = await uploadLocalFile(localPath);
    urlByPath.set(localPath, blobUrl);
    uploaded += 1;
    console.log(`  subido: ${filename}`);
  }

  if (urlByPath.size === 0) {
    console.log("No se subió ningún archivo. Verifique public/uploads/products/.");
    return;
  }

  const updatedProducts = replaceLocalUploadPaths(products, urlByPath);

  await put(BLOB_PATHNAME, JSON.stringify(updatedProducts, null, 2), {
    ...getBlobCommandOptions(),
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });

  console.log(
    `Listo: ${uploaded} imagen(es) migradas, ${skipped} omitida(s), products.json actualizado.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
