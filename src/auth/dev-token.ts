import { createHmac } from "node:crypto";
import { forbidden } from "../lib/errors.ts";
import type { AppConfig } from "../config.ts";

/**
 * Emisión de JWT HS256 SOLO para desarrollo/tests (fixtures).
 * En producción/staging se rechaza: el token lo emite Supabase, no este servicio.
 */
export interface DevTokenInput {
  sub: string;
  tenantId?: string;
  role?: string;
  issuer: string;
  audience: string;
  secret: string;
  expiresInSeconds?: number;
  issuedAtSeconds?: number;
  appMetadata?: Record<string, unknown>;
}

export function mintDevToken(input: DevTokenInput): string {
  const now = input.issuedAtSeconds ?? Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const payload: Record<string, unknown> = {
    sub: input.sub,
    role: input.role ?? "authenticated",
    aud: input.audience,
    iss: input.issuer,
    iat: now,
    exp: now + (input.expiresInSeconds ?? 900),
    ...(input.tenantId ? { tenant_id: input.tenantId } : {}),
    app_metadata: input.appMetadata ?? {},
    user_metadata: {},
  };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const signature = createHmac("sha256", input.secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function assertDevTokensAllowed(config: AppConfig): void {
  if (config.env === "production" || config.env === "staging") {
    throw forbidden("Los tokens de desarrollo no se emiten fuera de desarrollo/test");
  }
}

function base64url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}
