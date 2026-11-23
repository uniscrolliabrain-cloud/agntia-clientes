import pg from "pg";
import type {
  AnswerProposal,
  ApprovalBinding,
  Case as CaseDto,
  OutboundIntent,
} from "../contracts/dto.ts";
import type { OnboardingPlan } from "../domain/onboarding.ts";
import { conflict } from "../lib/errors.ts";
import type { AuditEntry } from "./memory.ts";
import type { CaseRepository, SeedContactRef } from "./cases.ts";
import type {
  ApprovalRepository,
  IntentRepository,
  PlanRepository,
  ProposalRepository,
} from "./aggregates.ts";

/**
 * CLI-C06 · Store sobre PostgreSQL real.
 *
 * Reglas que este archivo hace estructurales:
 * - el tenant lo pone el store en cada transacción (`set local app.tenant_id`),
 *   nunca el llamador; por eso ningún método acepta `tenantId` en sus datos;
 * - el rol de conexión NO es owner ni tiene BYPASSRLS: si falta la política,
 *   la consulta no devuelve filas en vez de filtrar en JavaScript;
 * - `set local` caduca con la transacción, así que una conexión reutilizada del
 *   pool no arrastra el tenant de la petición anterior.
 */

export type CasePriority = "low" | "normal" | "high" | "urgent";

export interface CaseRow {
  id: string;
  contact_id: string;
  category: string;
  priority: CasePriority;
  state: string;
  version: number;
}

export interface ContactRow {
  id: string;
  display_name: string;
}

/** Transacción ya ligada a un tenant. */
export class TenantTx {
  readonly #client: pg.PoolClient;
  readonly tenantId: string;

  constructor(client: pg.PoolClient, tenantId: string) {
    this.#client = client;
    this.tenantId = tenantId;
  }

