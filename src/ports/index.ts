import { z } from "zod";
import { forbidden, invalid } from "../lib/errors.ts";

/**
 * Puertos PROPOSED del factory (docs/factory/05-INTERFACES-ADAPTERS.md).
 * Son interfaces de cooperación, no conexiones: nombrar un proveedor no lo
 * conecta. Cada adaptador debe declarar el contrato completo antes de registrar.
 */
export interface CustomerProfilePort {
  getCustomerProfile(input: {
    tenantId: string;
    customerAccountRef: string;
  }): Promise<CustomerProfileView | null>;
  searchContacts(input: { tenantId: string; query: string; limit: number }): Promise<readonly ContactSummary[]>;
}

export interface ChannelIdentityPort {
  resolveChannelIdentity(input: {
    tenantId: string;
    channel: "email" | "whatsapp" | "web" | "telegram" | "voice";
    addressRef: string;
  }): Promise<{ contactRef: string | null; evidenceRef: string | null }>;
}

export interface InboxPort {
  listInboxItems(input: { tenantId: string; inboxRef: string; limit: number }): Promise<readonly InboxItemView[]>;
}

export interface MessagingPort {
  sendMessage(input: {
    tenantId: string;
    conversationRef: string;
    payloadHash: string;
    idempotencyKey: string;
  }): Promise<{ providerRef: string | null; status: "accepted" | "outcome_unknown" }>;
}

export interface TicketPort {
  getCase(input: { tenantId: string; caseRef: string }): Promise<CaseView | null>;
  updateCase(input: {
    tenantId: string;
    caseRef: string;
    expectedVersion: number;
  }): Promise<{ version: number; receiptRef: string }>;
}

export interface SLAPort {
  resolvePolicy(input: { tenantId: string; contractRef: string }): Promise<{ policyRef: string; version: number }>;
}

export interface KnowledgePort {
  searchArticles(input: {
    tenantId: string;
    query: string;
    acl: readonly string[];
  }): Promise<readonly { articleId: string; version: number; chunkRef: string }[]>;
}

export interface EscalationPort {
  requestEscalation(input: {
    tenantId: string;
    caseRef: string;
    reason: string;
    evidenceRefs: readonly string[];
  }): Promise<{ handoffRef: string }>;
}

export interface CSATPort {
  recordFeedback(input: {
    tenantId: string;
    caseRef: string;
    sourceRef: string;
    score: number;
    observedAt: string;
  }): Promise<{ surveyRef: string }>;
}

/** Propuesta, nunca reembolso ejecutado. */
export interface RefundProposalPort {
  proposeRefund(input: {
    tenantId: string;
    caseRef: string;
    amount: { amount: string; currency: string; exponent: number };
    reasonCode: string;
  }): Promise<{ proposalRef: string }>;
}

export interface AuditEvidencePort {
  appendEvidence(input: {
    tenantId: string;
    subjectRef: string;
    evidenceRef: string;
    hash: string | null;
    observedAt: string;
  }): Promise<void>;
}

export interface PortMap {
  CustomerProfilePort: CustomerProfilePort;
  ChannelIdentityPort: ChannelIdentityPort;
  InboxPort: InboxPort;
  MessagingPort: MessagingPort;
  TicketPort: TicketPort;
  SLAPort: SLAPort;
  KnowledgePort: KnowledgePort;
  EscalationPort: EscalationPort;
  CSATPort: CSATPort;
  RefundProposalPort: RefundProposalPort;
  AuditEvidencePort: AuditEvidencePort;
}

export type PortName = keyof PortMap;

export const PORT_NAMES: readonly PortName[] = [
  "CustomerProfilePort",
  "ChannelIdentityPort",
  "InboxPort",
  "MessagingPort",
  "TicketPort",
  "SLAPort",
  "KnowledgePort",
  "EscalationPort",
  "CSATPort",
  "RefundProposalPort",
  "AuditEvidencePort",
];

export interface CustomerProfileView {
  customerAccountRef: string;
  tenantId: string;
  displayName: string;
  sourceRefs: readonly string[];
}

export interface ContactSummary {
  contactRef: string;
  displayName: string;
  channelRefs: readonly string[];
}

export interface InboxItemView {
  itemRef: string;
  conversationRef: string;
  state: "open" | "pending" | "closed";
  updatedAt: string;
}

