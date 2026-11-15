import { test } from "node:test";
import assert from "node:assert/strict";
import { IdentityDirectory } from "../src/domain/identity.ts";
import { ContactImport } from "../src/service/import.ts";
import { MemoryStore } from "../src/storage/memory.ts";
import { fixedClock } from "../src/lib/time.ts";
import { ClaimsDesk, RenewalCalendar } from "../src/domain/renewals.ts";
import { ServiceError } from "../src/lib/errors.ts";

const NOW = "2026-11-11T09:00:00.000Z";
const TENANT_A = "tenant_alpha";
const TENANT_B = "tenant_beta";

const isCode = (code: string) => (error: unknown) => error instanceof ServiceError && error.code === code;

// ---------------------------------------------------------------- C11

test("C11: un vínculo verificado exige evidencia y fecha", () => {
  const dir = new IdentityDirectory({ now: () => NOW });
  assert.throws(
    () =>
      dir.link({
        tenantId: TENANT_A,
        contactRef: "contact_ana",
        provider: "email",
        addressRef: "addr_ana",
        verificationState: "verified",
        evidenceRef: null,
        verifiedAt: NOW,
      }),
    isCode("forbidden"),
  );
  assert.throws(
    () =>
      dir.link({
        tenantId: TENANT_A,
        contactRef: "contact_ana",
        provider: "email",
        addressRef: "addr_ana",
        verificationState: "verified",
        evidenceRef: "invitation:1",
        verifiedAt: null,
      }),
    isCode("validation_failed"),
  );
});

test("C11: el mismo nombre no fusiona; la evidencia con revisor sí", () => {
  const dir = new IdentityDirectory({ now: () => NOW });
  assert.throws(
    () =>
      dir.merge({
        tenantId: TENANT_A,
        primaryRef: "contact_ana",
        secondaryRef: "contact_ana_2",
        reviewedBy: "user_reviewer_a",
        signal: "name_only",
        evidenceRefs: ["note:same-name"],
      }),
    isCode("forbidden"),
  );
  assert.throws(
    () =>
      dir.merge({
        tenantId: TENANT_A,
        primaryRef: "contact_ana",
        secondaryRef: "contact_ana_2",
        reviewedBy: "agent_support",
        signal: "verified_email",
        evidenceRefs: ["email:bounced-proof"],
      }),
    isCode("forbidden"),
  );
  const merge = dir.merge({
    tenantId: TENANT_A,
    primaryRef: "contact_ana",
    secondaryRef: "contact_ana_2",
    reviewedBy: "user_reviewer_a",
    signal: "verified_email",
    evidenceRefs: ["email:proof:1"],
  });
  assert.equal(merge.state, "applied");
  assert.equal(dir.resolveAlias(TENANT_A, "contact_ana_2"), "contact_ana");
});

test("C11: deshacer el merge conserva vínculos y no cruza tenants", () => {
  const dir = new IdentityDirectory({ now: () => NOW });
  const linkA = dir.link({
    tenantId: TENANT_A,
    contactRef: "contact_ana_2",
    provider: "whatsapp",
    addressRef: "addr_wa_ana",
    verificationState: "verified",
    evidenceRef: "wa:verified:1",
    verifiedAt: NOW,
  });
  const merge = dir.merge({
    tenantId: TENANT_A,
    primaryRef: "contact_ana",
    secondaryRef: "contact_ana_2",
    reviewedBy: "user_reviewer_a",
    signal: "verified_phone",
    evidenceRefs: ["phone:proof:1"],
  });
  assert.equal(dir.linksOf(TENANT_A, "contact_ana").length, 1);
  const reverted = dir.unmerge({ tenantId: TENANT_A, mergeRef: merge.id, revertedBy: "user_reviewer_a" });
  assert.equal(reverted.state, "reverted");
  assert.equal(dir.resolveAlias(TENANT_A, "contact_ana_2"), "contact_ana_2");
  assert.equal(dir.linksOf(TENANT_A, "contact_ana_2")[0]?.id, linkA.id);
  assert.equal(dir.merges(TENANT_B).length, 0);
});