  async insertContact(input: { id: string; displayName: string }): Promise<void> {
    await this.#client.query(
      `insert into contacts (tenant_id, id, display_name) values ($1,$2,$3)`,
      [this.tenantId, input.id, input.displayName],
    );
  }

  async getContact(id: string): Promise<ContactRow | null> {
    const out = await this.#client.query<ContactRow>(
      `select id, display_name from contacts where id = $1`,
      [id],
    );
    return out.rows[0] ?? null;
  }

  /**
   * Contacto de referencia para la semilla de fixtures. No sobrescribe: un
   * contacto real ya sincronizado conserva sus datos.
   */
  async ensureContact(input: SeedContactRef): Promise<void> {
    await this.#client.query(
      `insert into contacts (tenant_id, id, display_name) values ($1,$2,$3)
       on conflict (tenant_id, id) do nothing`,
      [this.tenantId, input.id, input.displayName],
    );
  }

  /**
   * Caso completo tal y como lo escribió el API. `document` es la fuente de
   * verdad del DTO; las columnas proyectadas sirven para índices y para el CAS.
   * `on conflict do nothing` mantiene la semilla idempotente sin pisar estado.
   */
  async insertCaseDocument(caseDto: CaseDto): Promise<void> {
    await this.#client.query(
      `insert into cases (tenant_id, id, organization_id, contact_id, category, priority,
         state, assigned_to, assigned_by, version, sla_policy_id, sla_policy_version,
         resolution_contract, due_at, created_at, updated_at, document)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       on conflict (tenant_id, id) do nothing`,
      [
        this.tenantId,
        caseDto.id,
        caseDto.organizationId,
        caseDto.contactId,
        caseDto.category,
        caseDto.priority,
        caseDto.state,
        caseDto.assignedTo,
        caseDto.assignedBy,
        caseDto.version,
        caseDto.slaPolicyId,
        caseDto.slaPolicyVersion,
        JSON.stringify(caseDto.resolutionContract),
        caseDto.dueAt,
        caseDto.createdAt,
        caseDto.updatedAt,
        JSON.stringify(caseDto),
      ],
    );
  }

  async getCaseDocument(id: string): Promise<CaseDto | null> {
    const out = await this.#client.query<{ document: CaseDto }>(
      `select document from cases where id = $1`,
      [id],
    );
    return out.rows[0]?.document ?? null;
  }

  async listCaseDocuments(limit = 200): Promise<CaseDto[]> {
    const out = await this.#client.query<{ document: CaseDto }>(
      `select document from cases order by created_at desc, id limit $1`,
      [limit],
    );
    return out.rows.map((row) => row.document);
  }

  /**
   * CAS en SQL: el `where version = $2` es la carrera que la memoria no puede
   * perder (proceso único) y que dos instancias del API sí. 0 filas = conflicto.
   */
  async replaceCaseDocument(caseDto: CaseDto, expectedVersion: number): Promise<boolean> {
    const out = await this.#client.query<{ id: string }>(
      `update cases set organization_id = $3, contact_id = $4, category = $5, priority = $6,
         state = $7, assigned_to = $8, assigned_by = $9, version = $10,
         sla_policy_id = $11, sla_policy_version = $12, resolution_contract = $13,
         due_at = $14, updated_at = $15, document = $16
       where id = $1 and version = $2
       returning id`,
      [
        caseDto.id,
        expectedVersion,
        caseDto.organizationId,
        caseDto.contactId,
        caseDto.category,
        caseDto.priority,
        caseDto.state,
        caseDto.assignedTo,
        caseDto.assignedBy,
        caseDto.version,
        caseDto.slaPolicyId,
        caseDto.slaPolicyVersion,
        JSON.stringify(caseDto.resolutionContract),
        caseDto.dueAt,
        caseDto.updatedAt,
        JSON.stringify(caseDto),
      ],
    );
    return out.rows.length === 1;
  }

  async insertCase(input: {
    id: string;
    contactId: string;
    category: string;
    priority: CasePriority;
    state: string;
    slaPolicyId: string;
    slaPolicyVersion: string;
    resolutionContract: unknown;
  }): Promise<void> {
    await this.#client.query(
      `insert into cases (tenant_id, id, contact_id, category, priority, state,
         sla_policy_id, sla_policy_version, resolution_contract)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        this.tenantId,
        input.id,
        input.contactId,
        input.category,
        input.priority,
        input.state,
        input.slaPolicyId,
        input.slaPolicyVersion,
        JSON.stringify(input.resolutionContract ?? {}),
      ],
    );
  }

  async getCase(id: string): Promise<CaseRow | null> {
    const out = await this.#client.query<CaseRow>(
      `select id, contact_id, category, priority, state, version from cases where id = $1`,
      [id],
    );
    return out.rows[0] ?? null;
  }

  async listCases(limit = 50): Promise<CaseRow[]> {
    const out = await this.#client.query<CaseRow>(
      `select id, contact_id, category, priority, state, version
         from cases order by created_at desc limit $1`,
      [limit],
    );
    return out.rows;
  }

  /** Auditoría: solo insert. El rol de la app no tiene UPDATE ni DELETE aquí. */
  async appendAudit(input: {
    id: string;
    actorId: string;
    capability: string;
    operationId: string;
    correlationId: string;
    outcome: string;
    payloadRef: string;
  }): Promise<void> {
    await this.#client.query(
      `insert into audit_log (tenant_id, id, actor_id, capability, operation_id,
         correlation_id, outcome, payload_ref)
       values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        this.tenantId,
        input.id,
        input.actorId,
        input.capability,
        input.operationId,
        input.correlationId,
        input.outcome,
        input.payloadRef,
      ],
    );
  }

  /** Lectura de auditoría del tenant activo (nunca escribe ni borra). */
  async listAuditByPayloadRef(payloadRef: string): Promise<{ id: string; outcome: string }[]> {
    const out = await this.#client.query<{ id: string; outcome: string }>(
      `select id, outcome from audit_log where payload_ref = $1 order by occurred_at, id`,
      [payloadRef],
    );
    return out.rows;
  }

  /**
   * Idempotencia de efectos externos: `created=false` significa que la
   * operación ya existía en este tenant y no debe repetirse.
   */
  async claimOutboundIntent(input: {
    id: string;
    operationKey: string;
    conversationRef: string;
    contactRef: string;
    channel: string;
    payloadHash: string;
    proposalRef: string;
  }): Promise<{ created: boolean }> {
    const out = await this.#client.query<{ id: string }>(
      `insert into outbound_intents (tenant_id, id, operation_key, conversation_ref,
         contact_ref, channel, payload_hash, proposal_ref, state)
       values ($1,$2,$3,$4,$5,$6,$7,$8,'pending')
       on conflict (tenant_id, operation_key) do nothing
       returning id`,
      [
        this.tenantId,
        input.id,
        input.operationKey,
        input.conversationRef,
        input.contactRef,
        input.channel,
        input.payloadHash,
        input.proposalRef,
      ],
    );
    return { created: out.rows.length === 1 };
  }

  /* ── Propuestas, aprobaciones e intents (vertical slice de atención) ───── */

  async insertProposalDocument(proposal: AnswerProposal): Promise<void> {
    await this.#client.query(
      `insert into answer_proposals (tenant_id, id, case_ref, content_revision, locale, body,
         citations, unsupported_claims, model_config_ref, policy_ref, confidence, created_at, document)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       on conflict (tenant_id, id) do nothing`,
      [
        this.tenantId,
        proposal.id,
        proposal.caseRef,
        proposal.contentRevision,
        proposal.locale,
        proposal.body,
        JSON.stringify(proposal.citations),
        proposal.unsupportedClaims,
        proposal.modelConfigRef,
        proposal.policyRef,
        proposal.confidence,
        proposal.createdAt,
        JSON.stringify(proposal),
      ],
    );
  }

  async getProposalDocument(id: string): Promise<AnswerProposal | null> {
    const out = await this.#client.query<{ document: AnswerProposal }>(
      `select document from answer_proposals where id = $1`,
      [id],
    );
    return out.rows[0]?.document ?? null;
  }

  async listProposalDocuments(limit = 200): Promise<AnswerProposal[]> {
    const out = await this.#client.query<{ document: AnswerProposal }>(
      `select document from answer_proposals order by created_at desc, id limit $1`,
      [limit],
    );
    return out.rows.map((row) => row.document);
  }

  async insertApprovalDocument(approval: ApprovalBinding): Promise<void> {
    await this.#client.query(
      `insert into approval_bindings (tenant_id, id, proposal_hash, recipient_hash, channel_hash,
         attachments_hash, actor_id, expected_version, policy_version, expires_at,
         revocation_version, created_at, document)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       on conflict (tenant_id, id) do nothing`,
      [
        this.tenantId,
        approval.id,
        approval.proposalHash,
        approval.recipientHash,
        approval.channelHash,
        approval.attachmentsHash,
        approval.actorId,
        approval.expectedVersion,
        approval.policyVersion,
        approval.expiresAt,
        approval.revocationVersion,
        approval.createdAt,
        JSON.stringify(approval),
      ],
    );
  }

  async getApprovalDocument(id: string): Promise<ApprovalBinding | null> {
    const out = await this.#client.query<{ document: ApprovalBinding }>(
      `select document from approval_bindings where id = $1`,
      [id],
    );
    return out.rows[0]?.document ?? null;
  }

  /** `true` solo si este proceso creó la fila; el replay no duplica el intent. */
  async insertIntentDocument(intent: OutboundIntent): Promise<boolean> {
    const out = await this.#client.query<{ id: string }>(
      `insert into outbound_intents (tenant_id, id, operation_key, conversation_ref, contact_ref,
         channel, payload_hash, proposal_ref, approval_ref, state, lease_fence, remote_refs,
         reconciliation_ref, created_at, updated_at, document)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       on conflict (tenant_id, operation_key) do nothing
       returning id`,
      [
        this.tenantId,
        intent.id,
        intent.operationKey,
        intent.conversationRef,
        intent.contactRef,
        intent.channel,
        intent.payloadHash,
        intent.proposalRef,
        intent.approvalRef,
        intent.state,
        intent.leaseFence,
        intent.remoteRefs,
        intent.reconciliationRef,
        intent.createdAt,
        intent.updatedAt,
        JSON.stringify(intent),
      ],
    );
    return out.rows.length === 1;
  }

  async getIntentDocument(id: string): Promise<OutboundIntent | null> {
    const out = await this.#client.query<{ document: OutboundIntent }>(
      `select document from outbound_intents where id = $1`,
      [id],
    );
    return out.rows[0]?.document ?? null;
  }

  async getIntentByOperationKey(operationKey: string): Promise<OutboundIntent | null> {
    const out = await this.#client.query<{ document: OutboundIntent }>(
      `select document from outbound_intents where operation_key = $1`,
      [operationKey],
    );
    return out.rows[0]?.document ?? null;
  }

  async listIntentDocuments(limit = 200): Promise<OutboundIntent[]> {
    const out = await this.#client.query<{ document: OutboundIntent }>(
      `select document from outbound_intents order by created_at desc, id limit $1`,
      [limit],
    );
    return out.rows.map((row) => row.document);
  }

  /**
   * CAS sobre el estado de la FSM: dos despachadores que leyeron el mismo
   * intent no pueden aplicarlo dos veces; el segundo recibe `false` → 409.
   */
  async replaceIntentDocument(next: OutboundIntent, expected: OutboundIntent): Promise<boolean> {
    const out = await this.#client.query<{ id: string }>(
      `update outbound_intents set approval_ref = $3, state = $4, lease_fence = $5,
         remote_refs = $6, reconciliation_ref = $7, updated_at = $8, document = $9
       where id = $1 and state = $2 and lease_fence = $10
       returning id`,
      [
        next.id,
        expected.state,
        next.approvalRef,
        next.state,
        next.leaseFence,
        next.remoteRefs,
        next.reconciliationRef,
        next.updatedAt,
        JSON.stringify(next),
        expected.leaseFence,
      ],
    );
    return out.rows.length === 1;
  }

  /* ── Planes de onboarding (vertical slice de onboarding) ───────────────── */

  async insertPlanDocument(plan: OnboardingPlan): Promise<void> {
    await this.#client.query(
      `insert into onboarding_plans (tenant_id, id, organization_ref, playbook_id,
         playbook_version, version, state, document, created_at, updated_at)
       values ($1,$2,$3,$4,$5,$6,'active',$7,$8,$8)
       on conflict (tenant_id, id) do nothing`,
      [
        this.tenantId,
        plan.id,
        plan.organizationRef,
        plan.playbookId,
        plan.playbookVersion,
        plan.version,
        JSON.stringify(plan),
        plan.createdAt,
      ],
    );
  }

  async getPlanDocument(id: string): Promise<OnboardingPlan | null> {
    const out = await this.#client.query<{ document: OnboardingPlan }>(
      `select document from onboarding_plans where id = $1`,
      [id],
    );
    return out.rows[0]?.document ?? null;
  }

  async listPlanDocuments(limit = 200): Promise<OnboardingPlan[]> {
    const out = await this.#client.query<{ document: OnboardingPlan }>(
      `select document from onboarding_plans order by created_at desc, id limit $1`,
      [limit],
    );
    return out.rows.map((row) => row.document);
  }

  async replacePlanDocument(next: OnboardingPlan, expectedVersion: number): Promise<boolean> {
    const out = await this.#client.query<{ id: string }>(
      `update onboarding_plans set playbook_version = $3, version = $4, document = $5,
         updated_at = now()
       where id = $1 and version = $2
       returning id`,
      [next.id, expectedVersion, next.playbookVersion, next.version, JSON.stringify(next)],
    );
    return out.rows.length === 1;
  }
}

