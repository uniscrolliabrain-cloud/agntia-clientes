import pg from "pg";

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
