const DEFAULT_MAX_JSON_BYTES = 512 * 1024;

export class RequestValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RequestValidationError";
  }
}

export async function parseJsonBody<T>(
  request: Request,
  maxBytes = DEFAULT_MAX_JSON_BYTES,
): Promise<T> {
  const contentLength = request.headers.get("content-length");

  if (contentLength && Number.parseInt(contentLength, 10) > maxBytes) {
    throw new RequestValidationError("El cuerpo de la solicitud es demasiado grande.");
  }

  let raw: string;

  try {
    raw = await request.text();
  } catch {
    throw new RequestValidationError("No se pudo leer la solicitud.");
  }

  if (raw.length > maxBytes) {
    throw new RequestValidationError("El cuerpo de la solicitud es demasiado grande.");
  }

  if (!raw.trim()) {
    throw new RequestValidationError("Se esperaba un cuerpo JSON.");
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new RequestValidationError("JSON inválido.");
  }
}

export function validationErrorResponse(error: unknown) {
  const message =
    error instanceof RequestValidationError
      ? error.message
      : "Datos inválidos.";

  return Response.json({ error: message }, { status: 400 });
}
