import { z } from "zod";
import { IsoDateTime, Locale, Money, OpaqueRef, TenantId, strictObject } from "./common.ts";

/**
 * DTOs del servicio (CLI-C05), alineados con docs/contracts/01-contratos.md.
 * Regla transversal: Contact, CustomerOrganization, Supabase User y tenant NO son equivalentes.
 */

export const Provenance = strictObject({
  source: z.string().min(1).max(120),
  actor: z.string().min(1).max(200),
  updatedAt: IsoDateTime,
  confidence: z.number().min(0).max(1).nullable(),
});

export const CustomerOrganization = strictObject({
  id: OpaqueRef,
  tenantId: TenantId,
  legalName: z.string().min(1).max(300),
  displayName: z.string().min(1).max(300),
  verifiedIdentifiers: z.array(z.string().max(200)),
  source: z.string().max(120),
  revision: z.number().int().nonnegative(),
});

export const ChannelIdentity = strictObject({
  provider: z.enum(["web", "email", "whatsapp", "chatwoot", "zammad", "frappe"]),
  connectionId: OpaqueRef,
  remoteContactId: z.string().min(1).max(200),
  normalizedAddressRef: z.string().min(1).max(400),
  verificationState: z.enum(["unverified", "pending", "verified", "revoked"]),
  verifiedAt: IsoDateTime.nullable(),
  evidenceRef: z.string().max(400).nullable(),
});

export const Contact = strictObject({
  id: OpaqueRef,
  tenantId: TenantId,
  displayName: z.string().min(1).max(300),
  verifiedChannelIdentities: z.array(ChannelIdentity),
  organizationRelations: z.array(
    strictObject({
      organizationId: OpaqueRef,
      role: z.string().max(120),
      validFrom: IsoDateTime.nullable(),
      validTo: IsoDateTime.nullable(),
    }),
  ),
  preferredLocale: Locale,
  accessRefs: z.array(z.string().max(200)),
});

export const RelationshipFact = strictObject({
  id: OpaqueRef,
  tenantId: TenantId,
  subjectRef: z.string().min(1).max(200),
  field: z.string().min(1).max(120),
  valueRef: z.string().min(1).max(500),
  purpose: z.string().min(1).max(120),
  authority: z.string().min(1).max(120),
  effectiveFrom: IsoDateTime,
  effectiveTo: IsoDateTime.nullable(),
  observedAt: IsoDateTime,
  sourceVersion: z.string().max(120),
  provenance: Provenance,
  conflictRef: z.string().max(200).nullable(),
});

export const ExternalLink = strictObject({
  tenantId: TenantId,
  provider: z.string().min(1).max(120),
  connectionId: OpaqueRef,
  model: z.string().min(1).max(120),
  externalId: z.string().min(1).max(300),
  localKind: z.string().min(1).max(60),
  localId: OpaqueRef,
  remoteVersion: z.string().max(120).nullable(),
  writeDate: IsoDateTime.nullable(),
  sourceHash: z.string().regex(/^[0-9a-f]{64}$/),
  mapperVersion: z.string().min(1).max(60),
  lastSeenAt: IsoDateTime,
});

export const ProcessingBasis = strictObject({
  purpose: z.string().min(1).max(120),
  lawfulBasis: z.enum([
    "contract",
    "legal_obligation",
    "vital_interest",
    "public_task",
    "legitimate_interest",
    "consent",
  ]),
  noticeVersion: z.string().max(60),
  scope: z.array(z.string().max(120)),
  sourceEvidenceRef: z.string().max(400).nullable(),
  validFrom: IsoDateTime,
  validTo: IsoDateTime.nullable(),
  restriction: z.string().max(200).nullable(),
});

export const ConsentEvent = strictObject({
  id: OpaqueRef,
  subjectRef: z.string().min(1).max(200),
  tenantId: TenantId,
  channel: z.string().min(1).max(60),
  purpose: z.string().min(1).max(120),
  action: z.enum(["grant", "withdraw"]),
  occurredAt: IsoDateTime,
  medium: z.string().min(1).max(120),
  version: z.string().min(1).max(60),
  evidenceRef: z.string().max(400).nullable(),
});

export const CaseState = z.enum([
  "new",
  "triaged",
  "assigned",
  "in_progress",
  "waiting_customer",
  "waiting_internal",
  "resolution_proposed",
  "resolved",
  "closed",
  "reopened",
]);

export const ResolutionContract = strictObject({
  expectedOutcome: z.string().min(1).max(500),
  verificationSources: z.array(z.string().max(200)),
  allowedActions: z.array(z.string().max(120)),
  protectedState: z.array(z.string().max(120)),
  acceptanceCriteria: z.string().min(1).max(500),
  expiresAt: IsoDateTime,
  kind: z.enum(["informational", "change_required", "goodwill"]),
});

