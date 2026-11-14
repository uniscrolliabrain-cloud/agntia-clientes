import { conflict, forbidden, invalid } from "../lib/errors.ts";
import { opaqueId, sha256Hex } from "../lib/ids.ts";
import type { Clock } from "../lib/time.ts";
import { nowIso, systemClock } from "../lib/time.ts";

/**
 * Canal web y sesiones de contacto (CLI-C18).
 * El ingreso público es acotado: no crea membresía ni identidad verificada.
 * El tenant se resuelve en servidor por binding de formulario/inbox.
 */
export interface IntakeBinding {
  formId: string;
  tenantId: string;
  inboxId: string;
  maxBytes: number;
  allowedLocales: readonly ("es" | "en" | "fr")[];
  rateLimitPerHour: number;
}

export interface AnonymousIntake {
  id: string;
  tenantId: string;
  formId: string;
  threadId: string;
  verified: false;
  createdAt: string;
  expiresAt: string;
}

export interface RealtimeFrame {
  tenantId: string;
  threadId: string;
  seq: number;
  text: string;
}

export class WebChannel {
  readonly #bindings = new Map<string, IntakeBinding>();
  readonly #sessions = new Map<string, AnonymousIntake>();
  readonly #seenEvents = new Set<string>();
  readonly #rate = new Map<string, { windowStart: number; count: number }>();
  readonly #clock: Clock;

  constructor(options: { clock?: Clock } = {}) {
    this.#clock = options.clock ?? systemClock;
  }

  bindForm(binding: IntakeBinding): void {
    this.#bindings.set(binding.formId, binding);
  }

  openIntake(input: {
    formId: string;
    subjectKey: string;
    locale: string;
    text: string;
    clientEventId: string;
  }): AnonymousIntake {
    const binding = this.#bindings.get(input.formId);
    if (!binding) throw forbidden("Formulario no provisionado");
    if (!binding.allowedLocales.includes(input.locale as "es")) throw invalid("Locale no soportado");
    if (Buffer.byteLength(input.text, "utf8") > binding.maxBytes) {
      throw invalid("Mensaje demasiado grande");
    }
    const dedupKey = `${binding.tenantId}:${input.formId}:${input.clientEventId}`;
    if (this.#seenEvents.has(dedupKey)) throw conflict("Intake duplicado (idempotencia)");
    this.#applyRateLimit(binding, input.subjectKey);
    this.#seenEvents.add(dedupKey);
    const session: AnonymousIntake = {
      id: opaqueId("intake"),
      tenantId: binding.tenantId,
      formId: binding.formId,
      threadId: opaqueId("thread"),
      verified: false,
      createdAt: nowIso(this.#clock),
      expiresAt: new Date(this.#clock.now().getTime() + 24 * 3600 * 1000).toISOString(),
    };
    this.#sessions.set(session.id, session);
    return session;
  }

  /** Vincular a Contact exige verificación o invitación; compartir email no basta. */
  linkToContact(input: {
    session: AnonymousIntake;
    verifiedBy: "invitation" | "server_proof";
    contactId: string;
  }): { tenantId: string; contactId: string; threadId: string; evidence: string } {
    if (input.verifiedBy !== "invitation" && input.verifiedBy !== "server_proof") {
      throw forbidden("Vinculación sin prueba de servidor");
    }
    return {
      tenantId: input.session.tenantId,
      contactId: input.contactId,
      threadId: input.session.threadId,
      evidence: sha256Hex(`${input.session.id}:${input.contactId}:${input.verifiedBy}`),
    };
  }

  /** Realtime: un canal suscrito a A jamás recibe frames de B. */
  canDeliver(frame: RealtimeFrame, subscription: { tenantId: string; threadIds: readonly string[] }): boolean {
    return frame.tenantId === subscription.tenantId && subscription.threadIds.includes(frame.threadId);
  }

  #applyRateLimit(binding: IntakeBinding, subjectKey: string): void {
    const key = `${binding.tenantId}:${binding.formId}:${subjectKey}`;
    const now = this.#clock.now().getTime();
    const bucket = this.#rate.get(key);
    if (!bucket || now - bucket.windowStart > 3_600_000) {
      this.#rate.set(key, { windowStart: now, count: 1 });
      return;
    }
    if (bucket.count >= binding.rateLimitPerHour) throw conflict("Rate limit de intake alcanzado");
    bucket.count += 1;
  }
}
