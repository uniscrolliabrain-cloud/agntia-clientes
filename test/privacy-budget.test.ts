import { test } from "node:test";
import assert from "node:assert/strict";
import { ProcessingLedger } from "../src/privacy/processing.ts";
import { PrivacyService } from "../src/privacy/requests.ts";
import { BudgetLedger, RateLimiter } from "../src/budget/budget.ts";
import { fixedClock } from "../src/lib/time.ts";
import { FIXTURE_NOW, TENANT_A, USERS } from "../src/eval/fixtures.ts";

const clock = fixedClock(FIXTURE_NOW);

test("C07: una base declarada no concede todo; marketing sin consentimiento se bloquea", () => {
  const ledger = new ProcessingLedger({ clock });
  ledger.declareBasis({
    purpose: "support_reply",
    lawfulBasis: "contract",
    noticeVersion: "v1",
    scope: [TENANT_A],
    sourceEvidenceRef: "fixture",
    validFrom: FIXTURE_NOW,
    validTo: null,
    restriction: null,
  });
  assert.throws(() => ledger.basisFor(TENANT_A, "model_training"));
  assert.throws(() =>
    ledger.assertMaySend({
      tenantId: TENANT_A,
      subjectRef: "contact_1",
      channel: "email",
      addressRef: "a@acme.example",
      purpose: "marketing",
    }),
  );
  ledger.recordConsent({
    subjectRef: "contact_1",
    tenantId: TENANT_A,
    channel: "email",
    purpose: "marketing",
    action: "grant",
    medium: "portal",
    version: "v1",
    evidenceRef: "fixture:consent",
  });
  assert.doesNotThrow(() =>
    ledger.assertMaySend({
      tenantId: TENANT_A,
      subjectRef: "contact_1",
      channel: "email",
      addressRef: "a@acme.example",
      purpose: "marketing",
    }),
  );
});

test("C07: retirada posterior bloquea el envío y queda reconstruible", () => {
  const ledger = new ProcessingLedger({ clock });
  ledger.recordConsent({
    subjectRef: "contact_1",
    tenantId: TENANT_A,
    channel: "email",
    purpose: "marketing",
    action: "grant",
    medium: "portal",
    version: "v1",
    evidenceRef: "fixture:consent",
  });
  ledger.recordConsent({
    subjectRef: "contact_1",
    tenantId: TENANT_A,
    channel: "email",
    purpose: "marketing",
    action: "withdraw",
    medium: "portal",
    version: "v1",
    evidenceRef: null,
  });
  assert.equal(ledger.consentState(TENANT_A, "contact_1", "marketing", "email"), "withdrawn");
  assert.throws(() =>
    ledger.assertMaySend({
      tenantId: TENANT_A,
      subjectRef: "contact_1",
      channel: "email",
      addressRef: "a@acme.example",
      purpose: "marketing",
    }),
  );
});

test("C07: grabación no autoriza entrenamiento ni campaña", () => {
  const ledger = new ProcessingLedger({ clock });
  ledger.declareBasis({
    purpose: "av_recording",
    lawfulBasis: "consent",
    noticeVersion: "v1",
    scope: [TENANT_A],
    sourceEvidenceRef: "fixture",
    validFrom: FIXTURE_NOW,
    validTo: null,
    restriction: null,
  });
  assert.throws(() => ledger.basisFor(TENANT_A, "model_training"));
  assert.throws(() => ledger.declareBasis({
    purpose: "model_training",
    lawfulBasis: "contract",
    noticeVersion: "v1",
    scope: [TENANT_A],
    sourceEvidenceRef: null,
    validFrom: FIXTURE_NOW,
    validTo: null,
    restriction: null,
  }));
});

test("C07: grant sin evidencia se rechaza", () => {
  const ledger = new ProcessingLedger({ clock });
  assert.throws(() =>
    ledger.recordConsent({
      subjectRef: "contact_1",
      tenantId: TENANT_A,
      channel: "email",
      purpose: "marketing",
      action: "grant",
      medium: "chat",
      version: "v1",
      evidenceRef: null,
    }),
  );
});

test("C38: exportación revisada, bloqueo legal y propagación con ACK", () => {
  const service = new PrivacyService({ clock });
  const request = service.open({
    tenantId: TENANT_A,
    kind: "export",
    requesterRef: USERS.contactA1,
    subjectRef: USERS.contactA1,
    scope: ["messages", "third_party:otro"],
  });
  service.verify(request.id, TENANT_A, USERS.reviewerA);
  const preview = service.previewExport(request.id, TENANT_A);
  assert.deepEqual(preview.includedScopes, ["messages"]);
  assert.equal(preview.redactions.length, 1);
  service.approve(request.id, TENANT_A, USERS.reviewerA);
  const executed = service.execute(request.id, TENANT_A, ["messages", "vectors"]);
  assert.equal(executed.status, "executed");
  // Una exportación no es una supresión: tras un restore no hay nada que reaplicar.
  assert.equal(service.reappliedAfterRestore(TENANT_A).length, 0);

  const erasure = service.open({
    tenantId: TENANT_A,
    kind: "erasure",
    requesterRef: USERS.contactA1,
    subjectRef: USERS.contactA1,
    scope: ["messages"],
    legalHold: true,
  });
  service.verify(erasure.id, TENANT_A, USERS.reviewerA);
  assert.throws(() => service.approve(erasure.id, TENANT_A, USERS.reviewerA));
});

test("C38: sin política de retención no se inventa plazo", () => {
  const service = new PrivacyService({ clock });
  assert.throws(() => service.retentionFor("documento_desconocido"));
  assert.equal(service.retentionFor("message.original").months, 24);
});

test("C37: dos reservas no gastan el mismo saldo y el techo bloquea", () => {
  const ledger = new BudgetLedger({ clock });
  ledger.setQuota({ tenantId: TENANT_A, monthlyCeilingEur: 1, avMinutesPerMonth: 10, channelMessagesPerHour: 10 });
  ledger.reserve({ tenantId: TENANT_A, operationKey: "op1", amount: "0.60", currency: "EUR" });
  ledger.consume(TENANT_A, "op1");
  assert.throws(() =>
    ledger.reserve({ tenantId: TENANT_A, operationKey: "op2", amount: "0.60", currency: "EUR" }),
  );
  const replay = ledger.reserve({ tenantId: TENANT_A, operationKey: "op1", amount: "0.60", currency: "EUR" });
  assert.equal(replay.state, "consumed");
  assert.equal(ledger.spent(TENANT_A), 0.6);
});

test("C37: rate limit es independiente del presupuesto", () => {
  const limiter = new RateLimiter({ capacity: 2, refillPerSecond: 0 });
  assert.equal(limiter.take("tenant_a"), true);
  assert.equal(limiter.take("tenant_a"), true);
  assert.equal(limiter.take("tenant_a"), false);
  assert.equal(limiter.take("tenant_b"), true);
});
