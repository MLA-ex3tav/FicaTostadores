import { NextResponse } from "next/server";
import {
  CotizacionesRepositoryError,
  listSolicitudesByClientUserId,
} from "@/lib/cotizaciones/repository";
import { verifyFirebaseUser } from "@/lib/firebase-user-session";

export async function GET(request: Request) {
  const user = await verifyFirebaseUser(request);

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const solicitudes = await listSolicitudesByClientUserId(user.uid);

    return NextResponse.json({ solicitudes });
  } catch (error) {
    if (error instanceof CotizacionesRepositoryError) {
      console.error("[cotizaciones/mis-solicitudes]", error.message);

      const isDev = process.env.NODE_ENV === "development";

      return NextResponse.json(
        {
          error: isDev
            ? error.message
            : "No se pudieron cargar sus cotizaciones en este momento.",
        },
        { status: 503 },
      );
    }

    console.error("[cotizaciones/mis-solicitudes]", error);

    return NextResponse.json(
      { error: "Error interno al cargar las cotizaciones." },
      { status: 500 },
    );
  }
}
