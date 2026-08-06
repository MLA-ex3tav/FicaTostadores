import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { requireStaffApi } from "@/lib/admin-api-guard";
import { PRODUCTOS_COLLECTION } from "@/lib/catalog/constants";
import { FIREBASE_ADMIN_NOT_CONFIGURED_MESSAGE } from "@/lib/firebase-admin-config";
import { getFirebaseAdminFirestore } from "@/lib/firebase-admin";
import { mapSeriesGroup } from "@/lib/products/excel-import";
import { canPersistProducts } from "@/lib/products-repository";
import { revalidateProductPages } from "@/lib/revalidate-products";
import { SLUG_PATTERN, sanitizeText } from "@/lib/sanitize";

interface ImportRowInput {
  id?: unknown;
  name?: unknown;
  price?: unknown;
  capacity?: unknown;
  group?: unknown;
  serie?: unknown;
  technicalDetails?: unknown;
}

interface SanitizedRow {
  id: string;
  name: string;
  price: number | null;
  capacity: string;
  group: string;
  serie: string;
  technicalDetails: { label: string; value: string }[];
}

interface ImportError {
  id: string;
  name: string;
  message: string;
}

function sanitizeTechnicalDetails(
  value: unknown,
): { label: string; value: string }[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const details: { label: string; value: string }[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const record = item as Record<string, unknown>;
    const label = sanitizeText(record.label, 100, { required: true });
    const detailValue = sanitizeText(record.value, 200, { required: true });

    if (label && detailValue) {
      details.push({ label, value: detailValue });
    }
  }

  return details.slice(0, 10);
}

function sanitizeImportRows(body: unknown): {
  rows: SanitizedRow[];
  errors: ImportError[];
} {
  const errors: ImportError[] = [];
  const rows: SanitizedRow[] = [];

  if (!Array.isArray(body)) {
    return { rows, errors };
  }

  if (body.length > 300) {
    return { rows, errors };
  }

  for (const raw of body) {
    if (!raw || typeof raw !== "object") {
      continue;
    }

    const item = raw as ImportRowInput;
    const rawId = typeof item.id === "string" ? item.id.trim() : "";
    const id = SLUG_PATTERN.test(rawId) ? rawId : "";
    const name = sanitizeText(item.name, 200, { required: true }) ?? "";
    const price =
      typeof item.price === "number" &&
      Number.isFinite(item.price) &&
      item.price >= 0
        ? Math.round(item.price)
        : null;
    const capacity = sanitizeText(item.capacity, 100) ?? "";
    const group = sanitizeText(item.group, 200) ?? "";
    const serie = sanitizeText(item.serie, 200) ?? "";
    const technicalDetails = sanitizeTechnicalDetails(item.technicalDetails);
    const label = name || rawId;

    if (!id || !name) {
      errors.push({ id: id || "?", name: label, message: "Faltan ID o nombre." });
      continue;
    }

    rows.push({
      id,
      name,
      price,
      capacity,
      group,
      serie,
      technicalDetails,
    });
  }

  return { rows, errors };
}

export async function POST(request: Request) {
  const guard = await requireStaffApi(request, "write");

  if (!guard.ok) {
    return guard.response;
  }

  if (!canPersistProducts()) {
    return NextResponse.json(
      { error: FIREBASE_ADMIN_NOT_CONFIGURED_MESSAGE },
      { status: 503 },
    );
  }

  let body: unknown;

  try {
    const text = await request.text();

    if (!text.trim()) {
      throw new Error("Se esperaba un cuerpo JSON.");
    }

    body = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { error: "JSON inválido." },
      { status: 400 },
    );
  }

  const { rows, errors } = sanitizeImportRows(body);

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "No hay productos válidos para importar." },
      { status: 400 },
    );
  }

  const db = getFirebaseAdminFirestore();

  if (!db) {
    return NextResponse.json(
      { error: FIREBASE_ADMIN_NOT_CONFIGURED_MESSAGE },
      { status: 503 },
    );
  }

  const collection = db.collection(PRODUCTOS_COLLECTION);
  const batch = db.batch();
  let created = 0;
  let updated = 0;

  for (const row of rows) {
    const ref = collection.doc(row.id);
    const snapshot = await ref.get();

    const mapping = mapSeriesGroup(row.group, row.name);

    if (snapshot.exists) {
      const existingData = snapshot.data() ?? {};
      const existingDetails = Array.isArray(existingData.technicalDetails)
        ? existingData.technicalDetails
        : [];
      const update: Record<string, unknown> = {
        serie: row.serie,
        updatedAt: FieldValue.serverTimestamp(),
      };

      if (row.price !== null) {
        update.listPrice = row.price;
        update.price = row.price;
        update.precio = row.price;
        update.priceUpdatedAt = FieldValue.serverTimestamp();
      }

      if (
        existingDetails.length === 0 &&
        row.technicalDetails.length > 0
      ) {
        update.technicalDetails = row.technicalDetails;
      }

      batch.update(ref, update);
      updated += 1;
    } else {
      const doc = {
        id: row.id,
        catalog: mapping.catalog,
        category: mapping.category,
        name: row.name,
        capacity: row.capacity,
        description: row.name,
        longDescription: "",
        specs: [],
        features: [],
        technicalDetails: row.technicalDetails,
        addOns: [],
        images: [],
        serie: row.serie,
        listPrice: row.price,
        price: row.price,
        precio: row.price,
        priceUpdatedAt:
          row.price !== null ? FieldValue.serverTimestamp() : null,
        updatedAt: FieldValue.serverTimestamp(),
      };

      batch.set(ref, doc);
      created += 1;
    }
  }

  try {
    await batch.commit();
  } catch (error) {
    console.error("[admin/products/import]", error);

    return NextResponse.json(
      { error: "No se pudieron importar los productos." },
      { status: 500 },
    );
  }

  revalidateProductPages();

  return NextResponse.json({
    created,
    updated,
    total: rows.length,
    errors,
  });
}
