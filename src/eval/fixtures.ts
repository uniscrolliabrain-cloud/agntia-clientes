import type {
  AnswerProposal,
  Case,
  Contact,
  CustomerOrganization,
  KnowledgeVersion,
} from "../contracts/dto.ts";
import type { TwinBindingValue } from "../domain/twins.ts";
import type { DelegationMandateValue } from "../auth/delegation.ts";

/**
 * Fixtures sintéticas originales (CLI-C02/C40): dos tenants A/B, organización
 * operadora P, contactos homónimos, buzón compartido y contacto en dos empresas.
 * Nombres .example y números no enroutables; nunca datos reales ni credenciales.
 */
export const TENANT_A = "tenant_alpha";
export const TENANT_B = "tenant_beta";
export const OPERATOR_P = "tenant_operator_p";

export const USERS = {
  ownerA: "user_owner_a",
  reviewerA: "user_reviewer_a",
  ownerB: "user_owner_b",
  contactA1: "user_contact_a1",
  contactA2: "user_contact_a2",
  operatorAgent: "user_operator_agent",
} as const;

export const FIXTURE_NOW = "2026-11-11T09:00:00.000Z";

export interface SeedContact {
  contact: Contact;
  channelAddress: string;
  subjectKey: string;
}

export function organizations(): CustomerOrganization[] {
  return [
    {
      id: "org_acme_a",
      tenantId: TENANT_A,
      legalName: "Acme Ejemplo S.L.",
      displayName: "Acme",
      verifiedIdentifiers: ["vat:ESB00000001"],
      source: "fixture",
      revision: 0,
    },
    {
      id: "org_globex_a",
      tenantId: TENANT_A,
      legalName: "Globex Ejemplo S.A.",
      displayName: "Globex",
      verifiedIdentifiers: ["vat:ESB00000002"],
      source: "fixture",
      revision: 0,
    },
    {
      id: "org_initech_b",
      tenantId: TENANT_B,
      legalName: "Initech Ejemplo S.L.",
      displayName: "Initech",
      verifiedIdentifiers: ["vat:ESB00000003"],
      source: "fixture",
      revision: 0,
    },
  ];
}

export function contacts(): SeedContact[] {
  return [
    {
      subjectKey: USERS.contactA1,
      channelAddress: "ana@acme.example",
      contact: {
        id: "contact_ana_acme",
        tenantId: TENANT_A,
        displayName: "Ana Ejemplo",
        verifiedChannelIdentities: [
          {
            provider: "email",
            connectionId: "conn_email_a",
            remoteContactId: "remote_ana_a",
            normalizedAddressRef: "addr_ana_a",
            verificationState: "verified",
            verifiedAt: FIXTURE_NOW,
            evidenceRef: "fixture:invitation:a1",
          },
        ],
        organizationRelations: [{ organizationId: "org_acme_a", role: "IT manager", validFrom: FIXTURE_NOW, validTo: null }],
        preferredLocale: "es",
        accessRefs: ["case_case_ana_1"],
      },
    },
    {
      subjectKey: USERS.contactA2,
      channelAddress: "shared@acme.example",
      contact: {
        id: "contact_shared_acme",
        tenantId: TENANT_A,
        displayName: "Buzón compartido Acme",
        verifiedChannelIdentities: [],
        organizationRelations: [{ organizationId: "org_acme_a", role: "shared mailbox", validFrom: FIXTURE_NOW, validTo: null }],
        preferredLocale: "en",
        accessRefs: [],
      },
    },
    {
      subjectKey: "user_contact_globex",
      channelAddress: "luis@globex.example",
      contact: {
        id: "contact_luis_globex",
        tenantId: TENANT_A,
        displayName: "Luis Ejemplo",
        verifiedChannelIdentities: [],
        // Un contacto en dos CustomerOrganizations del mismo tenant, con ámbitos distintos.
        organizationRelations: [
          { organizationId: "org_acme_a", role: "external advisor", validFrom: FIXTURE_NOW, validTo: null },
          { organizationId: "org_globex_a", role: "external advisor", validFrom: FIXTURE_NOW, validTo: null },
        ],
        preferredLocale: "fr",
        accessRefs: [],
      },
    },
    {
      subjectKey: "user_contact_initech",
      channelAddress: "ana@initech.example",
      contact: {
        id: "contact_ana_initech",
        tenantId: TENANT_B,
        displayName: "Ana Ejemplo", // homónimo deliberado con A
        verifiedChannelIdentities: [],
        organizationRelations: [{ organizationId: "org_initech_b", role: "owner", validFrom: FIXTURE_NOW, validTo: null }],
        preferredLocale: "es",
        accessRefs: [],
      },
    },
  ];
}

