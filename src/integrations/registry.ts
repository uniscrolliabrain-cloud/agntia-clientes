import { createHash, randomBytes } from "node:crypto";
import { conflict, forbidden, notConfigured, notFound } from "../lib/errors.ts";
import { opaqueId, sha256Hex } from "../lib/ids.ts";
import type { Clock } from "../lib/time.ts";
import { nowIso, systemClock } from "../lib/time.ts";

/**
 * Registro de proveedores, OAuth y secretos (CLI-C09).
 * El agente nunca elige baseURL, token, método ni workspace remoto.
 * Los valores de secretos no se serializan al portal ni se registran.
 */
export type Provider = "chatwoot" | "twenty" | "frappe" | "zammad" | "resend" | "whatsapp" | "anam";

export interface Connection {
  id: string;
  tenantId: string;
  provider: Provider;
  baseUrl: string;
  endpointRef: string;
  secretRef: string;
  remoteTenantRef: string;
  requestedCapabilities: readonly string[];
  status: "active" | "degraded" | "revoked" | "not_configured";
  revocationVersion: number;
  updatedAt: string;
}

export interface SecretStore {
  get(secretRef: string): Promise<string | null>;
  put(secretRef: string, value: string): Promise<void>;
  revoke(secretRef: string): Promise<void>;
}

/** Solo desarrollo: valores en memoria, jamás persistidos ni logueados. */
export class InMemorySecretStore implements SecretStore {
  readonly #values = new Map<string, string>();

  async get(secretRef: string): Promise<string | null> {
    return this.#values.get(secretRef) ?? null;
  }

  async put(secretRef: string, value: string): Promise<void> {
    if (value.length < 8) throw forbidden("Secreto demasiado corto");
    this.#values.set(secretRef, value);
  }

  async revoke(secretRef: string): Promise<void> {
    this.#values.delete(secretRef);
  }

  /** Centinelas para tests de fuga (nunca contiene secretos reales). */
  refs(): string[] {
    return [...this.#values.keys()];
  }
}

export class ConnectionRegistry {
  readonly #connections = new Map<string, Connection>();
  readonly #secrets: SecretStore;
  readonly #clock: Clock;
  readonly #oauthStates = new Map<string, { tenantId: string; provider: Provider; verifierHash: string; expiresAt: number }>();

  constructor(secrets: SecretStore, options: { clock?: Clock } = {}) {
    this.#secrets = secrets;
    this.#clock = options.clock ?? systemClock;
  }

  register(input: Omit<Connection, "id" | "status" | "revocationVersion" | "updatedAt">): Connection {
    const connection: Connection = {
      ...input,
      id: opaqueId("conn"),
      status: "not_configured",
      revocationVersion: 0,
      updatedAt: nowIso(this.#clock),
    };
    this.#connections.set(connection.id, connection);
    return connection;
  }

  require(tenantId: string, connectionId: string): Connection {
    const connection = this.#connections.get(connectionId);
    if (!connection || connection.tenantId !== tenantId) throw notFound();
    if (connection.status === "revoked") throw forbidden("Conexión revocada");
    return connection;
  }

  async credential(tenantId: string, connectionId: string): Promise<string> {
    const connection = this.require(tenantId, connectionId);
    const secret = await this.#secrets.get(connection.secretRef);
    if (!secret) throw notConfigured(`Conexión ${connection.provider} sin credencial`);
    return secret;
  }

  markActive(tenantId: string, connectionId: string): Connection {
    return this.#patch(tenantId, connectionId, { status: "active" });
  }

  markDegraded(tenantId: string, connectionId: string): Connection {
    return this.#patch(tenantId, connectionId, { status: "degraded" });
  }

  /** Rotar/revocar detiene nuevos efectos sin fallback administrativo. */
  revoke(tenantId: string, connectionId: string): Connection {
    const connection = this.require(tenantId, connectionId);
    void this.#secrets.revoke(connection.secretRef);
    return this.#patch(tenantId, connectionId, {
      status: "revoked",
      revocationVersion: connection.revocationVersion + 1,
    });
  }

  /** OAuth: state ligado a tenant + sesión y PKCE (S256). */
  beginOAuth(input: { tenantId: string; provider: Provider; codeVerifier: string; ttlSeconds?: number }) {
    const state = randomBytes(16).toString("base64url");
    this.#oauthStates.set(state, {
      tenantId: input.tenantId,
      provider: input.provider,
      verifierHash: sha256Hex(input.codeVerifier),
      expiresAt: this.#clock.now().getTime() + (input.ttlSeconds ?? 300) * 1000,
    });
    return { state, codeChallenge: createHash("sha256").update(input.codeVerifier).digest("base64url") };
  }

  completeOAuth(input: { state: string; tenantId: string; provider: Provider; codeVerifier: string }): void {
    const stored = this.#oauthStates.get(input.state);
    this.#oauthStates.delete(input.state);
    if (!stored) throw forbidden("state desconocido");
    if (stored.expiresAt < this.#clock.now().getTime()) throw forbidden("state caducado");
    if (stored.tenantId !== input.tenantId) throw forbidden("Callback de otro tenant/sesión");
    if (stored.provider !== input.provider) throw forbidden("Provider distinto al iniciado");
    if (stored.verifierHash !== sha256Hex(input.codeVerifier)) throw conflict("PKCE inválido");
  }

  #patch(tenantId: string, connectionId: string, patch: Partial<Connection>): Connection {
    const connection = this.require(tenantId, connectionId);
    const next = { ...connection, ...patch, updatedAt: nowIso(this.#clock) };
    this.#connections.set(connectionId, next);
    return next;
  }
}
