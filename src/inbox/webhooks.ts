import { createHmac } from "node:crypto";
import { conflict, forbidden, invalid } from "../lib/errors.ts";
import { constantTimeEqualHex, sha256Hex } from "../lib/ids.ts";
import type { Clock } from "../lib/time.ts";
import { nowIso, systemClock } from "../lib/time.ts";

/**
 * Inbox de webhooks (CLI-C21). Contenido entrante = dato no confiable:
 * firma, timestamp, replay, tamaño y tipo se validan antes de procesar.
 * Nunca cambia identidad, policy ni tools.
 */
export interface WebhookEnvelope {
  tenantId: string;
  connectionId: string;
  externalEventId: string;
  timestampSeconds: number;
  signatureHex: string;
  contentType: string;
  rawBody: string;
}

export interface WebhookVerifierOptions {
  secret: string;
  toleranceSeconds?: number;
  maxBytes?: number;
  clock?: Clock;
}

export interface AcceptedEvent {
  tenantId: string;
  connectionId: string;
  externalEventId: string;
  sourceHash: string;
  receivedAt: string;
  /** Cuerpo ya saneado, tratado como evidencia; jamás como instrucciones. */
  payload: Record<string, unknown>;
}

export class WebhookInbox {
  readonly #seen = new Set<string>();
  readonly #options: WebhookVerifierOptions;
  readonly #clock: Clock;

  constructor(options: WebhookVerifierOptions) {
    this.#options = options;
    this.#clock = options.clock ?? systemClock;
  }

  accept(envelope: WebhookEnvelope): AcceptedEvent {
    const maxBytes = this.#options.maxBytes ?? 262_144;
    if (Buffer.byteLength(envelope.rawBody, "utf8") > maxBytes) {
      throw invalid("Webhook demasiado grande");
    }
    if (!envelope.contentType.includes("application/json")) {
      throw invalid("Content-Type no soportado");
    }
    const nowSeconds = Math.floor(this.#clock.now().getTime() / 1000);
    const tolerance = this.#options.toleranceSeconds ?? 300;
    if (Math.abs(nowSeconds - envelope.timestampSeconds) > tolerance) {
      throw forbidden("Timestamp fuera de tolerancia");
    }
    const expected = createHmac("sha256", this.#options.secret)
      .update(`${envelope.timestampSeconds}.${envelope.rawBody}`)
      .digest("hex");
    if (!constantTimeEqualHex(expected, envelope.signatureHex)) {
      throw forbidden("Firma de webhook inválida");
    }
    const dedupKey = `${envelope.tenantId}:${envelope.connectionId}:${envelope.externalEventId}`;
    if (this.#seen.has(dedupKey)) throw conflict("Evento ya procesado (replay)");
    let payload: unknown;
    try {
      payload = JSON.parse(envelope.rawBody);
    } catch {
      throw invalid("JSON inválido");
    }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw invalid("Payload debe ser objeto");
    }
    this.#seen.add(dedupKey);
    return {
      tenantId: envelope.tenantId,
      connectionId: envelope.connectionId,
      externalEventId: envelope.externalEventId,
      sourceHash: sha256Hex(envelope.rawBody),
      receivedAt: nowIso(this.#clock),
      payload: payload as Record<string, unknown>,
    };
  }

  hasSeen(tenantId: string, connectionId: string, externalEventId: string): boolean {
    return this.#seen.has(`${tenantId}:${connectionId}:${externalEventId}`);
  }
}

/** Contenido no confiable: solo se usa como datos para el prompt, nunca como policy. */
export function asUntrustedData(event: AcceptedEvent): { kind: "untrusted_evidence"; text: string; hash: string } {
  return {
    kind: "untrusted_evidence",
    text: JSON.stringify(event.payload),
    hash: event.sourceHash,
  };
}
