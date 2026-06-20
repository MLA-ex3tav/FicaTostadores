import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
}

export interface RateLimitResult {
  ok: boolean;
  retryAfterSeconds?: number;
  remaining: number;
}

const memoryBuckets = new Map<string, RateLimitBucket>();
const limiterCache = new Map<string, Ratelimit>();

const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();
let warnedMissingUpstash = false;

function cleanupExpiredBuckets(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) {
    return;
  }

  lastCleanup = now;

  for (const [key, bucket] of memoryBuckets) {
    if (bucket.resetAt <= now) {
      memoryBuckets.delete(key);
    }
  }
}

function checkMemoryRateLimit(
  key: string,
  config: RateLimitConfig,
): RateLimitResult {
  const now = Date.now();
  cleanupExpiredBuckets(now);

  const existing = memoryBuckets.get(key);

  if (!existing || existing.resetAt <= now) {
    memoryBuckets.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });

    return { ok: true, remaining: config.max - 1 };
  }

  if (existing.count >= config.max) {
    return {
      ok: false,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
      remaining: 0,
    };
  }

  existing.count += 1;

  return {
    ok: true,
    remaining: config.max - existing.count,
  };
}

function isUpstashConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );
}

function getUpstashLimiter(config: RateLimitConfig): Ratelimit | null {
  if (!isUpstashConfigured()) {
    if (
      process.env.NODE_ENV === "production" &&
      !warnedMissingUpstash
    ) {
      warnedMissingUpstash = true;
      console.warn(
        "[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN no configurados; usando memoria local (no compartida entre instancias).",
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

export async function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const limiter = getUpstashLimiter(config);

  if (!limiter) {
    return checkMemoryRateLimit(key, config);
  }

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

  if (pathname.startsWith("/api/cotizaciones/solicitudes")) {
    return {
      keys: [`${ip}:cotizaciones:submit`],
      config: RATE_LIMITS.cotizacionesSubmit,
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
