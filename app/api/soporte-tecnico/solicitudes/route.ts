import { NextResponse } from "next/server";
import {
  createSolicitudSoporteTecnico,
  SoporteTecnicoRepositoryError,
} from "@/lib/soporte-tecnico/repository";
import { parseCreateSolicitudSoporteTecnicoInput } from "@/lib/validation/soporte-tecnico-input";
import {
  parseJsonBody,
  validationErrorResponse,
} from "@/lib/validation/parse-request";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await parseJsonBody(request, 32 * 1024);
  } catch (error) {
    return validationErrorResponse(error);
  }

  const input = parseCreateSolicitudSoporteTecnicoInput(body);

  if (!input) {
    return NextResponse.json(
      { error: "Datos de servicio técnico inválidos." },
      { status: 400 },
    );
  }

  try {
    const { id } = await createSolicitudSoporteTecnico(input);

    return NextResponse.json(
      {
        ok: true,
        id,
        message: "Solicitud recibida. Nuestro equipo técnico la revisará pronto.",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof SoporteTecnicoRepositoryError) {
      console.error("[soporte-tecnico/solicitudes]", error.message);

      const isDev = process.env.NODE_ENV === "development";

      return NextResponse.json(
        {
          error: isDev
            ? error.message
            : "No se pudo registrar la solicitud en este momento. Intente más tarde.",
        },
        { status: 503 },
      );
    }

    console.error("[soporte-tecnico/solicitudes]", error);

    return NextResponse.json(
      { error: "Error interno al registrar la solicitud." },
      { status: 500 },
    );
  }
}