export class PgStore {
  readonly #pool: pg.Pool;

  constructor(pool: pg.Pool) {
    this.#pool = pool;
  }

  /** Falla si la base de datos no responde: se usa antes de servir tráfico. */
  async ping(): Promise<void> {
    await this.#pool.query("select 1");
  }

  async close(): Promise<void> {
    await this.#pool.end();
  }

  async withTenant<T>(tenantId: string, fn: (tx: TenantTx) => Promise<T>): Promise<T> {
    if (!tenantId) throw new Error("tenant_required");
    const client = await this.#pool.connect();
    try {
      await client.query("begin");
      await client.query("select set_config('app.tenant_id', $1, true)", [tenantId]);
      const result = await fn(new TenantTx(client, tenantId));
      await client.query("commit");
      return result;
    } catch (error) {
      await client.query("rollback").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }
}

/**
 * Adaptador de `CaseRepository` sobre PostgreSQL. Cada operación abre su propia
 * transacción con `app.tenant_id`, así que ninguna conexión del pool arrastra el
 * tenant de la petición anterior.
 */
export class PgCaseRepository implements CaseRepository {
  readonly kind = "postgres" as const;
  readonly #store: PgStore;

  constructor(store: PgStore) {
    this.#store = store;
  }

  async list(tenantId: string): Promise<CaseDto[]> {
    return this.#store.withTenant(tenantId, (tx) => tx.listCaseDocuments());
  }

