import { NextResponse } from "next/server";

/**
 * CORS para las rutas /api/electron/* consumidas por la app de escritorio
 * (Tauri). El webview corre en otro origen (http://localhost:1420 en dev,
 * http://tauri.localhost en build), así que sin estos headers el fetch
 * falla antes de llegar al handler. Las rutas siguen protegidas por el
 * secreto compartido (Authorization: Bearer …), no por cookies.
 */
export function electronCorsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

export function electronOptionsResponse(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: electronCorsHeaders(),
  });
}

export function electronJson(
  data: unknown,
  init?: ResponseInit,
): NextResponse {
  return NextResponse.json(data, {
    ...init,
    headers: { ...electronCorsHeaders(), ...(init?.headers ?? {}) },
  });
}
