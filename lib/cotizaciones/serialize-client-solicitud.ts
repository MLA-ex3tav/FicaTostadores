import type { Timestamp } from "firebase-admin/firestore";
import type {
  ClientSolicitudCotizacion,
  CotizacionProductLine,
} from "@/lib/cotizaciones/types";

function serializeTimestamp(value: unknown): string | null {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as Timestamp).toDate === "function"
  ) {
    return (value as Timestamp).toDate().toISOString();
  }

  return null;
}

function readBoolean(value: unknown): boolean {
  return value === true;
}

function readString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed || null;
}

function readProductLine(value: unknown): CotizacionProductLine | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const name = readString(record.name);
  const capacity = readString(record.capacity);

  if (!name || !capacity) {
    return null;
  }

  const selectedAddOns = Array.isArray(record.selectedAddOns)
    ? record.selectedAddOns
        .map((addOn) => {
          if (!addOn || typeof addOn !== "object") {
            return null;
          }

          const addOnRecord = addOn as Record<string, unknown>;
          const id = readString(addOnRecord.id);
          const addOnName = readString(addOnRecord.name);

          if (!id || !addOnName) {
            return null;
          }

          return { id, name: addOnName };
        })
        .filter((addOn): addOn is { id: string; name: string } => addOn !== null)
    : [];

  return {
    productId: readString(record.productId) ?? readString(record.id),
    name,
    capacity,
    catalog: readString(record.catalog),
    selectedColor: readString(record.selectedColor),
    selectedColorId: readString(record.selectedColorId),
    selectedAddOns,
  };
}

export function serializeClientSolicitudCotizacion(
  id: string,
  data: Record<string, unknown>,
): ClientSolicitudCotizacion {
  const products = Array.isArray(data.products)
    ? data.products
        .map(readProductLine)
        .filter((product): product is CotizacionProductLine => product !== null)
    : [];

  return {
    id,
    createdAt: serializeTimestamp(data.createdAt),
    products,
    message: readString(data.message),
    estado: readString(data.estado),
    cotizacionEstado: readString(data.cotizacionEstado),
    cotizacionEstadoLabel: readString(data.cotizacionEstadoLabel),
    enOT: readBoolean(data.enOT),
    enEnsamblado: readBoolean(data.enEnsamblado),
    produccionEtapa: readString(data.produccionEtapa),
    produccionEtapaLabel: readString(data.produccionEtapaLabel),
    produccion: readBoolean(data.produccion) || readString(data.produccion),
    estadoActualizadoAt: serializeTimestamp(data.estadoActualizadoAt),
    estadoActualizadoPor: readString(data.estadoActualizadoPor),
  };
}
