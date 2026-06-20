import { NextResponse } from "next/server";
import {
  extractElectronSecretFromRequest,
  isElectronSecretConfigured,
  normalizeElectronHeartbeatPayload,
  recordElectronHeartbeat,
  verifyElectronAppSecret,
} from "@/lib/electron-presence";

export async function POST(request: Request) {
  if (!verifyElectronAppSecret(extractElectronSecretFromRequest(request))) {
    const status = isElectronSecretConfigured() ? 401 : 503;

    return NextResponse.json(
      {
        error:
          status === 401
            ? "Secreto de app inválido o ausente."
            : "COTIZACIONES_APP_SECRET no configurado en el servidor.",
      },
      { status },
    );
  }

  let body: unknown = {};

  try {
    const text = await request.text();

    if (text.trim()) {
      body = JSON.parse(text) as unknown;
    }
  } catch {
    return NextResponse.json(
      { error: "Cuerpo JSON inválido." },
      { status: 400 },
    );
  }

  const payload = normalizeElectronHeartbeatPayload(body);
  const record = await recordElectronHeartbeat(payload);

  return NextResponse.json({
    ok: true,
    lastSeenAt: record.lastSeenAt,
  });
}
