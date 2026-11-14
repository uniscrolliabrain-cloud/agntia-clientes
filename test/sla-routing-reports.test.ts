import { test } from "node:test";
import assert from "node:assert/strict";
import { addBusinessMinutes, computeDueAt, computePausedDueAt, DEFAULT_SLA_POLICY, isWorkingInstant } from "../src/domain/sla.ts";
import { route } from "../src/domain/routing.ts";
import { computeHealth, HEALTH_METRICS } from "../src/domain/success.ts";
import { buildReport, percentile, verifyReproducible } from "../src/reporting/reports.ts";
import { Metrics, StructuredLogger } from "../src/observability/metrics.ts";
import { FIXTURE_NOW } from "../src/eval/fixtures.ts";

test("C23: calendario IANA, horario y festivos son deterministas", () => {
  assert.equal(isWorkingInstant(DEFAULT_SLA_POLICY.calendar, new Date("2026-11-11T10:00:00.000Z")), true);
  assert.equal(isWorkingInstant(DEFAULT_SLA_POLICY.calendar, new Date("2026-11-14T10:00:00.000Z")), false); // sábado
  assert.equal(isWorkingInstant(DEFAULT_SLA_POLICY.calendar, new Date("2026-12-25T10:00:00.000Z")), false);
  const due = computeDueAt(DEFAULT_SLA_POLICY, "2026-11-11T08:30:00.000Z", "first_response");
  assert.ok(due > "2026-11-11T12:00:00.000Z");
});

test("C23: cambio de horario de verano no rompe el cálculo", () => {
  const beforeDst = addBusinessMinutes(DEFAULT_SLA_POLICY.calendar, "2026-10-23T14:00:00.000Z", 120);
  const afterDst = addBusinessMinutes(DEFAULT_SLA_POLICY.calendar, "2026-10-26T09:00:00.000Z", 120);
  assert.ok(beforeDst.length > 0 && afterDst.length > 0);
  assert.notEqual(beforeDst, afterDst);
});

test("C23: pausa suma el tiempo detenido", () => {
  const paused = computePausedDueAt(
    DEFAULT_SLA_POLICY,
    "2026-11-11T12:00:00.000Z",
    "2026-11-11T09:15:00.000Z",
    "2026-11-11T10:15:00.000Z",
  );
  assert.equal(paused, "2026-11-11T13:00:00.000Z");
});

test("C23: routing por capacidad y carga, sin emoción ni nombre", () => {
  const decision = route(
    { requiredCapability: "support", contractId: "agreement_alpha", priority: "normal" },
    [
      { assigneeRef: "human_1", capabilities: ["support"], activeLoad: 3, maxLoad: 5, eligibleContractIds: ["agreement_alpha"] },
      { assigneeRef: "human_2", capabilities: ["support"], activeLoad: 1, maxLoad: 5, eligibleContractIds: ["agreement_alpha"] },
    ],
  );
  assert.equal(decision.assigneeRef, "human_2");
  assert.throws(() =>
    route(
      { requiredCapability: "support", contractId: "agreement_beta", priority: "normal" },
      [{ assigneeRef: "human_1", capabilities: ["support"], activeLoad: 0, maxLoad: 5, eligibleContractIds: ["agreement_alpha"] }],
    ),
  );
});

test("C30: missing no es cero y el score explica sus huecos", () => {
  const health = computeHealth({ tenantId: "tenant_alpha", organizationId: "org_1", observations: [], now: FIXTURE_NOW });
  assert.equal(health.score, null);
  assert.equal(health.coverage, 0);
  assert.ok(health.components.every((c) => c.reasonCode === "source_missing"));
  const withData = computeHealth({
    tenantId: "tenant_alpha",
    organizationId: "org_1",
    observations: [
      {
        tenantId: "tenant_alpha",
        organizationId: "org_1",
        metricDefinitionVersion: `${HEALTH_METRICS[0]!.id}@${HEALTH_METRICS[0]!.version}`,
        window: { from: "2026-10-01T00:00:00.000Z", to: FIXTURE_NOW },
        sourceRefs: ["cases"],
        value: 2,
        coverage: 0.9,
        freshness: FIXTURE_NOW,
        reasonCodes: [],
      },
    ],
    now: FIXTURE_NOW,
  });
  assert.equal(withData.score, 2);
  assert.ok(withData.reasonCodes.includes("source_missing"));
});

test("C36: reporte reproducible y CSAT nulo con cero encuestas", () => {
  const input = {
    id: "report_1",
    tenantId: "tenant_alpha",
    window: { from: "2026-11-01T00:00:00.000Z", to: FIXTURE_NOW },
    generatedAt: FIXTURE_NOW,
    sources: [{ ref: "store:cases", observedAt: FIXTURE_NOW, hash: "abc" }],
    cases: { opened: 3, resolvedVerified: 1, autoClosed: 0, reopened: 0, open: 2 },
    responses: { substantiveFirstResponsesMinutes: [12, 30], automaticAcks: 4 },
    surveys: { responses: 0, csat: null, note: "sin encuestas" },
    cost: { amount: "0.00", currency: "EUR", measured: false },
  };
  const first = buildReport(input);
  const second = buildReport(input);
  assert.equal(first.hash, second.hash);
  assert.equal(verifyReproducible(first), true);
  assert.equal(percentile(first.responses.substantiveFirstResponsesMinutes, 0.5), 30);
  assert.equal(percentile([], 0.5), null);
  assert.ok(first.gaps.includes("no_survey_data"));
  assert.ok(first.gaps.includes("cost_not_measured"));
});

test("C36: métricas sin datos devuelven null y los logs redactan secretos", () => {
  const metrics = new Metrics();
  assert.equal(metrics.quantile("latency", 0.95), null);
  metrics.observe("latency", 120, { route: "cases" });
  assert.equal(metrics.quantile("latency", 0.5), 120);
  const logger = new StructuredLogger();
  logger.log("info", "token eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.abcdef y sk_live_123456", {
    fields: { authorization: "Bearer abc", email: "ana@acme.example" },
  });
  const serialized = JSON.stringify(logger.entries());
  assert.equal(serialized.includes("sk_live"), false);
  assert.equal(serialized.includes("ana@acme.example"), false);
  assert.equal(logger.containsSentinels(), false);
});
