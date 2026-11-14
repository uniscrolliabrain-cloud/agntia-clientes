import { test } from "node:test";
import assert from "node:assert/strict";
import { Envelope, OperationResult } from "../src/contracts/envelope.ts";
import { Money, strictObject } from "../src/contracts/common.ts";
import { OutboundIntent, Contact } from "../src/contracts/dto.ts";
import { canonicalJson, hashCanonical, isOpaqueId, opaqueId } from "../src/lib/ids.ts";

test("C05: dinero admite decimal string y rechaza float implícito o exponente insuficiente", () => {
  assert.equal(Money.safeParse({ amount: "10.50", currency: "EUR", exponent: 2 }).success, true);
  assert.equal(Money.safeParse({ amount: 10.5, currency: "EUR", exponent: 2 }).success, false);
  assert.equal(Money.safeParse({ amount: "10.505", currency: "EUR", exponent: 2 }).success, false);
  assert.equal(Money.safeParse({ amount: "NaN", currency: "EUR", exponent: 2 }).success, false);
  assert.equal(Money.safeParse({ amount: "1", currency: "eur", exponent: 2 }).success, false);
});

test("C05: campos desconocidos se rechazan en frontera", () => {
  const schema = strictObject({ a: Money });
  const result = schema.safeParse({ a: { amount: "1", currency: "EUR", exponent: 0 }, b: 2 });
  assert.equal(result.success, false);
});

test("C05: envelope exige IDs del servidor y schemaVersion 1", () => {
  const base = {
    schemaVersion: 1,
    operationId: opaqueId("op"),
    tenantId: "tenant_alpha",
    actorId: opaqueId("actor"),
    capability: "clientes.reply.propose",
    requestId: null,
    correlationId: "corr_1",
    causationId: null,
    idempotencyKey: "key_12345678",
    expectedVersion: 3,
    approvalRef: null,
    dryRun: true,
    payload: {},
  };
  assert.equal(Envelope.safeParse(base).success, true);
  assert.equal(Envelope.safeParse({ ...base, schemaVersion: 2 }).success, false);
  assert.equal(Envelope.safeParse({ ...base, tenantId: "" }).success, false);
});

test("C05: OperationResult distingue preview, ok, async e incertidumbre", () => {
  const preview = {
    status: "preview",
    operationId: opaqueId("op"),
    payloadHash: "a".repeat(64),
    diff: ["body"],
    warnings: [],
  };
  assert.equal(OperationResult.safeParse(preview).success, true);
  const unknown = {
    status: "outcome_unknown",
    operationId: opaqueId("op"),
    payloadHash: "a".repeat(64),
    reconciliationRequired: true,
    retryable: false,
    notes: ["timeout tras aceptación"],
  };
  assert.equal(OperationResult.safeParse(unknown).success, true);
  assert.equal(OperationResult.safeParse({ ...unknown, retryable: true }).success, false);
});

test("C05: hash canónico no depende del orden de claves", () => {
  assert.equal(canonicalJson({ b: 1, a: 2 }), canonicalJson({ a: 2, b: 1 }));
  assert.equal(hashCanonical({ a: [1, 2] }), hashCanonical({ a: [1, 2] }));
  assert.notEqual(hashCanonical({ a: 1 }), hashCanonical({ a: 2 }));
});

test("C05: IDs opacos con prefijo y sin datos personales", () => {
  const id = opaqueId("case");
  assert.equal(isOpaqueId(id, "case"), true);
  assert.equal(id.includes("ana"), false);
});

test("C05: outbound intent no acepta estado inventado", () => {
  const intent = {
    id: opaqueId("intent"),
    tenantId: "tenant_alpha",
    operationKey: "b".repeat(64),
    conversationRef: opaqueId("conv"),
    contactRef: opaqueId("contact"),
    channel: "email",
    payloadHash: "c".repeat(64),
    proposalRef: opaqueId("prop"),
    approvalRef: null,
    state: "sent",
    leaseFence: 0,
    remoteRefs: [],
    reconciliationRef: null,
    createdAt: "2026-11-11T09:00:00.000Z",
    updatedAt: "2026-11-11T09:00:00.000Z",
  };
  assert.equal(OutboundIntent.safeParse(intent).success, false);
});

test("C05: contacto exige locale permitido y no impone email único", () => {
  const contact = {
    id: opaqueId("contact"),
    tenantId: "tenant_alpha",
    displayName: "Ana",
    verifiedChannelIdentities: [],
    organizationRelations: [],
    preferredLocale: "de",
    accessRefs: [],
  };
  assert.equal(Contact.safeParse(contact).success, false);
  assert.equal(Contact.safeParse({ ...contact, preferredLocale: "fr" }).success, true);
});
