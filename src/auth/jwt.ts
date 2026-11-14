import { createHmac, createPublicKey, verify as cryptoVerify } from "node:crypto";
import { unauthorized } from "../lib/errors.ts";
import { constantTimeEqualHex, constantTimeEqualString, sha256Hex } from "../lib/ids.ts";
import type { Clock } from "../lib/time.ts";
import { systemClock } from "../lib/time.ts";

/**
 * Verificación de Supabase JWT (CLI-C03).
 * - Algoritmos y JWKS fijados por configuración de servidor, nunca por el token.
 * - Firma, exp, nbf, iat, iss y aud verificados; sin fallback owner/default.
 * - `user_metadata` NO se usa como autoridad.
 */

export interface JwtConfig {
  issuer: string;
  audience: string;
  /** HS256 legacy (solo desarrollo): secreto compartido. */
  hmacSecret?: string;
  /** Claves asimétricas permitidas. */
  allowedAlgorithms: readonly ("HS256" | "RS256" | "ES256")[];
  jwksUrl?: string;
  clockToleranceSeconds: number;
  jwksCacheSeconds: number;
}

export interface SupabaseClaims {
  sub: string;
  role: string;
  aud: string;
  iss: string;
  exp: number;
  iat: number;
  nbf?: number;
  tenantIdClaim?: string;
  appMetadata: Record<string, unknown>;
  raw: Record<string, unknown>;
}

interface Jwk {
  kid?: string;
  kty: string;
  alg?: string;
  n?: string;
  e?: string;
  crv?: string;
  x?: string;
  y?: string;
}

export interface JwksSource {
  fetchJwks(url: string): Promise<{ keys: Jwk[] }>;
}

export class JwtVerifier {
  readonly #config: JwtConfig;
  readonly #clock: Clock;
  readonly #jwks?: JwksSource;
  readonly #cache = new Map<string, { expiresAt: number; keys: Jwk[] }>();

  constructor(config: JwtConfig, options: { clock?: Clock; jwks?: JwksSource } = {}) {
    if (!config.issuer || !config.audience) {
      throw new Error("JwtVerifier: issuer y audience son obligatorios");
    }
    if (config.allowedAlgorithms.length === 0) {
      throw new Error("JwtVerifier: se requiere al menos un algoritmo permitido");
    }
    this.#config = config;
    this.#clock = options.clock ?? systemClock;
    this.#jwks = options.jwks;
  }

