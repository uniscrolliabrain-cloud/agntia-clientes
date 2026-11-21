import type { Case as CaseDto } from "../contracts/dto.ts";
import type { AuditEntry, MemoryStore } from "./memory.ts";

/**
 * CLI-C06 · Repositorio de casos.
 *
 * El API no lee casos de `MemoryStore` directamente: pide a esta interfaz. El
 * mismo contrato se sirve desde memoria (tests y desarrollo sin base de datos)
 * o desde PostgreSQL con RLS (`PgCaseRepository`), de modo que la ruta HTTP, la
 * FSM y la auditoría son idénticas en ambos modos.
 *
 * Reglas del contrato:
 * - toda operación recibe el tenant efectivo ya resuelto por el PEP; el
 *   adaptador no acepta filas de otro tenant ni devuelve pistas de que existan;
 * - `save` es compare-and-swap sobre `version`: devuelve `false` si otro
 *   escritor ganó la carrera, en vez de sobrescribir estado perdido;
 * - `seed` es idempotente y solo lo usa la semilla de fixtures.
 */

export interface SeedContactRef {
  id: string;
  displayName: string;
}

export interface CaseRepository {
  /** `postgres` solo cuando las filas sobreviven al proceso. */
  readonly kind: "memory" | "postgres";
  list(tenantId: string): Promise<CaseDto[]>;
  get(tenantId: string, id: string): Promise<CaseDto | null>;
  /** Compare-and-swap: escribe solo si la versión almacenada sigue siendo la esperada. */
  save(tenantId: string, next: CaseDto, expectedVersion: number): Promise<boolean>;
  /** Alta de fixtures idempotente: no pisa filas existentes. */
  seed(
    tenantId: string,
    input: { contacts: readonly SeedContactRef[]; cases: readonly CaseDto[] },
  ): Promise<void>;
  appendAudit(entry: Omit<AuditEntry, "occurredAt">): Promise<void>;
  /** Falla si el almacén no está disponible; se usa al arrancar. */
  ping(): Promise<void>;
  close(): Promise<void>;
}

/** Adaptador sobre el store en memoria que ya usa el resto del esqueleto. */
export class MemoryCaseRepository implements CaseRepository {
  readonly kind = "memory" as const;
  readonly #store: MemoryStore;

  constructor(store: MemoryStore) {
    this.#store = store;
  }

  async list(tenantId: string): Promise<CaseDto[]> {
    return this.#store.cases.list(tenantId);
  }

  async get(tenantId: string, id: string): Promise<CaseDto | null> {
    return this.#store.cases.get(tenantId, id);
  }

  async save(tenantId: string, next: CaseDto, expectedVersion: number): Promise<boolean> {
    const current = this.#store.cases.get(tenantId, next.id);
    // Igual que SQL: sin fila visible o con versión distinta no se escribe.
    if (!current || current.version !== expectedVersion) return false;
    this.#store.cases.replace(tenantId, next.id, next);
    return true;
  }

  async seed(
    tenantId: string,
    input: { contacts: readonly SeedContactRef[]; cases: readonly CaseDto[] },
  ): Promise<void> {
    for (const contact of input.contacts) {
      if (this.#store.contacts.get(tenantId, contact.id)) continue;
      this.#store.contacts.insert({ id: contact.id, tenantId, displayName: contact.displayName, verifiedChannelIdentities: [], organizationRelations: [], preferredLocale: "es", accessRefs: [] });
    }
    for (const caseDto of input.cases) {
      if (this.#store.cases.get(tenantId, caseDto.id)) continue;
      this.#store.cases.insert(caseDto);
    }
  }

  async appendAudit(entry: Omit<AuditEntry, "occurredAt">): Promise<void> {
    this.#store.appendAudit(entry);
  }

  async ping(): Promise<void> {
    /* memoria: siempre disponible dentro del proceso */
  }

  async close(): Promise<void> {
    /* nada que cerrar */
  }
}
