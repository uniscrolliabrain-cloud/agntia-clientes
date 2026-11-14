import { createHmac } from "node:crypto";
import { forbidden, notConfigured, unsupported } from "../lib/errors.ts";
import { opaqueId, sha256Hex } from "../lib/ids.ts";
import type { Clock } from "../lib/time.ts";
import { nowIso, systemClock } from "../lib/time.ts";

/**
 * Anam como presencia del twin (CLI-C32).
 * El token de Anam es efímero y distinto del JWT Supabase: no acredita identidad
 * ni aprobación. La API key nunca sale del backend. Sin configurar → not_configured.
 */
export interface AnamConfig {
  enabled: boolean;
  apiKey: string | null;
  baseUrl: string;
  maxDurationMinutes: number;
  recordingAllowed: boolean;
}

export interface AdvisorSessionGrant {
  id: string;
  tenantId: string;
  twinBindingId: string;
  caseRef: string | null;
  capabilities: readonly string[];
  expiresAt: string;
  ephemeralToken: string;
  sessionScopeHash: string;
  disclosure: string;
  recording: "disabled" | "configured";
}

export class AnamPresence {
  readonly #config: AnamConfig;
  readonly #clock: Clock;
  readonly #revokedTenants = new Set<string>();
  readonly #issued = new Map<string, AdvisorSessionGrant>();

  constructor(config: AnamConfig, options: { clock?: Clock } = {}) {
    this.#config = config;
    this.#clock = options.clock ?? systemClock;
  }

  /** El backend emite el token; el navegador nunca recibe la API key. */
  issueSession(input: {
    tenantId: string;
    principalRef: string;
    twinBindingId: string;
    caseRef: string | null;
    capabilities: readonly string[];
    durationMinutes: number;
    recordingRequested: boolean;
    consentRecording: boolean;
  }): AdvisorSessionGrant {
    if (!this.#config.enabled || !this.#config.apiKey) {
      throw notConfigured("Anam no configurado: usar fallback de texto");
    }
    if (this.#revokedTenants.has(input.tenantId)) {
      throw forbidden("Tenant revocado para presencia");
    }
    if (input.capabilities.some((c) => ["approve", "send", "refund", "export_all"].includes(c))) {
      throw unsupported("El avatar no recibe capacidades de efecto");
    }
    if (input.durationMinutes > this.#config.maxDurationMinutes) {
      throw forbidden("Duración por encima del máximo configurado");
    }
    if (input.recordingRequested && (!this.#config.recordingAllowed || !input.consentRecording)) {
      throw forbidden("Grabación sin política y consentimiento aprobados");
    }
    const expiresAt = new Date(
      this.#clock.now().getTime() + input.durationMinutes * 60_000,
    ).toISOString();
    const scopeHash = sha256Hex(
      `${input.tenantId}:${input.twinBindingId}:${input.caseRef ?? "none"}:${expiresAt}`,
    );
    // Token efímero de desarrollo: en producción lo emite Anam y aquí solo se custodia.
    const ephemeralToken = createHmac("sha256", this.#config.apiKey)
      .update(`${scopeHash}:${opaqueId("ses")}`)
      .digest("hex");
    const grant: AdvisorSessionGrant = {
      id: opaqueId("av"),
      tenantId: input.tenantId,
      twinBindingId: input.twinBindingId,
      caseRef: input.caseRef,
      capabilities: input.capabilities,
      expiresAt,
      ephemeralToken,
      sessionScopeHash: scopeHash,
      disclosure: "Asistente de IA: no es una persona y no puede firmar ni aprobar por ti.",
      recording: input.recordingRequested ? "configured" : "disabled",
    };
    this.#issued.set(grant.id, grant);
    return grant;
  }

  /** Revocación inmediata: sin contexto residual accesible. */
  revokeTenant(tenantId: string): void {
    this.#revokedTenants.add(tenantId);
    for (const [id, grant] of this.#issued) {
      if (grant.tenantId === tenantId) this.#issued.delete(id);
    }
  }

  /** Un sí oral es una propuesta; la UI autenticada confirma. */
  oralConfirmation(): { createsProposal: true; authorizes: false; reason: string } {
    return {
      createsProposal: true,
      authorizes: false,
      reason: "La voz no acredita identidad ni firma; requiere confirmación autenticada",
    };
  }

  issuedSessionCount(tenantId: string): number {
    return [...this.#issued.values()].filter((g) => g.tenantId === tenantId).length;
  }

  snapshot(): { configured: boolean; sessions: number; at: string } {
    return {
      configured: Boolean(this.#config.apiKey),
      sessions: this.#issued.size,
      at: nowIso(this.#clock),
    };
  }
}
