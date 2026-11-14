import { conflict, forbidden, invalid } from "../lib/errors.ts";
import { sha256Hex } from "../lib/ids.ts";
import type { HttpTransport } from "../integrations/transport.ts";
import type { ProcessingLedger } from "../privacy/processing.ts";

/**
 * Correo transaccional (CLI-C19). accepted / delivered / bounced / resolved son
 * estados distintos. La ventana de deduplicación del proveedor (24 h) se
 * documenta y el ledger local sobrevive a ella.
 */
export interface EmailMessage {
  tenantId: string;
  from: string;
  to: readonly string[];
  cc: readonly string[];
  replyTo: string | null;
  subject: string;
  text: string;
  inReplyTo: string | null;
  references: readonly string[];
  attachments: readonly { ref: string; filename: string }[];
  idempotencyKey: string;
}

export interface DeliveryReceipt {
  providerRef: string;
  acceptedAt: string;
  state: "accepted" | "delivered" | "bounced" | "complained" | "outcome_unknown";
  sourceHash: string;
}

const HEADER_UNSAFE = /[\r\n]/u;

export class EmailChannel {
  readonly #transport: HttpTransport;
  readonly #ledger: ProcessingLedger;
  readonly #verifiedDomain: string;
  readonly #token: () => Promise<string>;
  readonly #sentByKey = new Map<string, DeliveryReceipt>();
  readonly #dedupWindowMs = 24 * 60 * 60 * 1000;

  constructor(input: {
    transport: HttpTransport;
    ledger: ProcessingLedger;
    verifiedDomain: string;
    token: () => Promise<string>;
  }) {
    this.#transport = input.transport;
    this.#ledger = input.ledger;
    this.#verifiedDomain = input.verifiedDomain;
    this.#token = input.token;
  }

  async send(message: EmailMessage): Promise<DeliveryReceipt> {
    this.#validate(message);
    const cached = this.#sentByKey.get(`${message.tenantId}:${message.idempotencyKey}`);
    if (cached) return cached;

    this.#ledger.assertMaySend({
      tenantId: message.tenantId,
      subjectRef: message.to[0] ?? "",
      channel: "email",
      addressRef: message.to[0] ?? "",
      purpose: "support_reply",
    });

    const response = await this.#transport.send({
      method: "POST",
      url: "https://api.resend.com/emails",
      headers: {
        Authorization: `Bearer ${await this.#token()}`,
        "Content-Type": "application/json",
        "Idempotency-Key": message.idempotencyKey,
      },
      body: JSON.stringify({
        from: message.from,
        to: message.to,
        cc: message.cc,
        reply_to: message.replyTo,
        subject: message.subject,
        text: message.text,
        headers: buildThreadHeaders(message),
      }),
    });

    if (response.status === 429) throw conflict("Proveedor de correo: rate limit");
    if (response.status >= 500) {
      throw conflict("Resultado incierto de correo: reconciliar, no reintentar");
    }
    if (response.status !== 200) throw invalid(`Correo rechazado: HTTP ${response.status}`);

    const parsed = JSON.parse(response.body) as { id?: string };
    if (!parsed.id) {
      throw conflict("Proveedor de correo sin id: entrega no confirmada");
    }
    const receipt: DeliveryReceipt = {
      providerRef: parsed.id,
      acceptedAt: new Date().toISOString(),
      state: "accepted",
      sourceHash: sha256Hex(response.body),
    };
    this.#sentByKey.set(`${message.tenantId}:${message.idempotencyKey}`, receipt);
    return receipt;
  }

  /**
   * Webhook de entrega: un evento tardío o repetido no retrocede estado confirmado,
   * y un bounce sí cambia el estado (es evidencia del canal).
   */
  applyProviderEvent(input: {
    providerRef: string;
    state: DeliveryReceipt["state"];
    occurredAt: string;
  }): DeliveryReceipt {
    const entry = [...this.#sentByKey.values()].find((r) => r.providerRef === input.providerRef);
    if (!entry) throw forbidden("Receipt desconocido");
    if (entry.state === "delivered" && input.state === "accepted") return entry;
    const next: DeliveryReceipt = { ...entry, state: input.state };
    this.#sentByKey.set(
      [...this.#sentByKey.entries()].find(([, r]) => r.providerRef === input.providerRef)?.[0] ?? "",
      next,
    );
    return next;
  }

  dedupWindow(): number {
    return this.#dedupWindowMs;
  }

  #validate(message: EmailMessage): void {
    if (message.to.length === 0) throw invalid("Correo sin destinatarios");
    if (HEADER_UNSAFE.test(message.subject)) throw invalid("Asunto con CRLF");
    if (message.from && !message.from.endsWith(`@${this.#verifiedDomain}`)) {
      throw forbidden("From fuera del dominio verificado");
    }
    for (const address of [message.from, ...message.to, ...message.cc, message.replyTo ?? ""]) {
      if (!address) continue;
      if (HEADER_UNSAFE.test(address) || !address.includes("@")) {
        throw invalid("Dirección de correo inválida");
      }
    }
  }
}

function buildThreadHeaders(message: EmailMessage): Record<string, string> {
  const headers: Record<string, string> = {};
  if (message.inReplyTo) headers["In-Reply-To"] = `<${message.inReplyTo}>`;
  if (message.references.length > 0) {
    headers.References = message.references.map((ref) => `<${ref}>`).join(" ");
  }
  return headers;
}

/** Resolución de hilo: Message-ID/References + binding, nunca solo el asunto. */
export function resolveThread(input: {
  inReplyTo: string | null;
  references: readonly string[];
  knownThreadIds: ReadonlySet<string>;
  bindingTenantId: string;
  messageTenantId: string;
}): string | null {
  if (input.bindingTenantId !== input.messageTenantId) return null;
  const candidates = [input.inReplyTo, ...input.references].filter(
    (value): value is string => typeof value === "string" && value.length > 0,
  );
  return candidates.find((id) => input.knownThreadIds.has(id)) ?? null;
}