export const ResolutionEvidence = strictObject({
  kind: z.enum(["citation", "receipt", "remote_state", "human_ack"]),
  ref: z.string().min(1).max(400),
  satisfied: z.boolean(),
});

export const Case = strictObject({
  id: OpaqueRef,
  tenantId: TenantId,
  organizationId: OpaqueRef.nullable(),
  contactId: OpaqueRef,
  conversationRefs: z.array(OpaqueRef),
  category: z.string().min(1).max(120),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  state: CaseState,
  assignedTo: OpaqueRef.nullable(),
  assignedBy: OpaqueRef.nullable(),
  version: z.number().int().nonnegative(),
  slaPolicyId: z.string().min(1).max(120),
  slaPolicyVersion: z.string().min(1).max(60),
  resolutionContract: ResolutionContract,
  dueAt: IsoDateTime.nullable(),
  createdAt: IsoDateTime,
  updatedAt: IsoDateTime,
});

export const Message = strictObject({
  id: OpaqueRef,
  tenantId: TenantId,
  channel: z.enum(["web", "email", "whatsapp", "chatwoot", "zammad", "frappe"]),
  connectionId: OpaqueRef,
  remoteId: z.string().max(300).nullable(),
  conversationRef: OpaqueRef,
  caseRef: OpaqueRef.nullable(),
  direction: z.enum(["inbound", "outbound"]),
  visibility: z.enum(["public", "internal"]),
  contentRef: z.string().min(1).max(500),
  attachmentRefs: z.array(z.string().max(400)),
  occurredAt: IsoDateTime,
  receivedAt: IsoDateTime,
  sourceHash: z.string().regex(/^[0-9a-f]{64}$/),
  deliveryState: z.enum([
    "received",
    "proposed",
    "approved",
    "queued",
    "accepted",
    "delivered",
    "failed_definitive",
    "outcome_unknown",
  ]),
});

export const KnowledgeVersion = strictObject({
  articleId: OpaqueRef,
  version: z.number().int().positive(),
  tenantId: TenantId,
  acl: z.array(z.string().max(120)),
  locale: Locale,
  effectiveFrom: IsoDateTime,
  effectiveTo: IsoDateTime.nullable(),
  status: z.enum(["draft", "reviewed", "published", "retired"]),
  sourceRefs: z.array(z.string().max(400)),
  sourceHash: z.string().regex(/^[0-9a-f]{64}$/),
  reviewerRef: z.string().max(200).nullable(),
  title: z.string().min(1).max(300),
  body: z.string().min(1).max(20_000),
});

export const Citation = strictObject({
  articleId: OpaqueRef,
  version: z.number().int().positive(),
  chunkRef: z.string().min(1).max(200),
  quote: z.string().min(1).max(600),
});

export const AnswerProposal = strictObject({
  id: OpaqueRef,
  tenantId: TenantId,
  caseRef: OpaqueRef,
  contentRevision: z.number().int().nonnegative(),
  locale: Locale,
  body: z.string().min(1).max(20_000),
  citations: z.array(Citation),
  unsupportedClaims: z.array(z.string().max(400)),
  modelConfigRef: z.string().min(1).max(200),
  policyRef: z.string().min(1).max(200),
  confidence: z.number().min(0).max(1).nullable(),
  createdAt: IsoDateTime,
});

export const ApprovalBinding = strictObject({
  id: OpaqueRef,
  tenantId: TenantId,
  proposalHash: z.string().regex(/^[0-9a-f]{64}$/),
  recipientHash: z.string().regex(/^[0-9a-f]{64}$/),
  channelHash: z.string().regex(/^[0-9a-f]{64}$/),
  attachmentsHash: z.string().regex(/^[0-9a-f]{64}$/),
  actorId: OpaqueRef,
  claimedRole: z.enum(["human_reviewer"]),
  expectedVersion: z.number().int().nonnegative(),
  policyVersion: z.string().min(1).max(60),
  expiresAt: IsoDateTime,
  revocationVersion: z.number().int().nonnegative(),
  createdAt: IsoDateTime,
});

export const OutboundState = z.enum([
  "proposed",
  "awaiting_approval",
  "approved",
  "queued",
  "leased",
  "dispatching",
  "accepted",
  "delivered",
  "failed_definitive",
  "outcome_unknown",
  "reconciliation_required",
  "cancelled",
]);

