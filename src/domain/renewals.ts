import { conflict, forbidden, invalid, notFound } from "../lib/errors.ts";
import { opaqueId } from "../lib/ids.ts";

/**
 * Renovaciones y reclamaciones (CLI-C31).
 * El servicio puede detectar una renovación y **proponer** una compensación.
 * No ejecuta reembolsos, pagos, cancelaciones ni firmas: eso pertenece a
 * Finanzas/Legal con su propia autoridad.
 */
export const REMEDIES = ["explanation", "service_credit", "refund_proposal", "contract_review"] as const;
export type Remedy = (typeof REMEDIES)[number];

export type ApprovalRole = "support_lead" | "finance" | "legal";

export interface CompensationPolicy {
  readonly version: string;
  readonly currency: string;
  readonly serviceCreditCap: string;
  readonly refundThreshold: string;
  readonly refundAllowedCategories: readonly ClaimCategory[];
}

export const DEFAULT_COMPENSATION_POLICY: CompensationPolicy = {
  version: "compensation-2026-11",
  currency: "EUR",
  serviceCreditCap: "50.00",
  refundThreshold: "200.00",
  refundAllowedCategories: ["billing", "service"],
};

export type ClaimCategory = "billing" | "service" | "data" | "other";
export type ClaimSeverity = "low" | "normal" | "high";

export interface Claim {
  readonly id: string;
  readonly tenantId: string;
  readonly caseRef: string;
  readonly category: ClaimCategory;
  readonly severity: ClaimSeverity;
  readonly evidenceRefs: readonly string[];
  readonly receivedAt: string;
}

export interface CompensationProposal {
  readonly id: string;
  readonly tenantId: string;
  readonly claimRef: string;
  readonly remedy: Remedy;
  readonly amount: string | null;
  readonly currency: string;
  readonly proposerRef: string;
  readonly policyVersion: string;
  readonly requiredApprovals: readonly ApprovalRole[];
  readonly approvals: readonly { actorRef: string; role: ApprovalRole; at: string }[];
  state: "proposed" | "approved" | "rejected";
  readonly evidenceRefs: readonly string[];
}

const DECIMAL = /^\d{1,12}(\.\d{1,2})?$/u;

function toCents(value: string): number {
  if (!DECIMAL.test(value)) throw invalid("importe decimal inválido");
  const [units, fraction = ""] = value.split(".");
  return Number(units) * 100 + Number(fraction.padEnd(2, "0"));
}

export type RenewalState = "upcoming" | "in_notice" | "overdue" | "renewed";

export interface RenewalRecord {
  readonly id: string;
  readonly tenantId: string;
  readonly organizationRef: string;
  readonly contractRef: string;
  readonly renewsAt: string;
  readonly noticeDays: number;
  readonly ownerRef: string;
  state: RenewalState;
}

export interface RenewalDue {
  readonly record: RenewalRecord;
  readonly window: "outside" | "in_notice" | "overdue";
  readonly daysToRenewal: number;
}

/** Calendario determinista: sin husos implícitos ni "días hábiles" inventados. */
export class RenewalCalendar {
  readonly #records: RenewalRecord[] = [];

  register(input: Omit<RenewalRecord, "id" | "state">): RenewalRecord {
    if (!input.tenantId) throw invalid("tenantId requerido");
    if (input.noticeDays < 0) throw invalid("noticeDays no puede ser negativo");
    if (Number.isNaN(Date.parse(input.renewsAt))) throw invalid("renewsAt inválido");
    const record: RenewalRecord = { ...input, id: opaqueId("renewal"), state: "upcoming" };
    this.#records.push(record);
    return record;
  }

  /** Ventana de aviso calculada con la fecha dada, nunca con la del sistema. */
  due(tenantId: string, now: string): readonly RenewalDue[] {
    const nowMs = Date.parse(now);
    if (Number.isNaN(nowMs)) throw invalid("now inválido");
    return this.#records
      .filter((record) => record.tenantId === tenantId && record.state !== "renewed")
      .map((record) => {
        const days = Math.floor((Date.parse(record.renewsAt) - nowMs) / 86_400_000);
        const window: RenewalDue["window"] =
          days < 0 ? "overdue" : days <= record.noticeDays ? "in_notice" : "outside";
        return { record, window, daysToRenewal: days };
      })
      .sort((a, b) => a.daysToRenewal - b.daysToRenewal);
  }

  markRenewed(tenantId: string, renewalRef: string, approvedBy: string): RenewalRecord {
    const record = this.#records.find((r) => r.id === renewalRef && r.tenantId === tenantId);
    if (!record) throw notFound("Renovación no encontrada");
    if (!approvedBy) throw forbidden("Renovar requiere autorización identificada");
    if (record.state === "renewed") throw conflict("La renovación ya está aplicada");
    record.state = "renewed";
    return record;
  }
}

export interface ClaimIntake {
  tenantId: string;
  caseRef: string;
  category: ClaimCategory;
  severity: ClaimSeverity;
  evidenceRefs: readonly string[];
  receivedAt: string;
}

export class ClaimsDesk {
  readonly #claims: Claim[] = [];
  readonly #proposals: CompensationProposal[] = [];
  readonly #policy: CompensationPolicy;
  readonly #now: () => string;

