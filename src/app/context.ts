import { loadConfig, type AppConfig } from "../config.ts";
import { MemoryStore } from "../storage/memory.ts";
import { JwtVerifier, type JwksSource } from "../auth/jwt.ts";
import type { ContactPortalGrant, Membership, PrincipalDirectory } from "../auth/principal.ts";
import { ROLE_CAPABILITIES } from "../auth/principal.ts";
import { TwinRegistry } from "../domain/twins.ts";
import { MandateVerifier } from "../auth/delegation.ts";
import { AuthorityMap, DEFAULT_AUTHORITY_MAP } from "../domain/authority.ts";
import { KnowledgeBase } from "../domain/knowledge.ts";
import { DeterministicGateway, type ModelGateway } from "../domain/proposals.ts";
import { OutboundLedger } from "../domain/outbound.ts";
import { ProcessingLedger } from "../privacy/processing.ts";
import { PrivacyService } from "../privacy/requests.ts";
import { AgreementRegistry } from "../service/agreements.ts";
import { ConnectionRegistry, InMemorySecretStore } from "../integrations/registry.ts";
import { DiscoveryService } from "../integrations/discovery.ts";
import { WebhookInbox } from "../inbox/webhooks.ts";
import { WebChannel } from "../channels/web.ts";
import { HandoffService } from "../domain/handoff.ts";
import { OnboardingService } from "../domain/onboarding.ts";
import { BudgetLedger } from "../budget/budget.ts";
import { Metrics, StructuredLogger } from "../observability/metrics.ts";
import { AnamPresence } from "../presence/anam.ts";
import { Outbox } from "../jobs/outbox.ts";
import { FakeTransport, type HttpTransport } from "../integrations/transport.ts";
import { fixedClock, type Clock } from "../lib/time.ts";
import {
  FIXTURE_NOW,
  OPERATOR_P,
  TENANT_A,
  TENANT_B,
  USERS,
  cases,
  contacts,
  knowledgeVersions,
  mandates,
  organizations,
  twins,
} from "../eval/fixtures.ts";

/**
 * Composición de servicios (CLI-C01..C42). Un único punto de wiring para el
 * esqueleto; los adaptadores reales se inyectan aquí y permanecen deshabilitados
 * por configuración cuando no hay credenciales verificadas.
 */
export interface AppContext {
  config: AppConfig;
  clock: Clock;
  store: MemoryStore;
  directory: PrincipalDirectory;
  jwt: JwtVerifier;
  twins: TwinRegistry;
  mandates: MandateVerifier;
  authority: AuthorityMap;
  knowledge: KnowledgeBase;
  gateway: ModelGateway;
  intents: OutboundLedger;
  privacy: ProcessingLedger;
  privacyRequests: PrivacyService;
  agreements: AgreementRegistry;
  connections: ConnectionRegistry;
  secrets: InMemorySecretStore;
  discovery: DiscoveryService;
  webhooks: WebhookInbox;
  web: WebChannel;
  handoffs: HandoffService;
  onboarding: OnboardingService;
  budget: BudgetLedger;
  metrics: Metrics;
  logger: StructuredLogger;
  anam: AnamPresence;
  outbox: Outbox;
  transport: HttpTransport;
}

const FIXTURE_SECRET = "fixture-hmac-secret-not-a-real-credential";
const MEMBERSHIP_SEED: Membership[] = [
  {
    userId: USERS.ownerA,
    tenantId: TENANT_A,
    roleId: "tenant_owner",
    suspended: false,
    capabilities: ROLE_CAPABILITIES.tenant_owner ?? [],
  },
  {
    userId: USERS.reviewerA,
    tenantId: TENANT_A,
    roleId: "reviewer",
    suspended: false,
    capabilities: ROLE_CAPABILITIES.reviewer ?? [],
  },
  {
    userId: USERS.ownerB,
    tenantId: TENANT_B,
    roleId: "tenant_owner",
    suspended: false,
    capabilities: ROLE_CAPABILITIES.tenant_owner ?? [],
  },
  {
    userId: USERS.operatorAgent,
    tenantId: OPERATOR_P,
    roleId: "operator",
    suspended: false,
    capabilities: ROLE_CAPABILITIES.operator ?? [],
  },
];