export const OutboundIntent = strictObject({
  id: OpaqueRef,
  tenantId: TenantId,
  operationKey: z.string().regex(/^[0-9a-f]{64}$/),
  conversationRef: OpaqueRef,
  contactRef: OpaqueRef,
  channel: z.enum(["web", "email", "whatsapp", "chatwoot", "zammad", "frappe"]),
  payloadHash: z.string().regex(/^[0-9a-f]{64}$/),
  proposalRef: OpaqueRef,
  approvalRef: OpaqueRef.nullable(),
  state: OutboundState,
  leaseFence: z.number().int().nonnegative(),
  remoteRefs: z.array(z.string().max(300)),
  reconciliationRef: z.string().max(300).nullable(),
  createdAt: IsoDateTime,
  updatedAt: IsoDateTime,
});

export const SuccessPlan = strictObject({
  id: OpaqueRef,
  tenantId: TenantId,
  organizationId: OpaqueRef,
  goals: z.array(z.string().max(300)),
  milestones: z.array(
    strictObject({
      name: z.string().min(1).max(200),
      dueAt: IsoDateTime.nullable(),
      evidenceRef: z.string().max(400).nullable(),
      acceptanceRef: z.string().max(400).nullable(),
    }),
  ),
  assignedTo: OpaqueRef.nullable(),
  assignedBy: OpaqueRef.nullable(),
  version: z.number().int().nonnegative(),
});

export const HealthObservation = strictObject({
  tenantId: TenantId,
  organizationId: OpaqueRef,
  metricDefinitionVersion: z.string().min(1).max(60),
  window: strictObject({ from: IsoDateTime, to: IsoDateTime }),
  sourceRefs: z.array(z.string().max(400)),
  value: z.number().nullable(),
  coverage: z.number().min(0).max(1),
  freshness: IsoDateTime,
  reasonCodes: z.array(z.string().max(120)),
});

export const AdvisorSession = strictObject({
  id: OpaqueRef,
  tenantId: TenantId,
  principalRef: OpaqueRef,
  contactScope: z.array(OpaqueRef),
  canonicalRuntimeRef: z.string().min(1).max(120),
  canonicalPersonaRef: z.string().max(120).nullable(),
  twinBindingRef: OpaqueRef,
  capabilities: z.array(z.string().max(120)),
  durationMinutes: z.number().int().min(1).max(60),
  budget: Money,
  recordingPolicy: z.enum(["disabled", "configured"]),
  expiresAt: IsoDateTime,
});

export const Conflict = strictObject({
  id: OpaqueRef,
  tenantId: TenantId,
  subjectRef: z.string().min(1).max(200),
  field: z.string().min(1).max(120),
  sources: z.array(z.string().max(200)),
  detectedAt: IsoDateTime,
  resolution: z.enum(["pending", "kept_local", "kept_remote", "manual"]),
});

export const JobRecord = strictObject({
  id: OpaqueRef,
  tenantId: TenantId,
  kind: z.string().min(1).max(120),
  state: z.enum(["queued", "leased", "running", "succeeded", "failed", "dead_letter", "cancelled"]),
  attempts: z.number().int().nonnegative(),
  leaseFence: z.number().int().nonnegative(),
  leaseExpiresAt: IsoDateTime.nullable(),
  lastError: z.string().max(400).nullable(),
  payloadRef: z.string().max(500),
});

/**
 * Alias de tipo con el mismo nombre que cada schema: permiten `import type { Case }`
 * sin perder el valor Zod para validación en frontera.
 */
export type Provenance = z.infer<typeof Provenance>;
export type CustomerOrganization = z.infer<typeof CustomerOrganization>;
export type ChannelIdentity = z.infer<typeof ChannelIdentity>;
export type Contact = z.infer<typeof Contact>;
export type RelationshipFact = z.infer<typeof RelationshipFact>;
export type ExternalLink = z.infer<typeof ExternalLink>;
export type ProcessingBasis = z.infer<typeof ProcessingBasis>;
export type ConsentEvent = z.infer<typeof ConsentEvent>;
export type ResolutionContract = z.infer<typeof ResolutionContract>;
export type ResolutionEvidence = z.infer<typeof ResolutionEvidence>;
export type Case = z.infer<typeof Case>;
export type Message = z.infer<typeof Message>;
export type KnowledgeVersion = z.infer<typeof KnowledgeVersion>;
export type Citation = z.infer<typeof Citation>;
export type AnswerProposal = z.infer<typeof AnswerProposal>;
export type ApprovalBinding = z.infer<typeof ApprovalBinding>;
export type OutboundIntent = z.infer<typeof OutboundIntent>;
export type SuccessPlan = z.infer<typeof SuccessPlan>;
export type HealthObservation = z.infer<typeof HealthObservation>;
export type AdvisorSession = z.infer<typeof AdvisorSession>;
export type Conflict = z.infer<typeof Conflict>;
export type JobRecord = z.infer<typeof JobRecord>;
