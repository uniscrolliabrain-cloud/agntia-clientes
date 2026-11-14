import { conflict, forbidden, unsupported } from "../lib/errors.ts";
import type { DiscoveryService } from "../integrations/discovery.ts";

/**
 * WhatsApp oficial (CLI-C20): deshabilitado hasta capacidad confirmada.
 * La documentación de Meta devolvió HTTP 429 durante la investigación, así que
 * el canal queda NOT_VERIFIED y no se inventan ventanas, plantillas ni gratuidad.
 */
export interface WhatsAppCapabilities {
  verified: boolean;
  graphVersion: string | null;
  templates: readonly { name: string; category: "utility" | "marketing" | "authentication"; locale: string }[];
  sessionWindowMinutes: number | null;
}

export const WHATSAPP_UNVERIFIED: WhatsAppCapabilities = {
  verified: false,
  graphVersion: null,
  templates: [],
  sessionWindowMinutes: null,
};

export class WhatsAppChannel {
  readonly #capabilities: WhatsAppCapabilities;
  readonly #discovery?: DiscoveryService;
  readonly #connectionId: string;
  readonly #tenantId: string;

  constructor(input: {
    capabilities?: WhatsAppCapabilities;
    discovery?: DiscoveryService;
    connectionId: string;
    tenantId: string;
  }) {
    this.#capabilities = input.capabilities ?? WHATSAPP_UNVERIFIED;
    this.#discovery = input.discovery;
    this.#connectionId = input.connectionId;
    this.#tenantId = input.tenantId;
  }

  state(): { enabled: boolean; reason: string } {
    if (!this.#capabilities.verified) {
      return { enabled: false, reason: "documentation_revalidation_required" };
    }
    if (!this.#capabilities.graphVersion) {
      return { enabled: false, reason: "graph_version_not_pinned" };
    }
    return { enabled: true, reason: "capability_verified" };
  }

  assertCanSend(input: {
    templateName: string | null;
    category: "utility" | "marketing" | "authentication" | "free_form";
    purpose: "support_reply" | "marketing";
    approvedAt: string;
    lastInboundAt: string | null;
  }): void {
    const state = this.state();
    if (!state.enabled) throw unsupported(`WhatsApp no habilitado: ${state.reason}`);
    this.#discovery?.requireCapability(this.#tenantId, this.#connectionId, "message.create");

    if (input.category === "marketing" && input.purpose !== "marketing") {
      throw forbidden("Plantilla de marketing con finalidad de soporte");
    }
    if (input.category === "free_form") {
      if (!input.lastInboundAt || this.#capabilities.sessionWindowMinutes === null) {
        throw forbidden("Mensaje libre fuera de ventana verificada");
      }
      const elapsed =
        (Date.parse(input.approvedAt) - Date.parse(input.lastInboundAt)) / 60_000;
      if (elapsed > this.#capabilities.sessionWindowMinutes) {
        throw forbidden("Ventana de sesión expirada: requiere plantilla aprobada");
      }
      return;
    }
    if (!input.templateName) throw unsupported("Plantilla requerida");
    const template = this.#capabilities.templates.find(
      (candidate) => candidate.name === input.templateName,
    );
    if (!template) throw unsupported("Plantilla no verificada para este número");
    if (template.category !== input.category) {
      throw forbidden("Categoría de plantilla distinta a la aprobada");
    }
  }

  /** Sin dedup remoto probado no se reintenta tras timeout. */
  async sendWithUncertainty(input: { dispatch: () => Promise<{ remoteId: string }> }) {
    try {
      const result = await input.dispatch();
      return { state: "accepted" as const, remoteId: result.remoteId };
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") {
        return {
          state: "outcome_unknown" as const,
          reconciliationRequired: true,
          retryable: false,
        };
      }
      throw conflict("Fallo de WhatsApp no clasificado: bloqueado para revisión");
    }
  }
}
