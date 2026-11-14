import { forbidden, invalid } from "../lib/errors.ts";
import { opaqueId } from "../lib/ids.ts";
import type { Clock } from "../lib/time.ts";
import { nowIso, systemClock } from "../lib/time.ts";
import type { ConsentEvent, ProcessingBasis } from "../contracts/dto.ts";

/**
 * Finalidades, bases y consentimiento (CLI-C07).
 * Una base declarada no concede todas las capacidades; un ticket no autoriza marketing.
 */
export type Purpose =
  | "support_reply"
  | "case_management"
  | "analytics"
  | "model_training"
  | "marketing"
  | "av_recording"
  | "onboarding";

const PURPOSE_BASES: Record<Purpose, readonly ProcessingBasis["lawfulBasis"][]> = {
  support_reply: ["contract", "legitimate_interest", "consent"],
  case_management: ["contract", "legal_obligation", "legitimate_interest"],
  analytics: ["legitimate_interest", "consent"],
  model_training: ["consent"],
  marketing: ["consent", "legitimate_interest"],
  av_recording: ["consent"],
  onboarding: ["contract"],
};

export class ProcessingLedger {
  readonly #bases: ProcessingBasis[] = [];
  readonly #consents: ConsentEvent[] = [];
  readonly #suppressions = new Set<string>();
  readonly #clock: Clock;

  constructor(options: { clock?: Clock } = {}) {
    this.#clock = options.clock ?? systemClock;
  }

  declareBasis(basis: ProcessingBasis): ProcessingBasis {
    if (!PURPOSE_BASES[basis.purpose as Purpose]) throw invalid("Finalidad desconocida");
    if (!PURPOSE_BASES[basis.purpose as Purpose].includes(basis.lawfulBasis)) {
      throw forbidden(`Base ${basis.lawfulBasis} no admitida para ${basis.purpose}`);
    }
    this.#bases.push(basis);
    return basis;
  }

  basisFor(tenantId: string, purpose: string, at = nowIso(this.#clock)): ProcessingBasis {
    const found = this.#bases.find(
      (b) =>
        b.purpose === purpose &&
        Date.parse(b.validFrom) <= Date.parse(at) &&
        (!b.validTo || Date.parse(b.validTo) >= Date.parse(at)) &&
        (b.scope.includes("tenant") || b.scope.includes(tenantId)),
    );
    if (!found) throw forbidden(`Sin base de tratamiento vigente para ${purpose}`);
    return found;
  }

  recordConsent(
    input: Omit<ConsentEvent, "id" | "occurredAt">,
  ): ConsentEvent {
    if (input.action === "grant" && !input.evidenceRef) {
      throw invalid("Grant sin evidencia verificable");
    }
    const event: ConsentEvent = {
      ...input,
      id: opaqueId("consent"),
      occurredAt: nowIso(this.#clock),
    };
    this.#consents.push(event);
    return event;
  }

  /** Estado derivado del ledger append-only. */
  consentState(
    tenantId: string,
    subjectRef: string,
    purpose: string,
    channel: string,
  ): "granted" | "withdrawn" | "unknown" {
    const relevant = this.#consents.filter(
      (c) =>
        c.tenantId === tenantId &&
        c.subjectRef === subjectRef &&
        c.purpose === purpose &&
        c.channel === channel,
    );
    const last = relevant.at(-1);
    return last ? (last.action === "grant" ? "granted" : "withdrawn") : "unknown";
  }

  suppress(tenantId: string, addressRef: string): void {
    this.#suppressions.add(`${tenantId}:${addressRef}`);
  }

  isSuppressed(tenantId: string, addressRef: string): boolean {
    return this.#suppressions.has(`${tenantId}:${addressRef}`);
  }

  /**
   * Revalidación inmediatamente antes del envío: una retirada posterior a la
   * aprobación bloquea el mensaje en cola.
   */
  assertMaySend(input: {
    tenantId: string;
    subjectRef: string;
    channel: string;
    addressRef: string;
    purpose: "support_reply" | "marketing" | "onboarding";
  }): void {
    if (this.isSuppressed(input.tenantId, input.addressRef)) {
      throw forbidden("Destinatario en lista de supresión");
    }
    const state = this.consentState(input.tenantId, input.subjectRef, input.purpose, input.channel);
    if (input.purpose === "marketing" && state !== "granted") {
      throw forbidden("Comunicación comercial sin consentimiento vigente");
    }
    if (input.purpose === "onboarding" && state === "withdrawn") {
      throw forbidden("Consentimiento retirado");
    }
  }

  events(): readonly ConsentEvent[] {
    return this.#consents;
  }
}