const CONTACT_GRANTS: ContactPortalGrant[] = [
  {
    principalId: USERS.contactA1,
    tenantId: TENANT_A,
    resourceScopes: ["case_case_ana_1"],
    revoked: false,
  },
];

class SeededDirectory implements PrincipalDirectory {
  readonly memberships: Membership[];
  readonly grants: ContactPortalGrant[];

  constructor(memberships: Membership[], grants: ContactPortalGrant[]) {
    this.memberships = memberships;
    this.grants = grants;
  }

  async membershipsFor(userId: string): Promise<readonly Membership[]> {
    return this.memberships.filter((m) => m.userId === userId);
  }

  async contactGrantsFor(userId: string): Promise<readonly ContactPortalGrant[]> {
    return this.grants.filter((g) => g.principalId === userId);
  }
}

export interface ContextOptions {
  config?: AppConfig;
  clock?: Clock;
  gateway?: ModelGateway;
  jwks?: JwksSource;
  transport?: HttpTransport;
  /** Semilla de fixtures sintéticas: activa por defecto fuera de producción. */
  seed?: boolean;
}

export function buildContext(options: ContextOptions = {}): AppContext {
  const config = options.config ?? loadConfig();
  const clock = options.clock ?? fixedClock(FIXTURE_NOW);
  const store = new MemoryStore({ clock });
  const directory = new SeededDirectory(MEMBERSHIP_SEED, CONTACT_GRANTS);
  const secrets = new InMemorySecretStore();
  const transport = options.transport ?? new FakeTransport();
  const knowledge = new KnowledgeBase();
  const privacy = new ProcessingLedger({ clock });
  const agreements = new AgreementRegistry();
  const twinsRegistry = new TwinRegistry();
  const mandatesVerifier = new MandateVerifier({ hmacSecret: FIXTURE_SECRET, clock });
  const intents = new OutboundLedger({ clock });
  const handoffs = new HandoffService({ clock });
  const onboarding = new OnboardingService({ clock });
  const budget = new BudgetLedger({ clock });
  const metrics = new Metrics();
  const logger = new StructuredLogger();
  const discovery = new DiscoveryService({ clock });
  const webhooks = new WebhookInbox({ secret: FIXTURE_SECRET, clock });
  const web = new WebChannel({ clock });
  const connections = new ConnectionRegistry(secrets, { clock });
  const anam = new AnamPresence(
    {
      enabled: config.features.anam,
      apiKey: config.features.anam ? "fixture-anam-key" : null,
      baseUrl: config.anam.baseUrl,
      maxDurationMinutes: 30,
      recordingAllowed: false,
    },
    { clock },
  );

  const jwt = new JwtVerifier(
    {
      issuer: config.supabase.issuer ?? "https://fixture.supabase.co/auth/v1",
      audience: config.supabase.audience,
      ...(config.supabase.hmacSecret ? { hmacSecret: config.supabase.hmacSecret } : { hmacSecret: FIXTURE_SECRET }),
      allowedAlgorithms: ["HS256"],
      clockToleranceSeconds: 30,
      jwksCacheSeconds: 300,
    },
    { clock, ...(options.jwks ? { jwks: options.jwks } : {}) },
  );

  const ctx: AppContext = {
    config,
    clock,
    store,
    directory,
    jwt,
    twins: twinsRegistry,
    mandates: mandatesVerifier,
    authority: new AuthorityMap(DEFAULT_AUTHORITY_MAP, clock),
    knowledge,
    gateway: options.gateway ?? new DeterministicGateway(),
    intents,
    privacy,
    privacyRequests: new PrivacyService({ clock }),
    agreements,
    connections,
    secrets,
    discovery,
    webhooks,
    web,
    handoffs,
    onboarding,
    budget,
    metrics,
    logger,
    anam,
    outbox: new Outbox({ clock }),
    transport,
  };

  if (options.seed !== false && config.env !== "production") seedContext(ctx);
  return ctx;
}

