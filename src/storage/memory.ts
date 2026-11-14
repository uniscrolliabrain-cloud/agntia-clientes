import type {
  Case as CaseDto,
  Contact,
  CustomerOrganization,
  ExternalLink,
  Message,
  OutboundIntent,
  RelationshipFact,
  AnswerProposal,
  ApprovalBinding,
  KnowledgeVersion,
  SuccessPlan,
  HealthObservation,
} from "../contracts/dto.ts";
import { TenantTable } from "../storage/repository.ts";
import type { Clock } from "../lib/time.ts";
import { systemClock } from "../lib/time.ts";

/**
 * Estado del esqueleto (CLI-C06). Todo es tenant-scoped; no hay tabla global
 * de contactos ni unicidad global de email/teléfono.
 */
export interface AuditEntry {
  id: string;
  tenantId: string;
  actorId: string;
  capability: string;
  operationId: string;
  correlationId: string;
  outcome: "applied" | "denied" | "error" | "preview";
  payloadRef: string;
  occurredAt: string;
}

export interface WebhookReceipt {
  id: string;
  tenantId: string;
  connectionId: string;
  externalEventId: string;
  receivedAt: string;
  sourceHash: string;
}

export class MemoryStore {
  readonly clock: Clock;
  readonly organizations = new TenantTable<CustomerOrganization>();
  readonly contacts = new TenantTable<Contact>();
  readonly facts = new TenantTable<RelationshipFact & { id: string }>();
  readonly cases = new TenantTable<CaseDto>();
  readonly messages = new TenantTable<Message>();
  readonly knowledge = new TenantTable<KnowledgeVersion & { id: string; articleVersion: string }>();
  readonly proposals = new TenantTable<AnswerProposal>();
  readonly approvals = new TenantTable<ApprovalBinding>();
  readonly intents = new TenantTable<OutboundIntent>();
  readonly links = new TenantTable<ExternalLink & { id: string }>([
    { name: "external_link", fields: ["connectionId", "model", "externalId", "localKind"] },
  ]);
  readonly plans = new TenantTable<SuccessPlan>();
  readonly health = new TenantTable<HealthObservation & { id: string }>();
  readonly audit: AuditEntry[] = [];
  readonly webhooks = new TenantTable<WebhookReceipt>([
    { name: "webhook_event", fields: ["connectionId", "externalEventId"] },
  ]);

  constructor(options: { clock?: Clock } = {}) {
    this.clock = options.clock ?? systemClock;
  }

  now(): string {
    return this.clock.now().toISOString();
  }

  appendAudit(entry: Omit<AuditEntry, "occurredAt">): void {
    this.audit.push({ ...entry, occurredAt: this.now() });
  }

  /** Solo para fixtures: comprueba que no hay filas cruzadas entre tenants. */
  assertTenantIntegrity(): void {
    for (const table of [
      this.organizations,
      this.contacts,
      this.cases,
      this.messages,
      this.knowledge,
      this.proposals,
      this.approvals,
      this.intents,
      this.links,
      this.plans,
      this.health,
    ] as TenantTable<{ id: string; tenantId: string }>[]) {
      for (const row of table.listAll()) {
        if (!row.tenantId) throw new Error("fila sin tenantId");
      }
    }
  }
}
