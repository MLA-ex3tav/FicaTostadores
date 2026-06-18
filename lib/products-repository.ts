import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { head, put } from "@vercel/blob";
import {
  canPersistWithBlob,
  getBlobCommandOptions,
  isVercelBlobConfigured,
} from "@/lib/blob-storage";
import { defaultProducts, type Product } from "@/lib/products";

const BLOB_PATHNAME = "products.json";
const LOCAL_FILE = path.join(process.cwd(), "data", "products.json");

async function readFromBlob(): Promise<Product[] | null> {
  if (!isVercelBlobConfigured()) {
    return null;
  }

  try {
    const blob = await head(BLOB_PATHNAME, getBlobCommandOptions());

    if (!blob) {
      return null;
    }

    const response = await fetch(blob.url);

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as Product[];
  } catch {
    return null;
  }
}

async function readFromLocalFile(): Promise<Product[] | null> {
  try {
    const raw = await readFile(LOCAL_FILE, "utf8");
    return JSON.parse(raw) as Product[];
  } catch {
    return null;
  }
}

async function writeToBlob(products: Product[]): Promise<void> {
  await put(BLOB_PATHNAME, JSON.stringify(products, null, 2), {
    ...getBlobCommandOptions(),
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

async function writeToLocalFile(products: Product[]): Promise<void> {
  await mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await writeFile(LOCAL_FILE, JSON.stringify(products, null, 2), "utf8");
}

export async function loadProducts(): Promise<Product[]> {
  const fromBlob = await readFromBlob();

  if (fromBlob) {
    return fromBlob;
  }

  const fromFile = await readFromLocalFile();

  if (fromFile) {
    return fromFile;
  }

  return defaultProducts;
}

export async function saveProducts(products: Product[]): Promise<void> {
  if (isVercelBlobConfigured()) {
    await writeToBlob(products);
    return;
  }

  await writeToLocalFile(products);
}

export function canPersistProducts(): boolean {
  return canPersistWithBlob();
}
