import { conflict } from "../lib/errors.ts";
import { opaqueId } from "../lib/ids.ts";
import type { Clock } from "../lib/time.ts";
import { nowIso, systemClock } from "../lib/time.ts";

/**
 * AuthorityMap (CLI-C02/C12): autoridad por campo, un único dueño.
 * Si dos fuentes reclaman un campo, se bloquea el overwrite y se abre conflicto.
 */
export type Authority =
  | "service_middleware"
  | "crm_backend"
  | "helpdesk_backend"
  | "channel_provider"
  | "consent_ledger"
  | "parent_operator";

export interface FieldAuthority {
  field: string;
  authority: Authority;
  projection: "native" | "projected" | "computed";
  conflictPolicy: "block_overwrite" | "review" | "keep_authority";
  ownerRole: string;
}

export interface ConflictRecord {
  id: string;
  tenantId: string;
  subjectRef: string;
  field: string;
  sources: string[];
  detectedAt: string;
  resolution: "pending" | "kept_local" | "kept_remote" | "manual";
}

export class AuthorityMap {
  readonly #fields = new Map<string, FieldAuthority>();
  readonly #conflicts: ConflictRecord[] = [];
  readonly #clock: Clock;

  constructor(entries: readonly FieldAuthority[], clock: Clock = systemClock) {
    for (const entry of entries) this.#fields.set(entry.field, entry);
    this.#clock = clock;
  }

  get(field: string): FieldAuthority {
    const found = this.#fields.get(field);
    if (!found) throw conflict(`Campo sin autoridad declarada: ${field}`);
    return found;
  }

  canWrite(field: string, source: Authority): boolean {
    return this.get(field).authority === source;
  }

  /** Un overwrite desde una fuente no autorizada abre conflicto y no muta. */
  assertWrite(field: string, source: Authority, tenantId: string, subjectRef: string) {
    const entry = this.get(field);
    if (entry.authority === source) return;
    const conflictRecord: ConflictRecord = {
      id: opaqueId("conflict"),
      tenantId,
      subjectRef,
      field,
      sources: [entry.authority, source],
      detectedAt: nowIso(this.#clock),
      resolution: "pending",
    };
    this.#conflicts.push(conflictRecord);
    throw conflict(`Autoridad de ${field} es ${entry.authority}; ${source} abre conflicto`);
  }

  conflicts(tenantId: string): readonly ConflictRecord[] {
    return this.#conflicts.filter((c) => c.tenantId === tenantId);
  }
}

export const DEFAULT_AUTHORITY_MAP: readonly FieldAuthority[] = [
  {
    field: "contact.displayName",
    authority: "service_middleware",
    projection: "projected",
    conflictPolicy: "review",
    ownerRole: "operator",
  },
  {
    field: "contact.email",
    authority: "service_middleware",
    projection: "projected",
    conflictPolicy: "review",
    ownerRole: "operator",
  },
  {
    field: "organization.legalName",
    authority: "crm_backend",
    projection: "projected",
    conflictPolicy: "block_overwrite",
    ownerRole: "operator",
  },
  {
    field: "case.state",
    authority: "helpdesk_backend",
    projection: "native",
    conflictPolicy: "block_overwrite",
    ownerRole: "operator",
  },
  {
    field: "consent.marketing",
    authority: "consent_ledger",
    projection: "native",
    conflictPolicy: "keep_authority",
    ownerRole: "tenant_owner",
  },
  {
    field: "message.deliveryState",
    authority: "channel_provider",
    projection: "native",
    conflictPolicy: "block_overwrite",
    ownerRole: "operator",
  },
];