test("C11: dos contactos no comparten una dirección verificada sin merge", () => {
  const dir = new IdentityDirectory({ now: () => NOW });
  dir.link({
    tenantId: TENANT_A,
    contactRef: "contact_ana",
    provider: "email",
    addressRef: "addr_shared",
    verificationState: "verified",
    evidenceRef: "invitation:1",
    verifiedAt: NOW,
  });
  assert.throws(
    () =>
      dir.link({
        tenantId: TENANT_A,
        contactRef: "contact_other",
        provider: "email",
        addressRef: "addr_shared",
        verificationState: "verified",
        evidenceRef: "invitation:2",
        verifiedAt: NOW,
      }),
    isCode("conflict"),
  );
  // Mismo addressRef en otro tenant es otro vínculo, no un conflicto.
  assert.doesNotThrow(() =>
    dir.link({
      tenantId: TENANT_B,
      contactRef: "contact_b",
      provider: "email",
      addressRef: "addr_shared",
      verificationState: "verified",
      evidenceRef: "invitation:b",
      verifiedAt: NOW,
    }),
  );
});

// ---------------------------------------------------------------- C12

const ROWS = [
  { externalId: "ext-1", displayName: "Ana Ejemplo", email: "Ana@Acme.Example", locale: "es" },
  { externalId: "ext-2", displayName: "Luis Ejemplo", email: "luis@acme.example", locale: "en" },
  { externalId: "ext-3", displayName: "Roto", email: "no-es-email", locale: "es" },
  { displayName: "Sin id", email: "x@acme.example", locale: "es" },
  { externalId: "ext-1", displayName: "Duplicado", email: "dup@acme.example", locale: "es" },
];

function freshImport() {
  const store = new MemoryStore({ clock: fixedClock(NOW) });
  return { store, importer: new ContactImport(store, { now: () => NOW }) };
}

test("C12: el dry-run no escribe y cuarentena las filas malas", () => {
  const { store, importer } = freshImport();
  const preview = importer.stage({
    tenantId: TENANT_A,
    sourceRef: "crm-export-2026-11",
    connectionId: "conn_import_a",
    mappingVersion: "mapping-3",
    rows: ROWS,
    dryRun: true,
  });
  assert.equal(preview.accepted, 2);
  assert.deepEqual(
    preview.quarantined.map((row) => [row.index, row.reason]),
    [
      [2, "invalid_email"],
      [3, "missing_external_id"],
      [4, "duplicate_in_batch"],
    ],
  );
  assert.equal(store.contacts.list(TENANT_A).length, 0);
});

test("C12: commit idempotente por externalId y aislado por tenant", () => {
  const { store, importer } = freshImport();
  const preview = importer.stage({
    tenantId: TENANT_A,
    sourceRef: "crm-export-2026-11",
    connectionId: "conn_import_a",
    mappingVersion: "mapping-3",
    rows: ROWS,
  });
  const first = importer.commit(preview.jobRef);
  assert.deepEqual({ created: first.created, skipped: first.skippedExisting }, { created: 2, skipped: 0 });
  assert.equal(importer.commit(preview.jobRef).created, 2); // mismo job: no reprocesa
  const replay = importer.stage({
    tenantId: TENANT_A,
    sourceRef: "crm-export-2026-11",
    connectionId: "conn_import_a",
    mappingVersion: "mapping-3",
    rows: ROWS,
  });
  const second = importer.commit(replay.jobRef);
  assert.equal(second.created, 0);
  assert.equal(second.skippedExisting, 2);
  assert.equal(store.contacts.list(TENANT_A).length, 2);
  assert.equal(store.contacts.list(TENANT_B).length, 0);

  const otherTenant = importer.stage({
    tenantId: TENANT_B,
    sourceRef: "crm-export-2026-11",
    connectionId: "conn_import_b",
    mappingVersion: "mapping-3",
    rows: [ROWS[0]!],
  });
  assert.equal(importer.commit(otherTenant.jobRef).created, 1);
  assert.equal(store.contacts.list(TENANT_B).length, 1);
});

test("C12: reanudar desde el cursor no repite filas", () => {
  const { importer } = freshImport();
  const preview = importer.stage({
    tenantId: TENANT_A,
    sourceRef: "crm-export-2026-11",
    connectionId: "conn_import_a",
    mappingVersion: "mapping-3",
    rows: ROWS,
  });
  const resumed = importer.resume({ jobRef: preview.jobRef, rows: ROWS });
  assert.equal(resumed.accepted, 0);
  assert.equal(resumed.nextCursor, ROWS.length);
});

