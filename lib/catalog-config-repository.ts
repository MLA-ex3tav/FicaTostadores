import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { head, put } from "@vercel/blob";
import {
  defaultCatalogConfig,
  type CatalogConfig,
} from "@/lib/catalog-config";

const BLOB_PATHNAME = "catalog-config.json";
const LOCAL_FILE = path.join(process.cwd(), "data", "catalog-config.json");

function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function readFromBlob(): Promise<CatalogConfig | null> {
  if (!isBlobConfigured()) {
    return null;
  }

  try {
    const blob = await head(BLOB_PATHNAME);

    if (!blob) {
      return null;
    }

    const response = await fetch(blob.url);

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as CatalogConfig;
  } catch {
    return null;
  }
}

async function readFromLocalFile(): Promise<CatalogConfig | null> {
  try {
    const raw = await readFile(LOCAL_FILE, "utf8");
    return JSON.parse(raw) as CatalogConfig;
  } catch {
    return null;
  }
}

async function writeToBlob(config: CatalogConfig): Promise<void> {
  await put(BLOB_PATHNAME, JSON.stringify(config, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

async function writeToLocalFile(config: CatalogConfig): Promise<void> {
  await mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await writeFile(LOCAL_FILE, JSON.stringify(config, null, 2), "utf8");
}

export async function loadCatalogConfig(): Promise<CatalogConfig> {
  const fromBlob = await readFromBlob();

  if (fromBlob) {
    return fromBlob;
  }

  const fromFile = await readFromLocalFile();

  if (fromFile) {
    return fromFile;
  }

  return defaultCatalogConfig;
}

export async function saveCatalogConfig(config: CatalogConfig): Promise<void> {
  if (isBlobConfigured()) {
    await writeToBlob(config);
    return;
  }

  await writeToLocalFile(config);
}

export function canPersistCatalogConfig(): boolean {
  return isBlobConfigured() || process.env.NODE_ENV !== "production";
}
