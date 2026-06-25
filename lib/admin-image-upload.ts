import type { UploadImageVariant } from "@/lib/optimize-upload-image";

export type AdminImageUploadPhase =
  | "preparing"
  | "uploading"
  | "processing"
  | "done";

export interface AdminImageUploadProgress {
  phase: AdminImageUploadPhase;
  message: string;
  percent: number;
  fileName?: string;
  fileIndex?: number;
  fileCount?: number;
}

function getProcessingMessage(variant: UploadImageVariant): string {
  switch (variant) {
    case "carousel":
      return "Convirtiendo a WebP y optimizando para carrusel…";
    case "primary":
      return "Convirtiendo a WebP (carrusel y productos)…";
    case "product":
    case "gallery":
      return "Convirtiendo a WebP y optimizando imagen…";
    default: {
      const unreachable: never = variant;
      return unreachable;
    }
  }
}

function buildFileLabel(
  fileName: string,
  fileIndex: number,
  fileCount: number,
): string {
  if (fileCount <= 1) {
    return fileName;
  }

  return `${fileName} (${fileIndex} de ${fileCount})`;
}

export async function uploadAdminImage(
  file: File,
  variant: UploadImageVariant,
  getAuthToken: () => Promise<string>,
  onProgress?: (progress: AdminImageUploadProgress) => void,
  options?: { fileIndex?: number; fileCount?: number },
): Promise<string> {
  const fileIndex = options?.fileIndex ?? 1;
  const fileCount = options?.fileCount ?? 1;
  const fileLabel = buildFileLabel(file.name, fileIndex, fileCount);

  const report = (
    phase: AdminImageUploadPhase,
    message: string,
    percent: number,
  ) => {
    onProgress?.({
      phase,
      message,
      percent,
      fileName: fileLabel,
      fileIndex,
      fileCount,
    });
  };

  report("preparing", "Preparando imagen…", 2);

  const token = await getAuthToken();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("variant", variant);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload");
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.responseType = "text";

    xhr.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable) {
        report("uploading", "Subiendo imagen…", 35);
        return;
      }

      const uploadRatio = event.loaded / event.total;
      const percent = Math.min(85, Math.round(5 + uploadRatio * 80));
      const uploadPercent = Math.round(uploadRatio * 100);

      report("uploading", `Subiendo… ${uploadPercent}%`, percent);
    });

    xhr.upload.addEventListener("loadend", () => {
      report("processing", getProcessingMessage(variant), 90);
    });

    xhr.addEventListener("load", () => {
      let data: { url?: string; error?: string } = {};

      try {
        data = JSON.parse(xhr.responseText) as { url?: string; error?: string };
      } catch {
        reject(new Error("Respuesta inválida del servidor."));
        return;
      }

      if (xhr.status < 200 || xhr.status >= 300 || !data.url) {
        reject(
          new Error(
            data.error ?? `No se pudo subir la imagen (${xhr.status}).`,
          ),
        );
        return;
      }

      report("done", "Imagen lista", 100);
      resolve(data.url);
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Error de conexión al subir la imagen."));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Subida cancelada."));
    });

    xhr.send(formData);
  });
}