export function cases(): Case[] {
  const contract = {
    expectedOutcome: "El contacto recibe el procedimiento vigente de alta de usuarios",
    verificationSources: ["knowledge:kb_alta_usuarios", "message:delivered"],
    allowedActions: ["knowledge.search", "reply.propose"],
    protectedState: ["case.state", "consent.marketing"],
    acceptanceCriteria: "Respuesta con cita a la versión vigente y receipt del canal",
    expiresAt: "2026-12-31T23:59:59.000Z",
    kind: "informational" as const,
  };
  return [
    {
      id: "case_case_ana_1",
      tenantId: TENANT_A,
      organizationId: "org_acme_a",
      contactId: "contact_ana_acme",
      conversationRefs: ["conv_ana_1"],
      category: "acceso",
      priority: "normal",
      state: "in_progress",
      assignedTo: null,
      assignedBy: null,
      version: 1,
      slaPolicyId: "sla_standard",
      slaPolicyVersion: "2026-11-01",
      resolutionContract: contract,
      dueAt: "2026-11-11T13:00:00.000Z",
      createdAt: "2026-11-11T08:00:00.000Z",
      updatedAt: "2026-11-11T08:30:00.000Z",
    },
    {
      id: "case_case_ana_private",
      tenantId: TENANT_A,
      organizationId: "org_globex_a",
      contactId: "contact_luis_globex",
      conversationRefs: ["conv_luis_1"],
      category: "facturacion",
      priority: "high",
      state: "new",
      assignedTo: null,
      assignedBy: null,
      version: 0,
      slaPolicyId: "sla_standard",
      slaPolicyVersion: "2026-11-01",
      resolutionContract: { ...contract, expectedOutcome: "Revisión de factura", kind: "change_required" },
      dueAt: null,
      createdAt: "2026-11-11T08:10:00.000Z",
      updatedAt: "2026-11-11T08:10:00.000Z",
    },
    {
      id: "case_beta_1",
      tenantId: TENANT_B,
      organizationId: "org_initech_b",
      contactId: "contact_ana_initech",
      conversationRefs: ["conv_initech_1"],
      category: "acceso",
      priority: "normal",
      state: "new",
      assignedTo: null,
      assignedBy: null,
      version: 0,
      slaPolicyId: "sla_standard",
      slaPolicyVersion: "2026-11-01",
      resolutionContract: contract,
      dueAt: null,
      createdAt: "2026-11-11T08:15:00.000Z",
      updatedAt: "2026-11-11T08:15:00.000Z",
    },
  ];
}

export function knowledgeVersions(): KnowledgeVersion[] {
  return [
    {
      articleId: "kb_alta_usuarios",
      version: 2,
      tenantId: TENANT_A,
      acl: ["support"],
      locale: "es",
      effectiveFrom: "2026-10-01T00:00:00.000Z",
      effectiveTo: null,
      status: "published",
      sourceRefs: ["fixture:kb:alta:rev2"],
      sourceHash: "a".repeat(64),
      reviewerRef: USERS.reviewerA,
      title: "Alta de usuarios",
      body: "Para dar de alta un usuario entra en Panel de administración y crea la cuenta. La cuenta queda pendiente de verificación en un plazo máximo de 24 horas. Si el correo ya existe, recupera la contraseña en lugar de crear otra cuenta.",
    },
    {
      articleId: "kb_alta_usuarios",
      version: 1,
      tenantId: TENANT_A,
      acl: ["support"],
      locale: "es",
      effectiveFrom: "2025-01-01T00:00:00.000Z",
      effectiveTo: "2026-09-30T00:00:00.000Z",
      status: "retired",
      sourceRefs: ["fixture:kb:alta:rev1"],
      sourceHash: "b".repeat(64),
      reviewerRef: USERS.reviewerA,
      title: "Alta de usuarios (antiguo)",
      body: "El alta se solicita por correo al equipo técnico. No hay panel de administración.",
    },
    {
      articleId: "kb_facturacion_acme",
      version: 1,
      tenantId: TENANT_A,
      acl: ["finance"],
      locale: "es",
      effectiveFrom: "2026-01-01T00:00:00.000Z",
      effectiveTo: null,
      status: "published",
      sourceRefs: ["fixture:kb:facturas"],
      sourceHash: "c".repeat(64),
      reviewerRef: USERS.reviewerA,
      title: "Facturación",
      body: "Las facturas se emiten el día 1 de cada mes y el pago se domicilia en la cuenta acordada.",
    },
    {
      articleId: "kb_beta_secreto",
      version: 1,
      tenantId: TENANT_B,
      acl: ["support"],
      locale: "es",
      effectiveFrom: "2026-01-01T00:00:00.000Z",
      effectiveTo: null,
      status: "published",
      sourceRefs: ["fixture:kb:beta"],
      sourceHash: "d".repeat(64),
      reviewerRef: USERS.ownerB,
      title: "Alta de usuarios Initech",
      body: "El alta de usuarios Initech se solicita al panel de Initech con doble aprobación interna.",
    },
    {
      articleId: "kb_alta_usuarios_en",
      version: 1,
      tenantId: TENANT_A,
      acl: ["support"],
      locale: "en",
      effectiveFrom: "2026-01-01T00:00:00.000Z",
      effectiveTo: null,
      status: "published",
      sourceRefs: ["fixture:kb:alta:en"],
      sourceHash: "e".repeat(64),
      reviewerRef: USERS.reviewerA,
      title: "User provisioning",
      body: "To provision a user open the Admin panel and create the account. It stays pending verification for up to 24 hours. If the email already exists, reset the password instead of creating another account.",
    },
  ];
}

