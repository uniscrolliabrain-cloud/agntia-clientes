import { conflict, forbidden } from "../lib/errors.ts";
import type { ApprovalBinding, AnswerProposal, OutboundIntent } from "../contracts/dto.ts";
import { assertApprovalCovers } from "../domain/approvals.ts";
import type { OutboundLedger } from "../domain/outbound.ts";
import type { ProcessingLedger } from "../privacy/processing.ts";
import type { BudgetLedger } from "../budget/budget.ts";

/**
 * Worker de despacho (CLI-C14/C27). Antes de cada efecto revalida:
 * tenant, aprobación vinculada, supresión/consentimiento, handoff y presupuesto.
 * Una cola durable no conserva permisos revocados.
 */
export interface DispatchPort {
  send(input: {
    tenantId: string;
    intent: OutboundIntent;
    proposal: AnswerProposal;
    approval: ApprovalBinding;
  }): Promise<{ state: "accepted" | "delivered"; remoteRef: string }>;
}

export interface DispatchContext {
  tenantId: string;
  intentId: string;
  proposal: AnswerProposal;
  approval: ApprovalBinding;
  caseVersion: number;
  policyVersion: string;
  recipientRef: string;
  channel: string;
  attachmentHashes: readonly string[];
  now: string;
  revocationVersion: number;
  autonomyPaused: boolean;
  purpose: "support_reply" | "marketing" | "onboarding";
  consentSubjectRef: string;
  addressRef: string;
}

export class DispatchWorker {
  readonly #intents: OutboundLedger;
  readonly #privacy: ProcessingLedger;
  readonly #budget: BudgetLedger;
  readonly #port: DispatchPort;

  constructor(input: {
    intents: OutboundLedger;
    privacy: ProcessingLedger;
    budget: BudgetLedger;
    port: DispatchPort;
  }) {
    this.#intents = input.intents;
    this.#privacy = input.privacy;
    this.#budget = input.budget;
    this.#port = input.port;
  }

  async dispatch(context: DispatchContext): Promise<OutboundIntent> {
    // 1) Revalidaciones deterministas antes de cualquier HTTP.
    if (context.autonomyPaused) {
      throw forbidden("Autonomía pausada por handoff humano: no se envía");
    }
    assertApprovalCovers(
      context.approval,
      {
        tenantId: context.tenantId,
        proposal: context.proposal,
        recipientRef: context.recipientRef,
        channel: context.channel,
        attachmentHashes: context.attachmentHashes,
        expectedVersion: context.approval.expectedVersion,
        policyVersion: context.policyVersion,
        caseVersion: context.caseVersion,
      },
      { now: context.now, revocationVersion: context.revocationVersion },
    );
    this.#privacy.assertMaySend({
      tenantId: context.tenantId,
      subjectRef: context.consentSubjectRef,
      channel: context.channel,
      addressRef: context.addressRef,
      purpose: context.purpose,
    });

    this.#intents.transition(context.tenantId, context.intentId, "approved");
    this.#budget.reserve({
      tenantId: context.tenantId,
      operationKey: `${context.intentId}:dispatch`,
      currency: "EUR",
      amount: "0.001",
    });
    this.#intents.transition(context.tenantId, context.intentId, "queued");
    const leased = this.#intents.transition(context.tenantId, context.intentId, "leased", {
      leaseFence: 1,
    });
    this.#intents.transition(context.tenantId, context.intentId, "dispatching");

    let result: { state: "accepted" | "delivered"; remoteRef: string };
    try {
      result = await this.#port.send({
        tenantId: context.tenantId,
        intent: leased,
        proposal: context.proposal,
        approval: context.approval,
      });
    } catch (error) {
      // Incertidumbre: no se reintenta a ciegas.
      return this.#intents.markOutcomeUnknown(
        context.tenantId,
        context.intentId,
        error instanceof Error ? error.message : "dispatch_failed",
      );
    }

    if (result.state === "delivered") {
      return this.#intents.transition(context.tenantId, context.intentId, "delivered", {
        remoteRefs: [result.remoteRef],
      });
    }
    const accepted = this.#intents.transition(context.tenantId, context.intentId, "accepted", {
      remoteRefs: [result.remoteRef],
    });
    // accepted NO es delivered: queda pendiente de receipt del canal.
    return accepted;
  }

  /** Reconciliación: solo con evidencia remota se pasa a delivered. */
  reconcile(input: {
    tenantId: string;
    intentId: string;
    evidence: { remoteRef: string; delivered: boolean };
  }): OutboundIntent {
    const intent = this.#intents.get(input.tenantId, input.intentId);
    if (intent.state !== "outcome_unknown" && intent.state !== "reconciliation_required" && intent.state !== "accepted") {
      throw conflict(`Reconciliación no aplicable en estado ${intent.state}`);
    }
    if (!input.evidence.delivered) {
      return this.#intents.transition(input.tenantId, input.intentId, "accepted", {
        remoteRefs: [input.evidence.remoteRef],
      });
    }
    return this.#intents.transition(input.tenantId, input.intentId, "delivered", {
      remoteRefs: [input.evidence.remoteRef],
    });
  }
}
