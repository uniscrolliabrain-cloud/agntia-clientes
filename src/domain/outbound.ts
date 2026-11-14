import { conflict, forbidden, invalid } from "../lib/errors.ts";
import { hashCanonical, operationKey, opaqueId } from "../lib/ids.ts";
import type { OutboundIntent } from "../contracts/dto.ts";
import type { Clock } from "../lib/time.ts";
import { systemClock } from "../lib/time.ts";

/**
 * OutboundIntent + ledger de idempotencia (CLI-C14/C26/C27).
 * Reglas clave:
 *  - `delivered` solo con evidencia del canal; `accepted` no es entrega.
 *  - Replay con el mismo payload devuelve el mismo intent; otro payload → 409.
 *  - Tras incertidumbre no se reintenta a ciegas: outcome_unknown + reconciliación.
 */
const ALLOWED: Record<OutboundIntent["state"], readonly OutboundIntent["state"][]> = {
  proposed: ["awaiting_approval", "cancelled"],
  awaiting_approval: ["approved", "cancelled"],
  approved: ["queued", "cancelled"],
  queued: ["leased", "cancelled"],
  leased: ["dispatching", "queued"],
  dispatching: ["accepted", "delivered", "failed_definitive", "outcome_unknown"],
  accepted: ["delivered", "outcome_unknown", "reconciliation_required"],
  delivered: [],
  failed_definitive: ["queued"],
  outcome_unknown: ["reconciliation_required", "delivered", "accepted"],
  reconciliation_required: ["delivered", "accepted", "failed_definitive"],
  cancelled: [],
};

export interface CreateIntentInput {
  tenantId: string;
  conversationRef: string;
  contactRef: string;
  channel: OutboundIntent["channel"];
  payload: unknown;
  proposalRef: string;
}

export class OutboundLedger {
  readonly #clock: Clock;
  readonly #byOperation = new Map<string, OutboundIntent>();

  constructor(options: { clock?: Clock } = {}) {
    this.#clock = options.clock ?? systemClock;
  }

  create(input: CreateIntentInput): OutboundIntent {
    const key = operationKey([input.tenantId, input.channel, input.conversationRef, input.proposalRef]);
    const payloadHash = hashCanonical(input.payload);
    const existing = this.#byOperation.get(`${input.tenantId}:${key}`);
    if (existing) {
      if (existing.payloadHash !== payloadHash) {
        throw conflict("Idempotency-Key reutilizada con otro contenido");
      }
      return existing;
    }
    const now = this.#clock.now().toISOString();
    const intent: OutboundIntent = {
      id: opaqueId("intent"),
      tenantId: input.tenantId,
      operationKey: key,
      conversationRef: input.conversationRef,
      contactRef: input.contactRef,
      channel: input.channel,
      payloadHash,
      proposalRef: input.proposalRef,
      approvalRef: null,
      state: "proposed",
      leaseFence: 0,
      remoteRefs: [],
      reconciliationRef: null,
      createdAt: now,
      updatedAt: now,
    };
    this.#byOperation.set(`${input.tenantId}:${key}`, intent);
    return intent;
  }

  get(tenantId: string, id: string): OutboundIntent {
    for (const intent of this.#byOperation.values()) {
      if (intent.tenantId === tenantId && intent.id === id) return intent;
    }
    throw forbidden("Intent no encontrado");
  }

  list(tenantId: string): OutboundIntent[] {
    return [...this.#byOperation.values()].filter((i) => i.tenantId === tenantId);
  }

  attachApproval(tenantId: string, id: string, approvalRef: string): OutboundIntent {
    const intent = this.get(tenantId, id);
    if (intent.state !== "proposed") throw conflict("Solo un intent propuesto acepta aprobación");
    return this.#move(intent, "awaiting_approval", { approvalRef });
  }

  transition(
    tenantId: string,
    id: string,
    next: OutboundIntent["state"],
    patch: Partial<Pick<OutboundIntent, "remoteRefs" | "reconciliationRef" | "leaseFence">> = {},
  ): OutboundIntent {
    const intent = this.get(tenantId, id);
    const allowed = ALLOWED[intent.state] ?? [];
    if (!allowed.includes(next)) {
      throw conflict(`Transición ${intent.state} → ${next} no permitida`);
    }
    if (next === "delivered" && (patch.remoteRefs ?? intent.remoteRefs).length === 0) {
      throw invalid("delivered exige referencia verificable del canal");
    }
    if (next === "queued" && !intent.approvalRef) {
      throw forbidden("No se encola sin aprobación vinculada");
    }
    return this.#move(intent, next, patch);
  }

  /** Aceptado por el proveedor pero sin respuesta: incertidumbre explícita. */
  markOutcomeUnknown(tenantId: string, id: string, note: string): OutboundIntent {
    const intent = this.get(tenantId, id);
    return this.#move(intent, "outcome_unknown", { reconciliationRef: note });
  }

  #move(
    intent: OutboundIntent,
    next: OutboundIntent["state"],
    patch: Partial<Pick<OutboundIntent, "remoteRefs" | "reconciliationRef" | "leaseFence" | "approvalRef">>,
  ): OutboundIntent {
    const updated: OutboundIntent = {
      ...intent,
      ...patch,
      state: next,
      updatedAt: this.#clock.now().toISOString(),
    };
    this.#byOperation.set(`${intent.tenantId}:${intent.operationKey}`, updated);
    return updated;
  }
}