// ---------------------------------------------------------------- C31

test("C31: propuesta de reembolso exige Finanzas y Legal, y nunca se ejecuta", () => {
  const desk = new ClaimsDesk({ now: () => NOW });
  const claim = desk.intake({
    tenantId: TENANT_A,
    caseRef: "case_ana_1",
    category: "billing",
    severity: "high",
    evidenceRefs: ["receipt:invoice-77"],
    receivedAt: NOW,
  });
  const proposal = desk.propose({
    tenantId: TENANT_A,
    claimRef: claim.id,
    remedy: "refund_proposal",
    amount: "120.00",
    proposerRef: "user_reviewer_a",
  });
  assert.deepEqual(proposal.requiredApprovals, ["finance", "legal"]);
  assert.equal(proposal.state, "proposed");
  assert.throws(
    () => desk.approve({ tenantId: TENANT_A, proposalRef: proposal.id, approverRef: "user_reviewer_a", role: "finance" }),
    isCode("forbidden"),
  );
  const partial = desk.approve({
    tenantId: TENANT_A,
    proposalRef: proposal.id,
    approverRef: "user_finance_a",
    role: "finance",
  });
  assert.equal(partial.state, "proposed");
  const approved = desk.approve({
    tenantId: TENANT_A,
    proposalRef: proposal.id,
    approverRef: "user_legal_a",
    role: "legal",
  });
  assert.equal(approved.state, "approved");
  assert.throws(() => desk.execute(), isCode("forbidden"));
});

test("C31: la política acota importes y categorías", () => {
  const desk = new ClaimsDesk({ now: () => NOW });
  const dataClaim = desk.intake({
    tenantId: TENANT_A,
    caseRef: "case_data_1",
    category: "data",
    severity: "high",
    evidenceRefs: ["audit:export"],
    receivedAt: NOW,
  });
  assert.throws(
    () => desk.propose({ tenantId: TENANT_A, claimRef: dataClaim.id, remedy: "refund_proposal", amount: "10.00", proposerRef: "user_reviewer_a" }),
    isCode("forbidden"),
  );
  const serviceClaim = desk.intake({
    tenantId: TENANT_A,
    caseRef: "case_sla_1",
    category: "service",
    severity: "normal",
    evidenceRefs: ["sla:breach:1"],
    receivedAt: NOW,
  });
  assert.throws(
    () => desk.propose({ tenantId: TENANT_A, claimRef: serviceClaim.id, remedy: "service_credit", amount: "80.00", proposerRef: "user_reviewer_a" }),
    isCode("forbidden"),
  );
  const credit = desk.propose({
    tenantId: TENANT_A,
    claimRef: serviceClaim.id,
    remedy: "service_credit",
    amount: "20.00",
    proposerRef: "user_reviewer_a",
  });
  assert.deepEqual(credit.requiredApprovals, ["support_lead", "finance"]);
  assert.equal(desk.proposals(TENANT_B).length, 0);
});

test("C31: la ventana de renovación es determinista y exige autorización", () => {
  const calendar = new RenewalCalendar();
  const record = calendar.register({
    tenantId: TENANT_A,
    organizationRef: "org_acme_a",
    contractRef: "contract-1",
    renewsAt: "2026-12-01T00:00:00.000Z",
    noticeDays: 30,
    ownerRef: "user_owner_a",
  });
  const [due] = calendar.due(TENANT_A, NOW);
  assert.equal(due?.window, "in_notice");
  assert.equal(due?.daysToRenewal, 19); // 19,6 días redondeados hacia abajo: determinista
  assert.equal(calendar.due(TENANT_B, NOW).length, 0);
  assert.throws(() => calendar.markRenewed(TENANT_A, record.id, ""), isCode("forbidden"));
  const overdue = calendar.due(TENANT_A, "2026-12-05T00:00:00.000Z")[0];
  assert.equal(overdue?.window, "overdue");
  assert.equal(overdue?.daysToRenewal, -4);
  assert.equal(calendar.markRenewed(TENANT_A, record.id, "user_owner_a").state, "renewed");
  assert.equal(calendar.due(TENANT_A, NOW).length, 0);
});
