import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ADTC_SCHEMA_VERSION,
  AdtcEvent,
  formatTraceparent,
  parseTraceparent,
  toAdtcEvent,
} from "../src/contracts/adtc.ts";
import type { DomainEvent } from "../src/bridge/host.ts";
import { CERTAINTY_LEVELS, fromGateStatus, isVerified, describeCertainty } from "../src/contracts/certainty.ts";
import { AdapterContract, AdapterRegistry, PORT_NAMES } from "../src/ports/index.ts";
import { requireAttachmentAccess } from "../src/inbox/attachments.ts";
import { NonBlockingMetrics } from "../src/observability/nonblocking.ts";
import { Metrics } from "../src/observability/metrics.ts";
import { ServiceError } from "../src/lib/errors.ts";

const event: DomainEvent = {
  id: "evt_0123456789abcdef0123456789abcdef",
  type: "clientes.reply.proposed",
  tenantId: "tenant_alpha",
  actorRef: "agent_support",
  correlationId: "corr_case_1",
  causationId: null,
  occurredAt: "2026-11-14T09:00:00.000Z",
  refs: { caseId: "case_ana_1", conversationId: "conv_ana_1" },
};

const contract = {
  provider: "chatwoot",
  tenantBinding: "per_tenant_instance",
  channelIdentity: ["email", "web"],
  scope: ["conversation.read", "message.write"],
  consentOrLawfulBasis: "contract",
  suppression: { supported: false, sourceRef: null },
  sourceOfTruth: { caseState: "agntia-clientes", conversation: "chatwoot" },
  acl: { model: "case", enforcedBy: "service" },
  purpose: "customer_support",
  schemaVersion: "2026-11-01",
  rateLimit: { requests: 60, perSeconds: 60 },
  budget: { amount: "5.00", currency: "EUR", window: "day" },
  timeoutMs: 8000,
  retry: { attempts: 2, backoff: "exponential" },
  idempotency: { header: "Idempotency-Key", stablePerEffect: true },
  ackReconciliation: { ack: true, outcomeUnknown: true, reconcileBy: "message.search" },
  audit: { evidenceRefs: true, retentionDays: 365 },
  retention: { contentDays: 90, metadataDays: 365 },
  dataResidency: { region: "eu-west-1", verified: false },
} as const;

test("factory/03: el envelope ADTC cumple el contrato y no inventa enums", () => {
  const adtc = toAdtcEvent(event, { taskId: "task_1", requestId: "req_1" });
  assert.equal(adtc.schemaVersion, ADTC_SCHEMA_VERSION);
  assert.equal(adtc.eventType, "clientes.ticket.reply_proposed");
  assert.equal(adtc.source, "agntia-clientes");
  assert.equal(adtc.tenantId, "tenant_alpha");
  assert.equal(adtc.eventId, event.id);
  assert.deepEqual(adtc.resourceRefs.sort(), ["case_ana_1", "conv_ana_1"]);
  assert.equal(AdtcEvent.safeParse(adtc).success, true);
  assert.equal(adtc.attemptId, null);
});

test("factory/03: trace/span W3C derivados son deterministas y válidos", () => {
  const first = toAdtcEvent(event);
  const second = toAdtcEvent(event);
  assert.equal(first.traceId, second.traceId);
  assert.equal(first.idempotencyKey, second.idempotencyKey);
  const traceparent = formatTraceparent(first);
  assert.equal(parseTraceparent(traceparent)?.traceId, first.traceId);
  assert.equal(parseTraceparent("00-00000000000000000000000000000000-0000000000000000-01"), null);
  assert.equal(parseTraceparent("01-abc-def-01"), null);
});

test("factory/03: PII, URLs y texto libre nunca entran en el bus", () => {
  assert.throws(
    () => toAdtcEvent(event, { payloadRef: "ana@example.com" }),
    (error: unknown) => error instanceof ServiceError && error.code === "validation_failed",
  );
  assert.throws(() => toAdtcEvent(event, { evidenceRefs: ["https://drive.example.com/x"] }), ServiceError);
  assert.throws(() => toAdtcEvent(event, { taskId: "hablar con Ana por teléfono" }), ServiceError);
  assert.throws(() => toAdtcEvent(event, { requestId: "+34600111222" }), ServiceError);
});

