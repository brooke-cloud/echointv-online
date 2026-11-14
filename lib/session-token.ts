import crypto from "node:crypto";

const DEVELOPMENT_SESSION_SECRET = "Echo INTV-super-secure-session-secret-key-2026";

export type UserSessionPayload = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  expiresAt: number;
};

type SessionEnvironment = {
  SESSION_SECRET?: string;
  NEXTAUTH_SECRET?: string;
  NODE_ENV?: string;
};

export function resolveSessionSecret(environment: SessionEnvironment = process.env) {
  const configured = environment.SESSION_SECRET?.trim() || environment.NEXTAUTH_SECRET?.trim();
  if (configured) return configured;
  if (environment.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be configured in production.");
  }
  return DEVELOPMENT_SESSION_SECRET;
}

function isSessionPayload(value: unknown): value is UserSessionPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const payload = value as Record<string, unknown>;
  return typeof payload.id === "string" && Boolean(payload.id)
    && typeof payload.email === "string" && Boolean(payload.email)
    && (typeof payload.name === "string" || payload.name === null)
    && typeof payload.role === "string" && Boolean(payload.role)
    && typeof payload.expiresAt === "number" && Number.isFinite(payload.expiresAt);
}

export function signSessionToken(payload: UserSessionPayload, secret = resolveSessionSecret()) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${signature}`;
}

export function verifySessionToken(token: string, secret = resolveSessionSecret(), now = Date.now()): UserSessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
    const [data, signature] = parts;
    const expected = crypto.createHmac("sha256", secret).update(data).digest();
    const received = Buffer.from(signature, "base64url");
    if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) return null;
    const payload: unknown = JSON.parse(Buffer.from(data, "base64url").toString());
    if (!isSessionPayload(payload) || now > payload.expiresAt) return null;
    return payload;
  } catch {
    return null;
  }
}
