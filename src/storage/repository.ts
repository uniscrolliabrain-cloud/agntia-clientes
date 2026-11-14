import type { Clock } from "../lib/time.ts";
import { fixedClock } from "../lib/time.ts";

/**
 * Repositorio por tenant (CLI-C06). La implementación en memoria reproduce las
 * garantías observables del diseño (FK compuesta, unicidad scoped, CAS);
 * las migraciones SQL con RLS viven en src/storage/migrations/.
 */

export interface Entity {
  id: string;
  tenantId: string;
}

export interface UniqueKey {
  name: string;
  fields: readonly string[];
}

export class TenantTable<T extends Entity> {
  readonly #rows = new Map<string, T>();
  readonly #uniques: UniqueKey[];

  constructor(uniques: readonly UniqueKey[] = []) {
    this.#uniques = [...uniques];
  }

  insert(row: T): T {
    for (const unique of this.#uniques) {
      const candidate = uniqueKeyValue(row, unique.fields);
      for (const existing of this.#rows.values()) {
        if (existing.tenantId !== row.tenantId) continue;
        if (uniqueKeyValue(existing, unique.fields) === candidate) {
          throw new Error(`unique_violation:${unique.name}`);
        }
      }
    }
    this.#rows.set(row.id, row);
    return row;
  }

  /** Búsqueda scoped: un id de otro tenant no es visible (ni distinguible). */
  get(tenantId: string, id: string): T | null {
    const row = this.#rows.get(id);
    return row && row.tenantId === tenantId ? row : null;
  }

  require(tenantId: string, id: string): T {
    const row = this.get(tenantId, id);
    if (!row) throw new Error("not_found");
    return row;
  }

  list(tenantId: string, predicate: (row: T) => boolean = () => true): T[] {
    return [...this.#rows.values()].filter((r) => r.tenantId === tenantId && predicate(r));
  }

  listAll(): T[] {
    return [...this.#rows.values()];
  }

  /** Update con compare-and-swap por `version`. */
  update(tenantId: string, id: string, next: T, expectedVersion: number): T {
    const current = this.require(tenantId, id) as unknown as { version?: number };
    if (typeof current.version === "number" && current.version !== expectedVersion) {
      throw new Error("version_conflict");
    }
    const nextRecord = next as unknown as { version?: number };
    if (typeof nextRecord.version === "number") {
      nextRecord.version = expectedVersion + 1;
    }
    this.#rows.set(id, next);
    return next;
  }

  replace(tenantId: string, id: string, next: T): T {
    this.require(tenantId, id);
    this.#rows.set(id, next);
    return next;
  }

  delete(tenantId: string, id: string): boolean {
    const row = this.get(tenantId, id);
    if (!row) return false;
    this.#rows.delete(id);
    return true;
  }
}

function uniqueKeyValue(row: Entity, fields: readonly string[]): string {
  const record = row as unknown as Record<string, unknown>;
  return fields.map((f) => String(record[f] ?? "")).join("\u0000");
}

/** Reloj y estado global del proceso; inyectable en tests. */
export interface StoreOptions {
  clock?: Clock;
}

export const TEST_CLOCK = fixedClock("2026-11-11T09:00:00.000Z");