test("factory/00: los seis niveles de certeza mapean sin inflar PASS", () => {
  assert.equal(CERTAINTY_LEVELS.length, 6);
  assert.equal(fromGateStatus("PASS"), "TEST_VERIFIED");
  assert.equal(fromGateStatus("NOT_VERIFIED"), "CODE_VERIFIED");
  assert.equal(fromGateStatus("BLOCKED"), "PROPOSED");
  assert.equal(isVerified("CODE_VERIFIED"), false);
  assert.match(describeCertainty("PROPOSED"), /bloqueado|fuera de alcance/u);
});

test("factory/05: los once puertos existen con nombre canónico", () => {
  assert.equal(PORT_NAMES.length, 11);
  for (const name of ["CustomerProfilePort", "MessagingPort", "TicketPort", "RefundProposalPort", "AuditEvidencePort"]) {
    assert.ok(PORT_NAMES.includes(name as (typeof PORT_NAMES)[number]));
  }
});

test("factory/05: un adaptador sin contrato completo no se registra", () => {
  const registry = new AdapterRegistry();
  const { dataResidency: _omit, ...incomplete } = contract;
  assert.throws(
    () => registry.register({ contract: incomplete, ports: ["InboxPort"] }),
    (error: unknown) =>
      error instanceof ServiceError &&
      error.code === "validation_failed" &&
      Array.isArray(error.details["missing"]) &&
      (error.details["missing"] as string[]).includes("dataResidency"),
  );
  assert.throws(() => registry.register({ contract: { ...contract, provider: "x" }, ports: [] }), ServiceError);
  assert.throws(
    () => registry.register({ contract: contract, ports: ["NopePort" as "InboxPort"] }),
    ServiceError,
  );
});

test("factory/05: nombrar un proveedor no lo conecta", () => {
  const registry = new AdapterRegistry();
  const registration = registry.register({ contract, ports: ["InboxPort", "MessagingPort"] });
  assert.equal(registration.connected, false);
  assert.deepEqual(registry.connectedProviders(), []);
  assert.equal(AdapterContract.safeParse(contract).success, true);
  assert.throws(
    () =>
      registry.register({
        contract: { ...contract, tenantBinding: "shared_with_verified_isolation" },
        ports: ["InboxPort"],
      }),
    ServiceError,
  );
});

test("factory/03 negativos: sin ACL del caso no se ven adjuntos", () => {
  assert.throws(
    () =>
      requireAttachmentAccess({
        attachmentTenantId: "tenant_beta",
        tenantId: "tenant_alpha",
        caseId: "case_ana_1",
        principalCaseScopes: ["case_ana_1"],
      }),
    (error: unknown) => error instanceof ServiceError && error.status === 404,
  );
  assert.throws(
    () =>
      requireAttachmentAccess({
        attachmentTenantId: "tenant_alpha",
        tenantId: "tenant_alpha",
        caseId: "case_ana_1",
        principalCaseScopes: ["case_other"],
      }),
    (error: unknown) => error instanceof ServiceError && error.status === 403,
  );
  assert.throws(
    () =>
      requireAttachmentAccess({
        attachmentTenantId: "tenant_alpha",
        tenantId: "tenant_alpha",
        caseId: "case_ana_1",
        principalCaseScopes: ["case_ana_1"],
        quarantined: true,
      }),
    ServiceError,
  );
  assert.doesNotThrow(() =>
    requireAttachmentAccess({
      attachmentTenantId: "tenant_alpha",
      tenantId: "tenant_alpha",
      caseId: "case_ana_1",
      principalCaseScopes: ["case_ana_1"],
    }),
  );
});

test("factory/03 negativos: un fallo de observabilidad no bloquea el servicio", () => {
  const broken = {
    increment() {
      throw new Error("collector down");
    },
    observe() {
      throw new Error("collector down");
    },
  };
  const metrics = new NonBlockingMetrics(broken);
  assert.doesNotThrow(() => metrics.increment("cases.opened", { tenant: "tenant_alpha" }));
  assert.doesNotThrow(() => metrics.observe("sla.first_response", 12));
  assert.equal(metrics.failureCount(), 2);
  assert.equal(NonBlockingMetrics.guard(() => 42, 0), 42);
  assert.equal(
    NonBlockingMetrics.guard(() => {
      throw new Error("log sink down");
    }, 0),
    0,
  );

  const real = new NonBlockingMetrics(new Metrics());
  real.increment("cases.opened");
  assert.equal(real.failureCount(), 0);
});