export function twins(): TwinBindingValue[] {
  return [
    {
      id: "twin_alpha_support",
      tenantId: TENANT_A,
      canonicalActorId: "agent_fixture_support",
      canonicalRoleId: "atencion",
      canonicalRuntimeId: "runtime_support",
      canonicalPersonaId: "persona_support",
      canonicalRevision: "sha-fixture-1",
      mandateId: "mandate_alpha",
      capabilities: ["reply.propose", "knowledge.read", "cases.read"],
      budgetRef: "budget_lite_30",
      validFrom: FIXTURE_NOW,
      validTo: "2027-11-11T00:00:00.000Z",
      revoked: false,
    },
    {
      id: "twin_beta_support",
      tenantId: TENANT_B,
      canonicalActorId: "agent_fixture_support",
      canonicalRoleId: "atencion",
      canonicalRuntimeId: "runtime_support",
      canonicalPersonaId: "persona_support",
      canonicalRevision: "sha-fixture-1",
      mandateId: "mandate_beta",
      capabilities: ["reply.propose", "knowledge.read", "cases.read"],
      budgetRef: "budget_lite_30",
      validFrom: FIXTURE_NOW,
      validTo: "2027-11-11T00:00:00.000Z",
      revoked: false,
    },
  ];
}

export function mandates(): Omit<DelegationMandateValue, "signatureOrVerificationRef">[] {
  return [
    {
      id: "mandate_alpha",
      originatingActorRef: "agent_fixture_support",
      originatingTenantId: OPERATOR_P,
      targetTenantId: TENANT_A,
      serviceAgreementId: "agreement_alpha",
      twinBindingId: "twin_alpha_support",
      capabilities: ["reply.propose", "knowledge.read"],
      resourceScope: ["case_case_ana_1"],
      fieldScope: ["case.state"],
      purpose: "Atención de nivel 1 con propuesta revisada",
      costCeiling: { amount: "5.00", currency: "EUR", exponent: 2 },
      issuedAt: FIXTURE_NOW,
      expiresAt: "2027-11-11T00:00:00.000Z",
      revocationVersion: 1,
    },
    {
      id: "mandate_beta",
      originatingActorRef: "agent_fixture_support",
      originatingTenantId: OPERATOR_P,
      targetTenantId: TENANT_B,
      serviceAgreementId: "agreement_beta",
      twinBindingId: "twin_beta_support",
      capabilities: ["reply.propose", "knowledge.read"],
      resourceScope: ["case_beta_1"],
      fieldScope: ["case.state"],
      purpose: "Atención de nivel 1 Initech",
      costCeiling: { amount: "5.00", currency: "EUR", exponent: 2 },
      issuedAt: FIXTURE_NOW,
      expiresAt: "2027-11-11T00:00:00.000Z",
      revocationVersion: 1,
    },
  ];
}

/** Propuesta válida para pruebas de aprobación (sin llamar a ningún modelo). */
export function sampleProposal(tenantId: string, caseRef: string): AnswerProposal {
  return {
    id: "prop_fixture_1",
    tenantId,
    caseRef,
    contentRevision: 1,
    locale: "es",
    body: "Según la documentación vigente: entra en Panel de administración y crea la cuenta; queda pendiente de verificación hasta 24 horas.",
    citations: [
      {
        articleId: "kb_alta_usuarios",
        version: 2,
        chunkRef: "kb_alta_usuarios#v2#c0",
        quote: "Para dar de alta un usuario entra en Panel de administración y crea la cuenta.",
      },
    ],
    unsupportedClaims: [],
    modelConfigRef: "model/local-deterministic-v1",
    policyRef: "policy_reply_v1",
    confidence: 0.6,
    createdAt: FIXTURE_NOW,
  };
}