/** Semilla idempotente: solos fixtures sintéticas, nunca datos reales. */
export function seedContext(ctx: AppContext): void {
  for (const org of organizations()) ctx.store.organizations.insert(org);
  for (const seeded of contacts()) {
    ctx.store.contacts.insert(seeded.contact);
    ctx.web.bindForm({
      formId: `form_${seeded.contact.id}`,
      tenantId: seeded.contact.tenantId,
      inboxId: `inbox_${seeded.contact.tenantId}`,
      maxBytes: 8_192,
      allowedLocales: ["es", "en", "fr"],
      rateLimitPerHour: 5,
    });
  }
  for (const caseDto of cases()) ctx.store.cases.insert(caseDto);
  for (const version of knowledgeVersions()) ctx.knowledge.ingest(version);

  for (const twin of twins()) ctx.twins.register(twin);
  const signed = mandates().map((mandate) => ({
    ...mandate,
    signatureOrVerificationRef: ctx.mandates.sign(mandate),
  }));
  for (const mandate of signed) {
    ctx.store.appendAudit({
      id: `audit_${mandate.id}`,
      tenantId: mandate.targetTenantId,
      actorId: mandate.originatingActorRef,
      capability: "delegation.issue",
      operationId: `op_${mandate.id}`,
      correlationId: `corr_${mandate.id}`,
      outcome: "applied",
      payloadRef: `mandate:${mandate.id}`,
    });
  }

  ctx.agreements.registerAgreement({
    id: "agreement_alpha",
    operatorOrgRef: OPERATOR_P,
    tenantId: TENANT_A,
    authorizedContacts: [USERS.ownerA],
    services: ["support", "knowledge", "reports", "advisor"],
    humanHours: { timeZone: "Europe/Madrid", startHour: 9, endHour: 17 },
    slaPolicyId: "sla_standard",
    budget: { amount: "30.00", currency: "EUR", exponent: 2 },
    dataProcessingRef: "dpa_fixture_alpha",
    subprocessors: ["email_provider_fixture"],
    retentionPolicyRef: "retention_v1",
    exitProcedureRef: "exit_v1",
    validFrom: FIXTURE_NOW,
    validTo: null,
  });
  ctx.agreements.registerAgreement({
    id: "agreement_beta",
    operatorOrgRef: OPERATOR_P,
    tenantId: TENANT_B,
    authorizedContacts: [USERS.ownerB],
    services: ["support"],
    humanHours: { timeZone: "Europe/Madrid", startHour: 9, endHour: 17 },
    slaPolicyId: "sla_standard",
    budget: { amount: "30.00", currency: "EUR", exponent: 2 },
    dataProcessingRef: "dpa_fixture_beta",
    subprocessors: [],
    retentionPolicyRef: "retention_v1",
    exitProcedureRef: "exit_v1",
    validFrom: FIXTURE_NOW,
    validTo: null,
  });

  ctx.budget.setQuota({ tenantId: TENANT_A, monthlyCeilingEur: 30, avMinutesPerMonth: 60, channelMessagesPerHour: 120 });
  ctx.budget.setQuota({ tenantId: TENANT_B, monthlyCeilingEur: 30, avMinutesPerMonth: 30, channelMessagesPerHour: 60 });

  for (const tenantId of [TENANT_A, TENANT_B]) {
    ctx.privacy.declareBasis({
      purpose: "support_reply",
      lawfulBasis: "contract",
      noticeVersion: "notice_v1",
      scope: [tenantId],
      sourceEvidenceRef: "fixture:agreement",
      validFrom: FIXTURE_NOW,
      validTo: null,
      restriction: null,
    });
    ctx.privacy.declareBasis({
      purpose: "marketing",
      lawfulBasis: "consent",
      noticeVersion: "notice_v1",
      scope: [tenantId],
      sourceEvidenceRef: "fixture:notice",
      validFrom: FIXTURE_NOW,
      validTo: null,
      restriction: "solo con consentimiento explícito",
    });
  }
  ctx.store.assertTenantIntegrity();
}

/** Helper de tests: contexto limpio con reloj fijo. */
export function testContext(options: ContextOptions = {}): AppContext {
  return buildContext({
    config: { ...loadConfig({ NODE_ENV: "test" }), env: "test" },
    clock: options.clock ?? fixedClock(FIXTURE_NOW),
    ...options,
  });
}

export { FIXTURE_SECRET };
