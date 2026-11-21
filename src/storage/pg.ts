import pg from "pg";
import type { Case as CaseDto } from "../contracts/dto.ts";
import type { AuditEntry } from "./memory.ts";
import type { CaseRepository, SeedContactRef } from "./cases.ts";

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