  constructor(options: { policy?: CompensationPolicy; now?: () => string } = {}) {
    this.#policy = options.policy ?? DEFAULT_COMPENSATION_POLICY;
    this.#now = options.now ?? (() => new Date().toISOString());
  }

  intake(input: ClaimIntake): Claim {
    if (!input.tenantId) throw invalid("tenantId requerido");
    if (input.evidenceRefs.length === 0) throw forbidden("Una reclamación requiere evidencia");
    const claim: Claim = { ...input, id: opaqueId("claim"), evidenceRefs: [...input.evidenceRefs] };
    this.#claims.push(claim);
    return claim;
  }

  /**
   * Propone una compensación con las aprobaciones que exige la política.
   * Nunca crea un reembolso: solo una propuesta para Finanzas.
   */
  propose(input: {
    tenantId: string;
    claimRef: string;
    remedy: Remedy;
    amount?: string | null;
    proposerRef: string;
  }): CompensationProposal {
    const claim = this.#claims.find((c) => c.id === input.claimRef && c.tenantId === input.tenantId);
    if (!claim) throw notFound("Reclamación no encontrada");
    if (!REMEDIES.includes(input.remedy)) throw invalid("Remedio no permitido");
    if (input.remedy === "refund_proposal" && !this.#policy.refundAllowedCategories.includes(claim.category)) {
      throw forbidden("La política no permite proponer reembolso para esta categoría");
    }
    let amount: string | null = null;
    if (input.remedy === "service_credit" || input.remedy === "refund_proposal") {
      if (!input.amount) throw invalid("El remedio elegido requiere importe");
      amount = input.amount;
      toCents(amount); // valida forma decimal
      if (input.remedy === "service_credit" && toCents(amount) > toCents(this.#policy.serviceCreditCap)) {
        throw forbidden("El crédito supera el tope de la política");
      }
      if (input.remedy === "refund_proposal" && toCents(amount) > toCents(this.#policy.refundThreshold)) {
        throw forbidden("El reembolso supera el umbral: requiere autoridad superior");
      }
    }
    const required: ApprovalRole[] =
      input.remedy === "refund_proposal"
        ? ["finance", "legal"]
        : input.remedy === "contract_review"
          ? ["legal"]
          : input.remedy === "service_credit"
            ? ["support_lead", "finance"]
            : [];
    const proposal: CompensationProposal = {
      id: opaqueId("comp"),
      tenantId: input.tenantId,
      claimRef: claim.id,
      remedy: input.remedy,
      amount,
      currency: this.#policy.currency,
      proposerRef: input.proposerRef,
      policyVersion: this.#policy.version,
      requiredApprovals: required,
      approvals: [],
      state: required.length === 0 ? "approved" : "proposed",
      evidenceRefs: [...claim.evidenceRefs],
    };
    this.#proposals.push(proposal);
    return proposal;
  }

  /** Aprobación por rol y separación de funciones; el proponente no aprueba. */
  approve(input: {
    tenantId: string;
    proposalRef: string;
    approverRef: string;
    role: ApprovalRole;
  }): CompensationProposal {
    const proposal = this.#proposals.find((p) => p.id === input.proposalRef && p.tenantId === input.tenantId);
    if (!proposal) throw notFound("Propuesta no encontrada");
    if (proposal.state === "approved") throw conflict("La propuesta ya está aprobada");
    if (proposal.state === "rejected") throw conflict("La propuesta fue rechazada");
    if (input.approverRef === proposal.proposerRef) throw forbidden("El proponente no puede aprobar");
    if (!proposal.requiredApprovals.includes(input.role)) throw forbidden("Rol no requerido para esta propuesta");
    if (proposal.approvals.some((a) => a.role === input.role)) throw conflict("Ese rol ya aprobó");
    const next = [...proposal.approvals, { actorRef: input.approverRef, role: input.role, at: this.#now() }];
    const updated: CompensationProposal = { ...proposal, approvals: next };
    updated.state = proposal.requiredApprovals.every((role) => next.some((a) => a.role === role))
      ? "approved"
      : "proposed";
    this.#proposals.splice(this.#proposals.indexOf(proposal), 1, updated);
    return updated;
  }

  reject(input: { tenantId: string; proposalRef: string; byRef: string; reason: string }): CompensationProposal {
    const proposal = this.#proposals.find((p) => p.id === input.proposalRef && p.tenantId === input.tenantId);
    if (!proposal) throw notFound("Propuesta no encontrada");
    if (!input.reason) throw invalid("Rechazar requiere motivo");
    const updated: CompensationProposal = { ...proposal, state: "rejected" };
    this.#proposals.splice(this.#proposals.indexOf(proposal), 1, updated);
    return updated;
  }

  proposals(tenantId: string): readonly CompensationProposal[] {
    return this.#proposals.filter((p) => p.tenantId === tenantId);
  }

  /**
   * No existe ejecución financiera en este servicio. La función existe para que
   * el intento falle de forma explícita y auditables, no en silencio.
   */
  execute(): never {
    throw forbidden("Ejecutar reembolsos o pagos no es una capacidad de este servicio");
  }
}
