import { createHash, randomUUID, timingSafeEqual } from "node:crypto";

/**
 * Identificadores opacos (CLI-C05). No se derivan de email, nombre ni posición.
 * El prefijo es solo legible para humanos; nunca autoriza nada.
 */
export type OpaqueId<Kind extends string> = string & { readonly __kind: Kind };

export function opaqueId<Kind extends string>(prefix: Kind): OpaqueId<Kind> {
  return `${prefix}_${randomUUID().replaceAll("-", "")}` as OpaqueId<Kind>;
}

export function isOpaqueId(value: string, prefix: string): boolean {
  return new RegExp(`^${prefix}_[0-9a-f]{32}$`).test(value);
}

/** JSON canónico: claves ordenadas, sin undefined, números finitos. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

function canonicalize(value: unknown): unknown {
  if (value === null || typeof value !== "object") {
    if (typeof value === "number" && !Number.isFinite(value)) {
      throw new TypeError("canonicalJson: número no finito");
    }
    return value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  const source = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(source).sort()) {
    const child = source[key];
    if (child === undefined) continue;
    out[key] = canonicalize(child);
  }
  return out;
}

export function sha256Hex(input: string | Uint8Array): string {
  return createHash("sha256").update(input).digest("hex");
}

export function hashCanonical(value: unknown): string {
  return sha256Hex(canonicalJson(value));
}

export function constantTimeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
}

export function constantTimeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

/** Clave de idempotencia de dominio: tenant + capacidad + clave estable. */
export function operationKey(parts: readonly (string | number)[]): string {
  return sha256Hex(parts.map((p) => String(p)).join("\u0000"));
}
