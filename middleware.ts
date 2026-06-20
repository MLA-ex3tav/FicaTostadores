import { NextResponse, type NextRequest } from "next/server";
import { buildContentSecurityPolicy } from "@/lib/csp";
import {
  assertRateLimits,
  getRateLimitKey,
  rateLimitResponse,
} from "@/lib/rate-limit";

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function applySecurityHeaders(response: NextResponse, isProduction: boolean) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set(
    "Content-Security-Policy",
    buildContentSecurityPolicy(isProduction),
  );

  if (isProduction) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }
}

export async function middleware(request: NextRequest) {
  const isProduction = process.env.NODE_ENV === "production";
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    const ip = getClientIp(request);
    const { keys, config } = getRateLimitKey(ip, pathname, request.method);
    const result = await assertRateLimits(keys, config);

    if (!result.ok) {
      const response = NextResponse.json(
        {
          error:
            "Demasiadas solicitudes. Intente de nuevo en unos segundos.",
        },
        { status: 429 },
      );

      if (result.retryAfterSeconds) {
        response.headers.set(
          "Retry-After",
          String(result.retryAfterSeconds),
        );
      }

      applySecurityHeaders(response, isProduction);
      return response;
    }
  }

  const response = NextResponse.next();

  applySecurityHeaders(response, isProduction);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