  async get(tenantId: string, id: string): Promise<CaseDto | null> {
    return this.#store.withTenant(tenantId, (tx) => tx.getCaseDocument(id));
  }

  async save(tenantId: string, next: CaseDto, expectedVersion: number): Promise<boolean> {
    return this.#store.withTenant(tenantId, (tx) => tx.replaceCaseDocument(next, expectedVersion));
  }

  async seed(
    tenantId: string,
    input: { contacts: readonly SeedContactRef[]; cases: readonly CaseDto[] },
  ): Promise<void> {
    await this.#store.withTenant(tenantId, async (tx) => {
      for (const contact of input.contacts) await tx.ensureContact(contact);
      for (const caseDto of input.cases) await tx.insertCaseDocument(caseDto);
    });
  }

  async appendAudit(entry: Omit<AuditEntry, "occurredAt">): Promise<void> {
    await this.#store.withTenant(entry.tenantId, (tx) =>
      tx.appendAudit({
        id: entry.id,
        actorId: entry.actorId,
        capability: entry.capability,
        operationId: entry.operationId,
        correlationId: entry.correlationId,
        outcome: entry.outcome,
        payloadRef: entry.payloadRef,
      }),
    );
  }

  async ping(): Promise<void> {
    await this.#store.ping();
  }

  async close(): Promise<void> {
    await this.#store.close();
  }
}

