import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitConfig {
  windowMs: number;
  max: number;
}

export interface RateLimitResult {
  ok: boolean;
  retryAfterSeconds?: number;
  remaining: number;
}

const limiterCache = new Map<string, Ratelimit>();

let warnedUnavailable = false;

function isUpstashConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );
}

function getUpstashLimiter(config: RateLimitConfig): Ratelimit | null {
  if (!isUpstashConfigured()) {
    if (!warnedUnavailable) {
      warnedUnavailable = true;
      console.error(
        "[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN no configurados; rechazando solicitudes (fail-closed).",
      );
    }

    return null;
  }

  const cacheKey = `${config.max}:${config.windowMs}`;
  const cached = limiterCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const limiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(
      config.max,
      `${Math.max(1, Math.round(config.windowMs / 1000))} s`,
    ),
    prefix: "fica-rl",
  });

  limiterCache.set(cacheKey, limiter);
  return limiter;
}

const UNAVAILABLE_RESULT: RateLimitResult = {
  ok: false,
  retryAfterSeconds: 1,
  remaining: 0,
};

export async function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const limiter = getUpstashLimiter(config);

  if (!limiter) {
    return UNAVAILABLE_RESULT;
  }

  try {
    const result = await limiter.limit(key);
    const retryAfterSeconds = Math.max(
      0,
      Math.ceil((result.reset - Date.now()) / 1000),
    );

    return {
      ok: result.success,
      retryAfterSeconds: result.success ? undefined : retryAfterSeconds,
      remaining: result.remaining,
    };
  } catch (error) {
    console.error("[rate-limit] Upstash falló; rechazando solicitud:", error);
    return UNAVAILABLE_RESULT;
  }
}

export async function assertRateLimits(
  keys: string[],
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  for (const key of keys) {
    const result = await checkRateLimit(key, config);

    if (!result.ok) {
      return result;
    }
  }

  return { ok: true, remaining: config.max };
}

export const RATE_LIMITS = {
  publicRead: { windowMs: 60_000, max: 120 },
  auth: { windowMs: 60_000, max: 40 },
  adminWrite: { windowMs: 60_000, max: 60 },
  adminWritePerUser: { windowMs: 60_000, max: 40 },
  upload: { windowMs: 60_000, max: 15 },
  uploadPerUser: { windowMs: 60_000, max: 10 },
  electronHeartbeat: { windowMs: 60_000, max: 120 },
  cotizacionesSubmit: { windowMs: 900_000, max: 5 },
  soporteTecnicoSubmit: { windowMs: 900_000, max: 5 },
} as const satisfies Record<string, RateLimitConfig>;

export function getRateLimitKey(
  ip: string,
  pathname: string,
  method: string,
): { keys: string[]; config: RateLimitConfig } {
  if (pathname.startsWith("/api/electron/")) {
    return {
      keys: [`${ip}:electron:heartbeat`],
      config: RATE_LIMITS.electronHeartbeat,
    };
  }

  if (
    pathname.startsWith("/api/cotizaciones/solicitudes") &&
    method === "POST"
  ) {
    return {
      keys: [`${ip}:cotizaciones:submit`],
      config: RATE_LIMITS.cotizacionesSubmit,
    };
  }

  if (
    pathname.startsWith("/api/soporte-tecnico/solicitudes") &&
    method === "POST"
  ) {
    return {
      keys: [`${ip}:soporte-tecnico:submit`],
      config: RATE_LIMITS.soporteTecnicoSubmit,
    };
  }

  if (pathname.startsWith("/api/admin/upload")) {
    return { keys: [`${ip}:upload`], config: RATE_LIMITS.upload };
  }

  if (pathname.startsWith("/api/admin/")) {
    return {
      keys: [`${ip}:admin:${method}`],
      config:
        method === "GET" ? RATE_LIMITS.publicRead : RATE_LIMITS.adminWrite,
    };
  }

  if (pathname.startsWith("/api/auth/")) {
    return { keys: [`${ip}:auth`], config: RATE_LIMITS.auth };
  }

  if (pathname.startsWith("/api/")) {
    return { keys: [`${ip}:public:${method}`], config: RATE_LIMITS.publicRead };
  }

  return { keys: [`${ip}:page`], config: RATE_LIMITS.publicRead };
}

export function rateLimitResponse(retryAfterSeconds?: number): Response {
  const headers = new Headers({ "Content-Type": "application/json" });

  if (retryAfterSeconds) {
    headers.set("Retry-After", String(retryAfterSeconds));
  }

  return new Response(
    JSON.stringify({
      error: "Demasiadas solicitudes. Intente de nuevo en unos segundos.",
    }),
    { status: 429, headers },
  );
}
