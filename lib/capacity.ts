export type CapacityUnit = "por-lote" | "por-hora" | "custom";

export function parseCapacity(stored: string): {
  value: string;
  unit: CapacityUnit;
} {
  const trimmed = stored.trim();

  if (!trimmed) {
    return { value: "", unit: "por-lote" };
  }

  if (/\/\s*hora/i.test(trimmed)) {
    return {
      value: trimmed.replace(/\s*\/\s*hora\s*$/i, "").trim(),
      unit: "por-hora",
    };
  }

  if (/por\s+lote/i.test(trimmed)) {
    return {
      value: trimmed.replace(/\s*por\s+lote\s*$/i, "").trim(),
      unit: "por-lote",
    };
  }

  return { value: trimmed, unit: "custom" };
}

export function formatCapacity(value: string, unit: CapacityUnit): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  switch (unit) {
    case "por-lote":
      if (/por\s+lote/i.test(trimmed)) {
        return trimmed;
      }
      return `${trimmed} por lote`;
    case "por-hora":
      if (/\/\s*hora/i.test(trimmed)) {
        return trimmed;
      }
      return `${trimmed} / hora`;
    case "custom":
      return trimmed;
    default: {
      const exhaustive: never = unit;
      return exhaustive;
    }
  }
}
