import * as XLSX from "xlsx";
import { slugifyProductId } from "@/lib/product-utils";
import { stripControlChars } from "@/lib/sanitize";

export interface ExcelImportItem {
  row: number;
  id: string;
  code: string;
  name: string;
  description: string;
  capacity: string;
  price: number | null;
  group: string;
  serie: string;
  sacos: string;
  catalog: string;
  category: string;
  exists: boolean;
  issues: string[];
  technicalDetails: { label: string; value: string }[];
}

const MASTER_SHEET = "TABLA MAESTRA";
const PRICE_SHEET = "CLP";
const MAX_IMPORT_ITEMS = 300;

export function mapSeriesGroup(group: string, name: string): {
  catalog: string;
  category: string;
} {
  const text = `${group} ${name}`.toLowerCase();

  if (/café|cacao/.test(text)) {
    return { catalog: "cafe", category: "cafe" };
  }

  if (
    /procesador|partidor|descascarador|clasificador|molino|limpiadora|cernidor|revolvedor|confitador|grageador|horno|seleccionador|peladora/.test(
      text,
    )
  ) {
    return { catalog: "frutos", category: "procesamiento" };
  }

  if (/industrial/.test(text)) {
    return { catalog: "frutos", category: "industrial" };
  }

  return { catalog: "frutos", category: "comercial" };
}

function cleanCell(value: unknown): string {
  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value !== "string") {
    return "";
  }

  return stripControlChars(value)
    .replace(/[\u00a0\u200b\u2009]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanName(value: string): string {
  return value.replace(/[.,]+$/g, "").trim();
}

function parsePrice(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? Math.round(value) : null;
  }

  const text = cleanCell(value);

  if (!text) {
    return null;
  }

  const digits = text.replace(/[^\d]/g, "");

  if (!digits) {
    return null;
  }

  const parsed = Number(digits);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function cell(row: unknown[], index: number): string {
  return cleanCell(row[index]);
}

function readSacosByCode(workbook: XLSX.WorkBook): Map<string, string> {
  const sacos = new Map<string, string>();

  if (!workbook.SheetNames.includes(PRICE_SHEET)) {
    return sacos;
  }

  const sheet = workbook.Sheets[PRICE_SHEET];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  });

  for (const row of rows) {
    const code = cell(row, 0);
    const value = cell(row, 4);

    if (!code || code.toUpperCase() === "SERIE" || !value) {
      continue;
    }

    sacos.set(slugifyProductId(code), value);
  }

  return sacos;
}

export function parsePrecioListWorkbook(
  buffer: ArrayBuffer,
  sheetName = MASTER_SHEET,
  existingIds: Set<string> = new Set(),
): { items: ExcelImportItem[]; sheet: string } {
  const workbook = XLSX.read(buffer, { type: "array" });

  if (!workbook.SheetNames.includes(sheetName)) {
    throw new Error(
      `El archivo no contiene la hoja "${sheetName}". Hojas: ${workbook.SheetNames.join(", ")}.`,
    );
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  });
  const sacosByCode = readSacosByCode(workbook);

  const items: ExcelImportItem[] = [];
  let group = "";
  const seen = new Set<string>();

  for (const row of rows) {
    const code = cell(row, 0);
    const nameRaw = cell(row, 1);
    const priceValue = row[2];
    const rendimiento = cell(row, 3);

    if (!code && !nameRaw && priceValue === "" && !rendimiento) {
      continue;
    }

    if (code.toUpperCase() === "SERIE" && nameRaw) {
      group = nameRaw;
      continue;
    }

    if (!code || code.toUpperCase() === "SERIE") {
      continue;
    }

    const name = cleanName(nameRaw);
    const id = slugifyProductId(code);

    if (!name || !id) {
      continue;
    }

    if (seen.has(id)) {
      continue;
    }

    seen.add(id);

    const serie = group || "Sin serie";
    const mapping = mapSeriesGroup(group, name);
    const price = parsePrice(priceValue);
    const sacos = sacosByCode.get(id) ?? "";
    const issues: string[] = [];

    if (price === null) {
      issues.push("Sin precio");
    }

    if (!rendimiento) {
      issues.push("Sin capacidad");
    }

    const technicalDetails = [
      { label: "Rendimiento", value: rendimiento },
      { label: "Sacos", value: sacos },
    ].filter((detail) => detail.value.length > 0);

    items.push({
      row: 0,
      id,
      code: cleanCell(code),
      name,
      description: name,
      capacity: rendimiento,
      price,
      group,
      serie,
      sacos,
      catalog: mapping.catalog,
      category: mapping.category,
      exists: existingIds.has(id),
      issues,
      technicalDetails,
    });

    if (items.length >= MAX_IMPORT_ITEMS) {
      break;
    }
  }

  return { items, sheet: sheetName };
}