/**
 * CLI-C06 · Agregados durables.
 *
 * Igual que en casos, el DTO completo vive en `document` (jsonb) y las columnas
 * proyectadas sostienen índices, la FK y el CAS. El tenant nunca viaja en los
 * datos: lo fija `withTenant` con `set local app.tenant_id` y la RLS lo aplica.
 */
export class PgProposalRepository implements ProposalRepository {
  readonly kind = "postgres" as const;
  readonly #store: PgStore;

  constructor(store: PgStore) {
    this.#store = store;
  }

  async insert(proposal: AnswerProposal): Promise<void> {
    await this.#store.withTenant(proposal.tenantId, (tx) => tx.insertProposalDocument(proposal));
  }

  async get(tenantId: string, id: string): Promise<AnswerProposal | null> {
    return this.#store.withTenant(tenantId, (tx) => tx.getProposalDocument(id));
  }

  async list(tenantId: string): Promise<AnswerProposal[]> {
    return this.#store.withTenant(tenantId, (tx) => tx.listProposalDocuments());
  }
}

export class PgApprovalRepository implements ApprovalRepository {
  readonly kind = "postgres" as const;
  readonly #store: PgStore;

  constructor(store: PgStore) {
    this.#store = store;
  }

  async insert(approval: ApprovalBinding): Promise<void> {
    await this.#store.withTenant(approval.tenantId, (tx) => tx.insertApprovalDocument(approval));
  }

  async get(tenantId: string, id: string): Promise<ApprovalBinding | null> {
    return this.#store.withTenant(tenantId, (tx) => tx.getApprovalDocument(id));
  }
}

export class PgIntentRepository implements IntentRepository {
  readonly kind = "postgres" as const;
  readonly #store: PgStore;

  constructor(store: PgStore) {
    this.#store = store;
  }

  async create(intent: OutboundIntent): Promise<{ intent: OutboundIntent; created: boolean }> {
    return this.#store.withTenant(intent.tenantId, async (tx) => {
      const created = await tx.insertIntentDocument(intent);
      if (created) return { intent, created: true };
      const existing = await tx.getIntentByOperationKey(intent.operationKey);
      if (!existing) throw conflict("Conflicto de idempotencia sin fila visible");
      if (existing.payloadHash !== intent.payloadHash) {
        throw conflict("Idempotency-Key reutilizada con otro contenido");
      }
      return { intent: existing, created: false };
    });
  }

  async get(tenantId: string, id: string): Promise<OutboundIntent | null> {
    return this.#store.withTenant(tenantId, (tx) => tx.getIntentDocument(id));
  }

  async list(tenantId: string): Promise<OutboundIntent[]> {
    return this.#store.withTenant(tenantId, (tx) => tx.listIntentDocuments());
  }

  async save(tenantId: string, next: OutboundIntent, expected: OutboundIntent): Promise<boolean> {
    return this.#store.withTenant(tenantId, (tx) => tx.replaceIntentDocument(next, expected));
  }
}

export class PgPlanRepository implements PlanRepository {
  readonly kind = "postgres" as const;
  readonly #store: PgStore;

  constructor(store: PgStore) {
    this.#store = store;
  }

  async insert(plan: OnboardingPlan): Promise<void> {
    await this.#store.withTenant(plan.tenantId, (tx) => tx.insertPlanDocument(plan));
  }

  async get(tenantId: string, id: string): Promise<OnboardingPlan | null> {
    return this.#store.withTenant(tenantId, (tx) => tx.getPlanDocument(id));
  }

  async list(tenantId: string): Promise<OnboardingPlan[]> {
    return this.#store.withTenant(tenantId, (tx) => tx.listPlanDocuments());
  }

  async save(tenantId: string, next: OnboardingPlan, expectedVersion: number): Promise<boolean> {
    return this.#store.withTenant(tenantId, (tx) => tx.replacePlanDocument(next, expectedVersion));
  }
}