export interface CaseView {
  caseRef: string;
  version: number;
  state: string;
  ownerRef: string | null;
}

/**
 * Contrato de adaptador exigido por el documento: 19 campos. El registro rechaza
 * un adaptador incompleto y jamás lo marca conectado por estar nombrado.
 */
export const AdapterContract = z
  .object({
    provider: z.string().min(2).max(60),
    tenantBinding: z.enum(["per_tenant_instance", "shared_with_verified_isolation"]),
    channelIdentity: z.array(z.enum(["email", "whatsapp", "web", "telegram", "voice"])),
    scope: z.array(z.string().min(2).max(200)),
    consentOrLawfulBasis: z.string().min(3).max(200),
    suppression: z.object({ supported: z.boolean(), sourceRef: z.string().min(2).max(200).nullable() }).strict(),
    sourceOfTruth: z.record(z.string(), z.string()),
    acl: z.object({ model: z.enum(["tenant", "case", "conversation", "contact"]), enforcedBy: z.string().min(2).max(200) }).strict(),
    purpose: z.string().min(3).max(200),
    schemaVersion: z.string().min(1).max(40),
    rateLimit: z.object({ requests: z.number().int().positive(), perSeconds: z.number().int().positive() }).strict(),
    budget: z.object({ amount: z.string(), currency: z.string().regex(/^[A-Z]{3}$/u), window: z.enum(["day", "month"]) }).strict(),
    timeoutMs: z.number().int().positive(),
    retry: z.object({ attempts: z.number().int().min(0).max(5), backoff: z.enum(["none", "linear", "exponential"]) }).strict(),
    idempotency: z.object({ header: z.string().min(1).max(80), stablePerEffect: z.literal(true) }).strict(),
    ackReconciliation: z.object({ ack: z.boolean(), outcomeUnknown: z.boolean(), reconcileBy: z.string().min(2).max(200) }).strict(),
    audit: z.object({ evidenceRefs: z.boolean(), retentionDays: z.number().int().positive() }).strict(),
    retention: z.object({ contentDays: z.number().int().positive(), metadataDays: z.number().int().positive() }).strict(),
    dataResidency: z.object({ region: z.string().min(2).max(60), verified: z.boolean() }).strict(),
  })
  .strict();

export type AdapterContractValue = z.infer<typeof AdapterContract>;

export interface AdapterVerification {
  evidenceRefs: readonly string[];
  observedAt: string;
}

export interface AdapterRegistration {
  readonly contract: AdapterContractValue;
  readonly ports: readonly PortName[];
  /** Solo true con evidencia verificada; un proveedor nombrado no está conectado. */
  readonly connected: boolean;
  readonly verification: AdapterVerification | null;
}

export class AdapterRegistry {
  readonly #registrations: AdapterRegistration[] = [];

  register(input: {
    contract: unknown;
    ports: readonly PortName[];
    verification?: AdapterVerification;
  }): AdapterRegistration {
    const parsed = AdapterContract.safeParse(input.contract);
    if (!parsed.success) {
      throw invalid("Contrato de adaptador incompleto", {
        missing: parsed.error.issues.map((issue) => issue.path.join(".")).slice(0, 20),
      });
    }
    const unknownPort = input.ports.find((port) => !PORT_NAMES.includes(port));
    if (unknownPort) throw invalid(`Puerto desconocido: ${unknownPort}`);
    if (input.ports.length === 0) throw forbidden("Un adaptador debe declarar al menos un puerto");
    const contract = parsed.data;
    if (contract.tenantBinding === "shared_with_verified_isolation" && !input.verification) {
      throw forbidden("Modo compartido exige aislamiento verificado con evidencia");
    }
    const registration: AdapterRegistration = {
      contract,
      ports: [...new Set(input.ports)],
      connected: Boolean(input.verification && input.verification.evidenceRefs.length > 0),
      verification: input.verification ?? null,
    };
    this.#registrations.push(registration);
    return registration;
  }

  list(): readonly AdapterRegistration[] {
    return [...this.#registrations];
  }

  /** Ningún adaptador se declara conectado sin evidencia; útil en gates. */
  connectedProviders(): readonly string[] {
    return this.#registrations.filter((r) => r.connected).map((r) => r.contract.provider);
  }
}
