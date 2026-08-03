import { timingSafeEqual } from "node:crypto";
import { Redis } from "@upstash/redis";

/**
 * Presencia de la app Electron de cotizaciones (heartbeat).
 *
 * Variables de entorno:
 * - COTIZACIONES_APP_SECRET (preferida) o ELECTRON_APP_SECRET: secreto compartido
 *   para POST /api/electron/heartbeat (header Authorization: Bearer …).
 * - COTIZACIONES_APP_HEARTBEAT_TIMEOUT_SEC (opcional, default 90): segundos sin
 *   heartbeat antes de considerar la app desconectada.
 * - UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN: persistencia compartida
 *   entre instancias (recomendado en producción); sin ellas se usa memoria local.
 */

const REDIS_KEY = "fica:electron:presence";
const DEFAULT_HEARTBEAT_TIMEOUT_SEC = 90;

export interface ElectronHeartbeatPayload {
  version?: string;
  instanceId?: string;
  hostname?: string;
}

export interface ElectronPresenceRecord {
  lastSeenAt: string;
  version?: string;
  instanceId?: string;
  hostname?: string;
}

export interface ElectronPresenceStatus {
  connected: boolean;
  lastSeenAt: string | null;
  version: string | null;
  instanceId: string | null;
  hostname: string | null;
  secondsSinceLastSeen: number | null;
  heartbeatTimeoutSec: number;
  secretConfigured: boolean;
  storage: "redis" | "memory";
}

let memoryRecord: ElectronPresenceRecord | null = null;

function isUpstashConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );
}

function getRedisClient(): Redis | null {
  if (!isUpstashConfigured()) {
    return null;
  }

  return Redis.fromEnv();
}

export function getElectronHeartbeatTimeoutSec(): number {
  const raw = process.env.COTIZACIONES_APP_HEARTBEAT_TIMEOUT_SEC?.trim();

  if (!raw) {
    return DEFAULT_HEARTBEAT_TIMEOUT_SEC;
  }

  const parsed = Number.parseInt(raw, 10);

  if (!Number.isFinite(parsed) || parsed < 30 || parsed > 600) {
    return DEFAULT_HEARTBEAT_TIMEOUT_SEC;
  }

  return parsed;
}

export function getElectronAppSecret(): string | null {
  const primary = process.env.COTIZACIONES_APP_SECRET?.trim();
  const fallback = process.env.ELECTRON_APP_SECRET?.trim();

  return primary || fallback || null;
}

export function isElectronSecretConfigured(): boolean {
  return getElectronAppSecret() !== null;
}

function secretsMatch(expected: string, provided: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}

export function verifyElectronAppSecret(provided: string | null): boolean {
  const secret = getElectronAppSecret();

  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  if (!provided?.trim()) {
    return false;
  }

  return secretsMatch(secret, provided.trim());
}

export function extractElectronSecretFromRequest(request: Request): string | null {
  const authorization = request.headers.get("authorization");

  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim() || null;
  }

  const headerSecret = request.headers.get("x-cotizaciones-app-secret")?.trim();

  if (headerSecret) {
    return headerSecret;
  }

  return request.headers.get("x-electron-app-secret")?.trim() || null;
}

function sanitizeOptionalField(
  value: unknown,
  maxLength: number,
): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  return trimmed.slice(0, maxLength);
}

export function normalizeElectronHeartbeatPayload(
  body: unknown,
): ElectronHeartbeatPayload {
  if (!body || typeof body !== "object") {
    return {};
  }

  const record = body as Record<string, unknown>;

  return {
    version: sanitizeOptionalField(record.version, 64),
    instanceId: sanitizeOptionalField(record.instanceId, 128),
    hostname: sanitizeOptionalField(record.hostname, 128),
  };
}

export async function recordElectronHeartbeat(
  payload: ElectronHeartbeatPayload = {},
): Promise<ElectronPresenceRecord> {
  const record: ElectronPresenceRecord = {
    lastSeenAt: new Date().toISOString(),
    ...(payload.version ? { version: payload.version } : {}),
    ...(payload.instanceId ? { instanceId: payload.instanceId } : {}),
    ...(payload.hostname ? { hostname: payload.hostname } : {}),
  };

  const redis = getRedisClient();
  const ttlSec = getElectronHeartbeatTimeoutSec() + 30;

  if (redis) {
    await redis.set(REDIS_KEY, record, { ex: ttlSec });
    return record;
  }

  memoryRecord = record;
  return record;
}

function buildStatusFromRecord(
  record: ElectronPresenceRecord | null,
  storage: ElectronPresenceStatus["storage"],
): ElectronPresenceStatus {
  const heartbeatTimeoutSec = getElectronHeartbeatTimeoutSec();
  const secretConfigured = isElectronSecretConfigured();

  if (!record?.lastSeenAt) {
    return {
      connected: false,
      lastSeenAt: null,
      version: null,
      instanceId: null,
      hostname: null,
      secondsSinceLastSeen: null,
      heartbeatTimeoutSec,
      secretConfigured,
      storage,
    };
  }

  const lastSeenMs = Date.parse(record.lastSeenAt);
  const secondsSinceLastSeen = Number.isFinite(lastSeenMs)
    ? Math.max(0, Math.floor((Date.now() - lastSeenMs) / 1000))
    : null;

  const connected =
    secondsSinceLastSeen !== null &&
    secondsSinceLastSeen <= heartbeatTimeoutSec;

  return {
    connected,
    lastSeenAt: record.lastSeenAt,
    version: record.version ?? null,
    instanceId: record.instanceId ?? null,
    hostname: record.hostname ?? null,
    secondsSinceLastSeen,
    heartbeatTimeoutSec,
    secretConfigured,
    storage,
  };
}

export async function getElectronPresenceStatus(): Promise<ElectronPresenceStatus> {
  const redis = getRedisClient();

  if (redis) {
    const record = await redis.get<ElectronPresenceRecord>(REDIS_KEY);
    return buildStatusFromRecord(record, "redis");
  }

  return buildStatusFromRecord(memoryRecord, "memory");
}
