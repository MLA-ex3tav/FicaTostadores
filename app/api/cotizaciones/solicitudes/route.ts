import { NextResponse } from "next/server";
import {
  CotizacionesRepositoryError,
  createSolicitudCotizacion,
} from "@/lib/cotizaciones/repository";
import {
  parseCreateSolicitudCotizacionInput,
} from "@/lib/validation/cotizacion-input";
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

  const input = parseCreateSolicitudCotizacionInput(body);

  if (!input) {
    return NextResponse.json(
      { error: "Datos de cotización inválidos." },
      { status: 400 },
    );
  }

  try {
    const { id } = await createSolicitudCotizacion(input);

    return NextResponse.json(
      {
        ok: true,
        id,
        message: "Solicitud recibida. Nos pondremos en contacto pronto.",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof CotizacionesRepositoryError) {
      console.error("[cotizaciones/solicitudes]", error.message);

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

    console.error("[cotizaciones/solicitudes]", error);

    return NextResponse.json(
      { error: "Error interno al registrar la solicitud." },
      { status: 500 },
    );
  }
}
