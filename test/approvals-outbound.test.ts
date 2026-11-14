import { test } from "node:test";
import assert from "node:assert/strict";
import { assertApprovalCovers, buildApproval } from "../src/domain/approvals.ts";
import { OutboundLedger } from "../src/domain/outbound.ts";
import { fixedClock } from "../src/lib/time.ts";
import { FIXTURE_NOW, TENANT_A, USERS, sampleProposal } from "../src/eval/fixtures.ts";
import { ServiceError } from "../src/lib/errors.ts";

const clock = fixedClock(FIXTURE_NOW);
const proposal = sampleProposal(TENANT_A, "case_case_ana_1");

function approve(overrides: { attachments?: string[]; channel?: string; recipient?: string } = {}) {
  return buildApproval(
    {
      tenantId: TENANT_A,
      proposal,
      recipientRef: overrides.recipient ?? "addr_ana_a",
      channel: overrides.channel ?? "email",
      attachmentHashes: overrides.attachments ?? [],
      expectedVersion: 1,
      policyVersion: "policy_reply_v1",
    },
    { actorId: USERS.reviewerA, kind: "human", capabilities: ["reply.approve"] },
    {
      now: FIXTURE_NOW,
      expiresAt: "2026-11-11T09:30:00.000Z",
      revocationVersion: 1,
      proposerActorId: "agent_fixture_support",
    },
  );
}

function candidate(overrides: Partial<Parameters<typeof assertApprovalCovers>[1]> = {}) {
  return {
    tenantId: TENANT_A,
    proposal,
    recipientRef: "addr_ana_a",
    channel: "email",
    attachmentHashes: [],
    expectedVersion: 1,
    policyVersion: "policy_reply_v1",
    caseVersion: 1,
    ...overrides,
  };
}

test("C26: aprobación humana válida cubre el payload exacto", () => {
  const binding = approve();
  assert.doesNotThrow(() =>
    assertApprovalCovers(binding, candidate(), { now: FIXTURE_NOW, revocationVersion: 1 }),
  );
});

test("C26: el proponente no aprueba su propia propuesta", () => {
  assert.throws(
    () =>
      buildApproval(
        {
          tenantId: TENANT_A,
          proposal,
          recipientRef: "addr_ana_a",
          channel: "email",
          attachmentHashes: [],
          expectedVersion: 1,
          policyVersion: "policy_reply_v1",
        },
        { actorId: "agent_fixture_support", kind: "human", capabilities: ["reply.approve"] },
        {
          now: FIXTURE_NOW,
          expiresAt: "2026-11-11T09:30:00.000Z",
          revocationVersion: 1,
          proposerActorId: "agent_fixture_support",
        },
      ),
    (error: unknown) => error instanceof ServiceError && error.status === 403,
  );
});

test("C26: un agente no puede aprobar", () => {
  assert.throws(() =>
    buildApproval(
      {
        tenantId: TENANT_A,
        proposal,
        recipientRef: "addr_ana_a",
        channel: "email",
        attachmentHashes: [],
        expectedVersion: 1,
        policyVersion: "policy_reply_v1",
      },
      { actorId: "agent_x", kind: "agent", capabilities: ["reply.approve"] },
      {
        now: FIXTURE_NOW,
        expiresAt: "2026-11-11T09:30:00.000Z",
        revocationVersion: 1,
        proposerActorId: "agent_fixture_support",
      },
    ),
  );
});

test("C26: cambiar texto, destinatario, canal o adjuntos invalida", () => {
  const binding = approve();
  assert.throws(() =>
    assertApprovalCovers(
      binding,
      candidate({ proposal: { ...proposal, body: `${proposal.body} extra` } }),
      { now: FIXTURE_NOW, revocationVersion: 1 },
    ),
  );
  assert.throws(() =>
    assertApprovalCovers(binding, candidate({ recipientRef: "otro@acme.example" }), {
      now: FIXTURE_NOW,
      revocationVersion: 1,
    }),
  );
  assert.throws(() =>
    assertApprovalCovers(binding, candidate({ channel: "whatsapp" }), {
      now: FIXTURE_NOW,
      revocationVersion: 1,
    }),
  );
  assert.throws(() =>
    assertApprovalCovers(binding, candidate({ attachmentHashes: ["f".repeat(64)] }), {
      now: FIXTURE_NOW,
      revocationVersion: 1,
    }),
  );
});

test("C26: aprobación caducada o revocada no se usa", () => {
  const binding = approve();
  assert.throws(() =>
    assertApprovalCovers(binding, candidate(), { now: "2026-11-11T10:00:00.000Z", revocationVersion: 1 }),
  );
  assert.throws(() =>
    assertApprovalCovers(binding, candidate(), { now: FIXTURE_NOW, revocationVersion: 2 }),
  );
});

test("C26: aprobación de otro tenant no cubre el payload", () => {
  const binding = approve();
  assert.throws(() =>
    assertApprovalCovers(binding, candidate({ tenantId: "tenant_beta" }), {
      now: FIXTURE_NOW,
      revocationVersion: 1,
    }),
  );
});

test("C27: replay con el mismo payload devuelve el mismo intent", () => {
  const ledger = new OutboundLedger({ clock });
  const input = {
    tenantId: TENANT_A,
    conversationRef: "conv_ana_1",
    contactRef: "contact_ana_acme",
    channel: "email" as const,
    payload: { body: "hola" },
    proposalRef: "prop_1",
  };
  const first = ledger.create(input);
  const second = ledger.create(input);
  assert.equal(first.id, second.id);
  assert.equal(ledger.list(TENANT_A).length, 1);
});

test("C27: misma clave con otro contenido da conflicto", () => {
  const ledger = new OutboundLedger({ clock });
  const base = {
    tenantId: TENANT_A,
    conversationRef: "conv_ana_1",
    contactRef: "contact_ana_acme",
    channel: "email" as const,
    proposalRef: "prop_1",
  };
  ledger.create({ ...base, payload: { body: "hola" } });
  assert.throws(() => ledger.create({ ...base, payload: { body: "otro" } }));
});

test("C27: no se encola sin aprobación y delivered exige referencia", () => {
  const ledger = new OutboundLedger({ clock });
  const intent = ledger.create({
    tenantId: TENANT_A,
    conversationRef: "conv_ana_1",
    contactRef: "contact_ana_acme",
    channel: "email",
    payload: { body: "hola" },
    proposalRef: "prop_1",
  });
  assert.throws(() => ledger.transition(TENANT_A, intent.id, "queued"));
  ledger.attachApproval(TENANT_A, intent.id, "apr_1");
  ledger.transition(TENANT_A, intent.id, "approved");
  ledger.transition(TENANT_A, intent.id, "queued");
  ledger.transition(TENANT_A, intent.id, "leased", { leaseFence: 1 });
  ledger.transition(TENANT_A, intent.id, "dispatching");
  assert.throws(() => ledger.transition(TENANT_A, intent.id, "delivered"));
  const delivered = ledger.transition(TENANT_A, intent.id, "delivered", { remoteRefs: ["remote_1"] });
  assert.equal(delivered.state, "delivered");
});
