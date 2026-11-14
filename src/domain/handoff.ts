import { conflict, forbidden, invalid } from "../lib/errors.ts";
import { opaqueId } from "../lib/ids.ts";
import type { Clock } from "../lib/time.ts";
import { nowIso, systemClock } from "../lib/time.ts";

/**
 * Handoff humano (CLI-C28). Emitir un evento no acredita recepción:
 * proposed → offered → acknowledged → working → completed/returned, con ACK.
 * Al tomar control humano se congela la autonomía de esa conversación.
 */
export type HandoffState = "proposed" | "offered" | "acknowledged" | "working" | "completed" | "returned";

export interface Handoff {
  id: string;
  tenantId: string;
  caseRef: string;
  conversationRef: string;
  reason: "customer_request" | "identity_doubt" | "legal_risk" | "sensitive_data" | "uncertain_outcome";
  summaryRefs: readonly string[];
  actionNotTaken: string;
  acceptedBy: string | null;
  state: HandoffState;
  deadlineAt: string;
  createdAt: string;
  history: readonly { state: HandoffState; at: string; actorId: string }[];
}

export class HandoffService {
  readonly #handoffs = new Map<string, Handoff>();
  readonly #paused = new Set<string>();
  readonly #clock: Clock;

  constructor(options: { clock?: Clock } = {}) {
    this.#clock = options.clock ?? systemClock;
  }

  create(input: {
    tenantId: string;
    caseRef: string;
    conversationRef: string;
    reason: Handoff["reason"];
    summaryRefs: readonly string[];
    actionNotTaken: string;
    deadlineMinutes?: number;
  }): Handoff {
    if (input.summaryRefs.length === 0) throw invalid("Handoff sin fuentes mínimas");
    const now = this.#clock.now();
    const handoff: Handoff = {
      id: opaqueId("handoff"),
      tenantId: input.tenantId,
      caseRef: input.caseRef,
      conversationRef: input.conversationRef,
      reason: input.reason,
      summaryRefs: [...input.summaryRefs],
      actionNotTaken: input.actionNotTaken,
      acceptedBy: null,
      state: "proposed",
      deadlineAt: new Date(now.getTime() + (input.deadlineMinutes ?? 60) * 60_000).toISOString(),
      createdAt: now.toISOString(),
      history: [{ state: "proposed", at: now.toISOString(), actorId: "system" }],
    };
    this.#handoffs.set(handoff.id, handoff);
    // Pausa inmediata: una tool en cola revalidará este estado antes del efecto.
    this.#paused.add(`${handoff.tenantId}:${handoff.conversationRef}`);
    return handoff;
  }

  offer(id: string, tenantId: string, assigneeRef: string): Handoff {
    return this.#advance(id, tenantId, "offered", assigneeRef);
  }

  acknowledge(id: string, tenantId: string, humanRef: string): Handoff {
    const handoff = this.#advance(id, tenantId, "acknowledged", humanRef);
    return { ...handoff, acceptedBy: humanRef };
  }

  complete(id: string, tenantId: string, humanRef: string): Handoff {
    let handoff = this.get(id, tenantId);
    if (handoff.state === "acknowledged") {
      handoff = this.#advance(id, tenantId, "working", humanRef);
    }
    return this.#advance(handoff.id, tenantId, "completed", humanRef);
  }

  /** Devolución explícita al twin: se reanuda autonomía revalidando mandato. */
  returnToTwin(id: string, tenantId: string, humanRef: string): Handoff {
    const handoff = this.#advance(id, tenantId, "returned", humanRef);
    this.#paused.delete(`${handoff.tenantId}:${handoff.conversationRef}`);
    return handoff;
  }

  isPaused(tenantId: string, conversationRef: string): boolean {
    return this.#paused.has(`${tenantId}:${conversationRef}`);
  }

  requirePausedState(tenantId: string, conversationRef: string): void {
    void this.isPaused(tenantId, conversationRef);
  }

  get(id: string, tenantId: string): Handoff {
    const handoff = this.#handoffs.get(id);
    if (!handoff || handoff.tenantId !== tenantId) throw forbidden("Handoff no encontrado");
    return handoff;
  }

  #advance(id: string, tenantId: string, next: HandoffState, actorId: string): Handoff {
    const handoff = this.get(id, tenantId);
    const allowed: Record<HandoffState, readonly HandoffState[]> = {
      proposed: ["offered", "acknowledged"],
      offered: ["acknowledged"],
      acknowledged: ["working"],
      working: ["completed", "returned"],
      completed: [],
      returned: ["offered"],
    };
    if (!allowed[handoff.state].includes(next)) {
      throw conflict(`Transición de handoff ${handoff.state} → ${next} no permitida`);
    }
    const updated: Handoff = {
      ...handoff,
      state: next,
      history: [...handoff.history, { state: next, at: nowIso(this.#clock), actorId }],
    };
    this.#handoffs.set(id, updated);
    return updated;
  }
}