  async verify(token: string): Promise<SupabaseClaims> {
    const parts = token.split(".");
    if (parts.length !== 3) throw unauthorized("JWT malformado");
    const header = decodeJson(parts[0]!, "header");
    const payload = decodeJson(parts[1]!, "payload");
    const signature = parts[2]!;

    const alg = header.alg;
    if (typeof alg !== "string" || !this.#config.allowedAlgorithms.includes(alg as never)) {
      throw unauthorized("Algoritmo no permitido");
    }
    if (header.typ !== undefined && header.typ !== "JWT") {
      throw unauthorized("Tipo de token no permitido");
    }

    const signingInput = `${parts[0]}.${parts[1]}`;
    if (alg === "HS256") {
      if (!this.#config.hmacSecret) throw unauthorized("HS256 no configurado");
      const expected = createHmac("sha256", this.#config.hmacSecret)
        .update(signingInput)
        .digest("base64url");
      if (!constantTimeEqualString(expected, signature)) throw unauthorized("Firma inválida");
    } else {
      const key = await this.#resolveAsyncKey(header, alg as "RS256" | "ES256");
      const ok = cryptoVerify(
        alg === "RS256" ? "RSA-SHA256" : "sha256",
        Buffer.from(signingInput),
        { key, dsaEncoding: "ieee-p1363" },
        Buffer.from(signature, "base64url"),
      );
      if (!ok) throw unauthorized("Firma inválida");
    }

    return this.#validateClaims(payload);
  }

  async #resolveAsyncKey(
    header: Record<string, unknown>,
    alg: "RS256" | "ES256",
  ): Promise<ReturnType<typeof createPublicKey>> {
    const url = this.#config.jwksUrl;
    if (!url || !this.#jwks) throw unauthorized("JWKS no configurado");
    const kid = typeof header.kid === "string" ? header.kid : undefined;
    const keys = await this.#loadKeys(url);
    const candidate = keys.find((key) => (kid ? key.kid === kid : true));
    if (!candidate) throw unauthorized("Clave de firma desconocida");
    if (alg === "RS256" && candidate.kty !== "RSA") throw unauthorized("Tipo de clave inválido");
    if (alg === "ES256" && candidate.kty !== "EC") throw unauthorized("Tipo de clave inválido");
    try {
      return createPublicKey({ key: candidate as never, format: "jwk" });
    } catch {
      throw unauthorized("JWK inválida");
    }
  }

  async #loadKeys(url: string): Promise<Jwk[]> {
    const now = this.#clock.now().getTime();
    const cached = this.#cache.get(url);
    if (cached && cached.expiresAt > now) return cached.keys;
    const fetched = await this.#jwks!.fetchJwks(url);
    if (!Array.isArray(fetched.keys)) throw unauthorized("JWKS inválido");
    this.#cache.set(url, {
      keys: fetched.keys,
      expiresAt: now + this.#config.jwksCacheSeconds * 1000,
    });
    return fetched.keys;
  }

  #validateClaims(payload: Record<string, unknown>): SupabaseClaims {
    const nowSeconds = Math.floor(this.#clock.now().getTime() / 1000);
    const leeway = this.#config.clockToleranceSeconds;

    const exp = requireNumber(payload.exp, "exp");
    const iat = requireNumber(payload.iat, "iat");
    const sub = requireString(payload.sub, "sub");
    const aud = payload.aud;
    const iss = requireString(payload.iss, "iss");
    const role = typeof payload.role === "string" ? payload.role : "authenticated";

    if (exp + leeway < nowSeconds) throw unauthorized("Token caducado");
    if (iat - leeway > nowSeconds) throw unauthorized("iat en el futuro");
    if (typeof payload.nbf === "number" && payload.nbf - leeway > nowSeconds) {
      throw unauthorized("Token no vigente (nbf)");
    }
    if (iss !== this.#config.issuer) throw unauthorized("Issuer no permitido");
    const audiences = Array.isArray(aud) ? aud : [aud];
    if (!audiences.includes(this.#config.audience)) throw unauthorized("Audience no permitido");

    const appMetadata =
      payload.app_metadata && typeof payload.app_metadata === "object"
        ? (payload.app_metadata as Record<string, unknown>)
        : {};
    const tenantIdClaim =
      typeof payload.tenant_id === "string"
        ? payload.tenant_id
        : typeof appMetadata.tenant_id === "string"
          ? appMetadata.tenant_id
          : undefined;

    return {
      sub,
      role,
      aud: this.#config.audience,
      iss,
      exp,
      iat,
      ...(typeof payload.nbf === "number" ? { nbf: payload.nbf } : {}),
      ...(tenantIdClaim ? { tenantIdClaim } : {}),
      appMetadata,
      raw: payload,
    };
  }
}

function decodeJson(segment: string, label: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(Buffer.from(segment, "base64url").toString("utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("no es objeto");
    }
    return parsed as Record<string, unknown>;
  } catch {
    throw unauthorized(`JWT ${label} inválido`);
  }
}

function requireNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw unauthorized(`Claim ${field} ausente o inválido`);
  }
  return value;
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw unauthorized(`Claim ${field} ausente o inválido`);
  }
  return value;
}

/** Huella no reversible de un token, para logs sin exponerlo (CLI-C36). */
export function tokenFingerprint(token: string): string {
  return sha256Hex(token).slice(0, 16);
}
