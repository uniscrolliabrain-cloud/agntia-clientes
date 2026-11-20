import { conflict, forbidden, unsupported } from "../lib/errors.ts";
import type { DiscoveryService } from "../integrations/discovery.ts";

/**
 * WhatsApp oficial (CLI-C20).
 *
 * Reglas documentadas y revalidadas el 2026-11-20 en la documentación oficial de
 * Meta (Cloud API): la ventana de servicio es de 24 h y se reinicia con cada
 * mensaje o llamada del usuario; fuera de la ventana solo se envían plantillas
 * preaprobadas; las categorías son marketing, utility y authentication.
 *
 * Documentación ≠ capacidad: sin WABA, número y plantillas aprobadas, el canal
 * sigue deshabilitado (`account_not_configured`) y no se inventa gratuidad ni
 * versión de Graph. La versión y las plantillas llegan por discovery (C10).
 */
export interface WhatsAppCapabilities {
  verified: boolean;
  graphVersion: string | null;
  templates: readonly { name: string; category: "utility" | "marketing" | "authentication"; locale: string }[];
  sessionWindowMinutes: number | null;
}

/** Hechos de la plataforma, con su fuente; no son una capacidad del tenant. */
export const WHATSAPP_DOCUMENTED = {
  sessionWindowMinutes: 24 * 60,
  requiresApprovedTemplateOutsideWindow: true,
  templateCategories: ["marketing", "utility", "authentication"] as const,
  templatesRequireApproval: true,
  revalidatedAt: "2026-11-20",
  sources: [
    "https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages",
    "https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/overview",
    "https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/template-categorization",
  ],
} as const;

export const WHATSAPP_UNVERIFIED: WhatsAppCapabilities = {
  verified: false,
  graphVersion: null,
  templates: [],
  sessionWindowMinutes: WHATSAPP_DOCUMENTED.sessionWindowMinutes,
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
      return { enabled: false, reason: "account_not_configured" };
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
