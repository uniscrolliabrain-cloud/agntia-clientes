import type { AnswerProposal, ApprovalBinding, OutboundIntent } from "../contracts/dto.ts";
import type { OnboardingPlan } from "../domain/onboarding.ts";
import { conflict } from "../lib/errors.ts";
import type { MemoryStore } from "./memory.ts";

/**
 * CLI-C06 · Repositorios de los agregados que completan las vertical slices.
 *
 * Mismas reglas que `CaseRepository`:
 * - el tenant llega ya resuelto por el PEP y el adaptador nunca devuelve filas
 *   de otro tenant (ni pistas de que existan);
 * - `save` es compare-and-swap; un 409 es preferible a perder estado;
 * - la creación de intents es idempotente por `operationKey` dentro del tenant.
 *
 * En memoria y en PostgreSQL comparten estos contratos: la ruta HTTP, el
 * gateway determinista y los tests ejercitan el mismo camino.
 */

export type RepositoryKind = "memory" | "postgres";

export interface ProposalRepository {
  readonly kind: RepositoryKind;
  insert(proposal: AnswerProposal): Promise<void>;
  get(tenantId: string, id: string): Promise<AnswerProposal | null>;
  list(tenantId: string): Promise<AnswerProposal[]>;
}

export interface ApprovalRepository {
  readonly kind: RepositoryKind;
  insert(approval: ApprovalBinding): Promise<void>;
  get(tenantId: string, id: string): Promise<ApprovalBinding | null>;
}

export interface IntentRepository {
  readonly kind: RepositoryKind;
  /** Idempotente: mismo tenant + operación devuelve el intent existente. */
  create(intent: OutboundIntent): Promise<{ intent: OutboundIntent; created: boolean }>;
  get(tenantId: string, id: string): Promise<OutboundIntent | null>;
  list(tenantId: string): Promise<OutboundIntent[]>;
  /** CAS sobre estado y leaseFence: no pisa una transición concurrente. */
  save(tenantId: string, next: OutboundIntent, expected: OutboundIntent): Promise<boolean>;
}

export interface PlanRepository {
  readonly kind: RepositoryKind;
  insert(plan: OnboardingPlan): Promise<void>;
  get(tenantId: string, id: string): Promise<OnboardingPlan | null>;
  list(tenantId: string): Promise<OnboardingPlan[]>;
  save(tenantId: string, next: OnboardingPlan, expectedVersion: number): Promise<boolean>;
}

export class MemoryProposalRepository implements ProposalRepository {
  readonly kind = "memory" as const;
  readonly #store: MemoryStore;

  constructor(store: MemoryStore) {
    this.#store = store;
  }

  async insert(proposal: AnswerProposal): Promise<void> {
    // Repetir el mismo id es un replay del cliente, no un estado nuevo.
    if (this.#store.proposals.get(proposal.tenantId, proposal.id)) return;
    this.#store.proposals.insert(proposal);
  }

  async get(tenantId: string, id: string): Promise<AnswerProposal | null> {
    return this.#store.proposals.get(tenantId, id);
  }

  async list(tenantId: string): Promise<AnswerProposal[]> {
    return this.#store.proposals.list(tenantId);
  }
}

export class MemoryApprovalRepository implements ApprovalRepository {
  readonly kind = "memory" as const;
  readonly #store: MemoryStore;

  constructor(store: MemoryStore) {
    this.#store = store;
  }

  async insert(approval: ApprovalBinding): Promise<void> {
    if (this.#store.approvals.get(approval.tenantId, approval.id)) return;
    this.#store.approvals.insert(approval);
  }

  async get(tenantId: string, id: string): Promise<ApprovalBinding | null> {
    return this.#store.approvals.get(tenantId, id);
  }
}

export class MemoryIntentRepository implements IntentRepository {
  readonly kind = "memory" as const;
  readonly #store: MemoryStore;

  constructor(store: MemoryStore) {
    this.#store = store;
  }

  async create(intent: OutboundIntent): Promise<{ intent: OutboundIntent; created: boolean }> {
    const existing = this.#store.intents
      .list(intent.tenantId)
      .find((row) => row.operationKey === intent.operationKey);
    if (existing) {
      if (existing.payloadHash !== intent.payloadHash) {
        throw conflict("Idempotency-Key reutilizada con otro contenido");
      }
      return { intent: existing, created: false };
    }
    this.#store.intents.insert(intent);
    return { intent, created: true };
  }

  async get(tenantId: string, id: string): Promise<OutboundIntent | null> {
    return this.#store.intents.get(tenantId, id);
  }

  async list(tenantId: string): Promise<OutboundIntent[]> {
    return this.#store.intents.list(tenantId);
  }

  async save(tenantId: string, next: OutboundIntent, expected: OutboundIntent): Promise<boolean> {
    const current = this.#store.intents.get(tenantId, next.id);
    if (!current || current.state !== expected.state || current.leaseFence !== expected.leaseFence) {
      return false;
    }
    this.#store.intents.replace(tenantId, next.id, next);
    return true;
  }
}

export class MemoryPlanRepository implements PlanRepository {
  readonly kind = "memory" as const;
  readonly #rows = new Map<string, OnboardingPlan>();

  async insert(plan: OnboardingPlan): Promise<void> {
    const key = `${plan.tenantId}:${plan.id}`;
    if (this.#rows.has(key)) return;
    this.#rows.set(key, plan);
  }

  async get(tenantId: string, id: string): Promise<OnboardingPlan | null> {
    const plan = this.#rows.get(`${tenantId}:${id}`);
    return plan && plan.tenantId === tenantId ? plan : null;
  }

  async list(tenantId: string): Promise<OnboardingPlan[]> {
    return [...this.#rows.values()].filter((plan) => plan.tenantId === tenantId);
  }

  async save(tenantId: string, next: OnboardingPlan, expectedVersion: number): Promise<boolean> {
    const key = `${tenantId}:${next.id}`;
    const current = this.#rows.get(key);
    if (!current || current.tenantId !== tenantId || current.version !== expectedVersion) {
      return false;
    }
    this.#rows.set(key, next);
    return true;
  }
}

export interface SliceRepositories {
  proposals: ProposalRepository;
  approvals: ApprovalRepository;
  intents: IntentRepository;
  plans: PlanRepository;
}

export function memorySliceRepositories(store: MemoryStore): SliceRepositories {
  return {
    proposals: new MemoryProposalRepository(store),
    approvals: new MemoryApprovalRepository(store),
    intents: new MemoryIntentRepository(store),
    plans: new MemoryPlanRepository(),
  };
}
