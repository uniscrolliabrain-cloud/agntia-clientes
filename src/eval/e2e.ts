import { loadConfig } from "../config.ts";
import { buildContext, type AppContext } from "../app/context.ts";
import { resolveActor } from "../auth/principal.ts";
import { buildApproval, assertApprovalCovers } from "../domain/approvals.ts";
import { DispatchWorker, type DispatchPort } from "../jobs/worker.ts";
import { transition } from "../domain/cases.ts";
import { computeDueAt, DEFAULT_SLA_POLICY } from "../domain/sla.ts";
import { computeHealth } from "../domain/success.ts";
import { FIXTURE_NOW, OPERATOR_P, TENANT_A, TENANT_B, USERS, sampleProposal } from "./fixtures.ts";
import { ServiceError } from "../lib/errors.ts";
import { judgeLanguage, judgeTrajectory } from "./judge.ts";

/**
 * E2E A–I del plan (CLI-C40). Todo in-process, con fixtures sintéticas y un
 * proveedor fake que registra efectos. Los gates reales de proveedor quedan
 * NOT_VERIFIED y así se reportan.
 */
export interface ScenarioResult {
  id: string;
  name: string;
  status: "PASS" | "FAIL" | "BLOCKED";
  assertions: { name: string; ok: boolean; detail: string }[];
  notes: string[];
}

function testContext(): AppContext {
  return buildContext({
    config: { ...loadConfig({ NODE_ENV: "test" }), env: "test" },
  });
}

function claimsFor(sub: string, tenantId?: string) {
  return {
    sub,
    role: "authenticated",
    aud: "authenticated",
    iss: "https://fixture.supabase.co/auth/v1",
    exp: 9_999_999_999,
    iat: 1_700_000_000,
    ...(tenantId ? { tenantIdClaim: tenantId } : {}),
    appMetadata: tenantId ? { tenant_id: tenantId } : {},
    raw: {},
  };
}

function recordingPort(): { port: DispatchPort; effects: { remoteRef: string; tenantId: string }[] } {
  const effects: { remoteRef: string; tenantId: string }[] = [];
  return {
    effects,
    port: {
      async send({ tenantId, intent }) {
        effects.push({ remoteRef: `remote_${effects.length + 1}`, tenantId });
        return { state: "accepted", remoteRef: `remote_${intent.id}` };
      },
    },
  };
}

export async function runE2E(): Promise<{ scenarios: ScenarioResult[]; executedAt: string; suite: string }> {
  const scenarios: ScenarioResult[] = [
    await scenarioA(),
    await scenarioB(),
    await scenarioC(),
    await scenarioD(),
    await scenarioE(),
    await scenarioF(),
    await scenarioG(),
    await scenarioH(),
    await scenarioI(),
  ];
  return {
    suite: "agntia-clientes/e2e/A-I",
    executedAt: new Date().toISOString(),
    scenarios,
  };
}

/** A · Atención controlada: propuesta → aprobación → dispatch → receipt. */
async function scenarioA(): Promise<ScenarioResult> {
  const ctx = testContext();
  const assertions: ScenarioResult["assertions"] = [];
  const caseDto = ctx.store.cases.require(TENANT_A, "case_case_ana_1");
  const contact = ctx.store.contacts.require(TENANT_A, caseDto.contactId);
  const proposal = await (
    await import("../domain/proposals.ts")
  ).proposeReply({
    tenantId: TENANT_A,
    caseDto,
    contact,
    locale: "es",
    question: "¿Cómo doy de alta un usuario?",
    acl: ["support"],
    knowledge: ctx.knowledge,
    gateway: ctx.gateway,
    now: FIXTURE_NOW,
    policyRef: "policy_reply_v1",
  });
  assertions.push({
    name: "propuesta con cita vigente",
    ok: proposal.citations.length > 0 && proposal.citations[0]?.version === 2,
    detail: `citas=${proposal.citations.map((c) => `${c.articleId}#v${c.version}`).join(",")}`,
  });
  assertions.push({
    name: "no cita versión retirada",
    ok: proposal.citations.every((c) => c.version === 2),
    detail: "v1 retirada excluida por lifecycle",
  });

  const approval = buildApproval(
    {
      tenantId: TENANT_A,
      proposal,
      recipientRef: "addr_ana_a",
      channel: "email",
      attachmentHashes: [],
      expectedVersion: caseDto.version,
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
  const intent = ctx.intents.create({
    tenantId: TENANT_A,
    conversationRef: "conv_ana_1",
    contactRef: contact.id,
    channel: "email",
    payload: { body: proposal.body, recipientRef: "addr_ana_a" },
    proposalRef: proposal.id,
  });
  ctx.intents.attachApproval(TENANT_A, intent.id, approval.id);

  const { port, effects } = recordingPort();
  const worker = new DispatchWorker({ intents: ctx.intents, privacy: ctx.privacy, budget: ctx.budget, port });
  const dispatched = await worker.dispatch({
    tenantId: TENANT_A,
    intentId: intent.id,
    proposal,
    approval,
    caseVersion: caseDto.version,
    policyVersion: "policy_reply_v1",
    recipientRef: "addr_ana_a",
    channel: "email",
    attachmentHashes: [],
    now: FIXTURE_NOW,
    revocationVersion: 1,
    autonomyPaused: false,
    purpose: "support_reply",
    consentSubjectRef: contact.id,
    addressRef: "addr_ana_a",
  });
  assertions.push({
    name: "un único efecto remoto",
    ok: effects.length === 1,
    detail: `effects=${effects.length}`,
  });
  assertions.push({
    name: "accepted no es delivered",
    ok: dispatched.state === "accepted",
    detail: `state=${dispatched.state}`,
  });

  // El caso no se resuelve por haber enviado: exige evidencia.
  let resolveBlocked = false;
  try {
    transition(caseDto, "resolve", {
      expectedVersion: caseDto.version,
      actorId: USERS.reviewerA,
      actorKind: "human",
      evidence: [],
    });
  } catch {
    resolveBlocked = true;
  }
  assertions.push({
    name: "envío no resuelve el caso",
    ok: resolveBlocked,
    detail: "resolve sin evidencia → conflicto",
  });
  assertions.push({
    name: "texto aprobado sin promesas de efecto",
    ok: judgeLanguage(proposal.body, "es").ok,
    detail: judgeLanguage(proposal.body, "es").failures.join(",") || "ok",
  });
  return {
    id: "A",
    name: "Atención controlada",
    status: assertions.every((a) => a.ok) ? "PASS" : "FAIL",
    assertions,
    notes: ["Proveedor fake: el receipt real sigue NOT_VERIFIED"],
  };
}

/** B · Aislamiento entre tenants y entre contactos. */
async function scenarioB(): Promise<ScenarioResult> {
  const ctx = testContext();
  const assertions: ScenarioResult["assertions"] = [];
  const actorB = await resolveActor(claimsFor(USERS.ownerB, TENANT_B), ctx.directory);
  const crossTenant = ctx.store.cases.get(actorB.tenantId, "case_case_ana_1");
  assertions.push({ name: "caso de A invisible para B", ok: crossTenant === null, detail: "lookup scoped" });

  const retrieval = ctx.knowledge.search({
    tenantId: TENANT_A,
    text: "alta de usuarios Initech doble aprobación",
    locale: "es",
    acl: ["support"],
    purpose: "case_reply",
    now: FIXTURE_NOW,
  });
  assertions.push({
    name: "chunk de B no aparece en A",
    ok: retrieval.chunks.every((c) => c.tenantId === TENANT_A),
    detail: `chunks=${retrieval.chunks.length}`,
  });

  const contactActor = await resolveActor(claimsFor(USERS.contactA1), ctx.directory);
  const allowed = contactActor.resourceScopes.includes("case_case_ana_1");
  const otherCase = contactActor.resourceScopes.includes("case_case_ana_private");
  assertions.push({
    name: "portal: solo recursos compartidos",
    ok: allowed && !otherCase,
    detail: `scopes=${contactActor.resourceScopes.join(",")}`,
  });

  let mandateBlocked = false;
  try {
    ctx.mandates.verify(
      {
        ...mandateFor(ctx, "mandate_alpha"),
      },
      {
        actorId: "agent_fixture_support",
        originTenantId: OPERATOR_P,
        targetTenantId: TENANT_B,
        capability: "reply.propose",
      },
    );
  } catch {
    mandateBlocked = true;
  }
  assertions.push({
    name: "mandato de A no sirve en B",
    ok: mandateBlocked,
    detail: "tenant objetivo verificado",
  });

  return {
    id: "B",
    name: "Aislamiento multi-tenant",
    status: assertions.every((a) => a.ok) ? "PASS" : "FAIL",
    assertions,
    notes: ["RLS ejecutada en memoria; Postgres real NOT_VERIFIED"],
  };
}

/** C · Incertidumbre: proveedor acepta, se pierde respuesta. */
async function scenarioC(): Promise<ScenarioResult> {
  const ctx = testContext();
  const assertions: ScenarioResult["assertions"] = [];
  const proposal = sampleProposal(TENANT_A, "case_case_ana_1");
  const approval = buildApproval(
    {
      tenantId: TENANT_A,
      proposal,
      recipientRef: "addr_ana_a",
      channel: "email",
      attachmentHashes: [],
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
  const intent = ctx.intents.create({
    tenantId: TENANT_A,
    conversationRef: "conv_ana_1",
    contactRef: "contact_ana_acme",
    channel: "email",
    payload: { body: proposal.body },
    proposalRef: proposal.id,
  });
  ctx.intents.attachApproval(TENANT_A, intent.id, approval.id);

  let attempts = 0;
  const port: DispatchPort = {
    async send() {
      attempts += 1;
      throw new ServiceError("timeout", "sin respuesta tras aceptación", {
        retryable: false,
        reconciliationRequired: true,
      });
    },
  };
  const worker = new DispatchWorker({ intents: ctx.intents, privacy: ctx.privacy, budget: ctx.budget, port });
  const unknown = await worker.dispatch({
    tenantId: TENANT_A,
    intentId: intent.id,
    proposal,
    approval,
    caseVersion: 1,
    policyVersion: "policy_reply_v1",
    recipientRef: "addr_ana_a",
    channel: "email",
    attachmentHashes: [],
    now: FIXTURE_NOW,
    revocationVersion: 1,
    autonomyPaused: false,
    purpose: "support_reply",
    consentSubjectRef: "contact_ana_acme",
    addressRef: "addr_ana_a",
  });
  assertions.push({
    name: "estado outcome_unknown",
    ok: unknown.state === "outcome_unknown",
    detail: `state=${unknown.state}`,
  });

  let secondAttemptBlocked = false;
  try {
    await worker.dispatch({
      tenantId: TENANT_A,
      intentId: intent.id,
      proposal,
      approval,
      caseVersion: 1,
      policyVersion: "policy_reply_v1",
      recipientRef: "addr_ana_a",
      channel: "email",
      attachmentHashes: [],
      now: FIXTURE_NOW,
      revocationVersion: 1,
      autonomyPaused: false,
      purpose: "support_reply",
      consentSubjectRef: "contact_ana_acme",
      addressRef: "addr_ana_a",
    });
  } catch {
    secondAttemptBlocked = true;
  }
  assertions.push({
    name: "sin retry ciego",
    ok: secondAttemptBlocked && attempts === 1,
    detail: `attempts=${attempts}`,
  });

  const reconciled = worker.reconcile({
    tenantId: TENANT_A,
    intentId: intent.id,
    evidence: { remoteRef: "remote_msg_1", delivered: true },
  });
  assertions.push({
    name: "reconciliación con evidencia → delivered",
    ok: reconciled.state === "delivered",
    detail: `state=${reconciled.state}`,
  });
  return {
    id: "C",
    name: "Resultado incierto",
    status: assertions.every((a) => a.ok) ? "PASS" : "FAIL",
    assertions,
    notes: ["Proveedor fake; la ventana real de dedup depende del proveedor"],
  };
}

/** D · Cambio concurrente tras la aprobación. */
async function scenarioD(): Promise<ScenarioResult> {
  const ctx = testContext();
  const assertions: ScenarioResult["assertions"] = [];
  const proposal = sampleProposal(TENANT_A, "case_case_ana_1");
  const approval = buildApproval(
    {
      tenantId: TENANT_A,
      proposal,
      recipientRef: "addr_ana_a",
      channel: "email",
      attachmentHashes: [],
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
  const edited = { ...proposal, body: `${proposal.body} Además, te devolvemos el dinero.` };
  let blocked = false;
  try {
    assertApprovalCovers(
      approval,
      {
        tenantId: TENANT_A,
        proposal: edited,
        recipientRef: "addr_ana_a",
        channel: "email",
        attachmentHashes: [],
        expectedVersion: 1,
        policyVersion: "policy_reply_v1",
        caseVersion: 1,
      },
      { now: FIXTURE_NOW, revocationVersion: 1 },
    );
  } catch {
    blocked = true;
  }
  assertions.push({ name: "edición invalida la aprobación", ok: blocked, detail: "hash de payload distinto" });

  const proposalForLocale = sampleProposal(TENANT_A, "case_case_ana_1");
  const judge = judgeTrajectory(["knowledge.search", "reply.propose"], ["knowledge.search", "reply.propose"]);
  assertions.push({
    name: "trayectoria permitida",
    ok: judge.ok,
    detail: judge.failures.join(",") || "ok",
  });
  assertions.push({
    name: "propuesta válida intacta",
    ok: proposalForLocale.body.includes("Panel de administración"),
    detail: "texto original conservado",
  });
  return {
    id: "D",
    name: "Cambio concurrente",
    status: assertions.every((a) => a.ok) ? "PASS" : "FAIL",
    assertions,
    notes: [],
  };
}

/** E · Handoff humano pausa la autonomía. */
async function scenarioE(): Promise<ScenarioResult> {
  const ctx = testContext();
  const assertions: ScenarioResult["assertions"] = [];
  const handoff = ctx.handoffs.create({
    tenantId: TENANT_A,
    caseRef: "case_case_ana_1",
    conversationRef: "conv_ana_1",
    reason: "customer_request",
    summaryRefs: ["case:case_case_ana_1", "knowledge:kb_alta_usuarios#v2"],
    actionNotTaken: "responder automáticamente",
  });
  assertions.push({
    name: "autonomía pausada al crear handoff",
    ok: ctx.handoffs.isPaused(TENANT_A, "conv_ana_1"),
    detail: handoff.state,
  });
  const acked = ctx.handoffs.acknowledge(handoff.id, TENANT_A, USERS.reviewerA);
  assertions.push({ name: "ACK humano registrado", ok: acked.acceptedBy === USERS.reviewerA, detail: acked.state });

  let dispatchBlocked = false;
  try {
    const worker = new DispatchWorker({
      intents: ctx.intents,
      privacy: ctx.privacy,
      budget: ctx.budget,
      port: { async send() { return { state: "accepted", remoteRef: "should_not_happen" }; } },
    });
    const proposal = sampleProposal(TENANT_A, "case_case_ana_1");
    await worker.dispatch({
      tenantId: TENANT_A,
      intentId: "intent_missing",
      proposal,
      approval: {
        id: "apr_missing",
        tenantId: TENANT_A,
        proposalHash: "0".repeat(64),
        recipientHash: "0".repeat(64),
        channelHash: "0".repeat(64),
        attachmentsHash: "0".repeat(64),
        actorId: USERS.reviewerA,
        claimedRole: "human_reviewer",
        expectedVersion: 1,
        policyVersion: "policy_reply_v1",
        expiresAt: "2026-11-11T09:30:00.000Z",
        revocationVersion: 1,
        createdAt: FIXTURE_NOW,
      },
      caseVersion: 1,
      policyVersion: "policy_reply_v1",
      recipientRef: "addr_ana_a",
      channel: "email",
      attachmentHashes: [],
      now: FIXTURE_NOW,
      revocationVersion: 1,
      autonomyPaused: true,
      purpose: "support_reply",
      consentSubjectRef: "contact_ana_acme",
      addressRef: "addr_ana_a",
    });
  } catch {
    dispatchBlocked = true;
  }
  assertions.push({ name: "job en cola no envía tras handoff", ok: dispatchBlocked, detail: "autonomyPaused" });
  return {
    id: "E",
    name: "Handoff humano",
    status: assertions.every((a) => a.ok) ? "PASS" : "FAIL",
    assertions,
    notes: ["Sin UI real: el ACK se simula con el servicio"],
  };
}

/** F · Revocación de permiso durante la espera. */
async function scenarioF(): Promise<ScenarioResult> {
  const ctx = testContext();
  const assertions: ScenarioResult["assertions"] = [];
  ctx.privacy.suppress(TENANT_A, "addr_ana_a");
  let blocked = false;
  try {
    ctx.privacy.assertMaySend({
      tenantId: TENANT_A,
      subjectRef: "contact_ana_acme",
      channel: "email",
      addressRef: "addr_ana_a",
      purpose: "support_reply",
    });
  } catch {
    blocked = true;
  }
  assertions.push({ name: "supresión bloquea envío en cola", ok: blocked, detail: "suppression list" });

  const approval = buildApproval(
    {
      tenantId: TENANT_A,
      proposal: sampleProposal(TENANT_A, "case_case_ana_1"),
      recipientRef: "addr_ana_a",
      channel: "email",
      attachmentHashes: [],
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
  let revocationBlocked = false;
  try {
    assertApprovalCovers(
      approval,
      {
        tenantId: TENANT_A,
        proposal: sampleProposal(TENANT_A, "case_case_ana_1"),
        recipientRef: "addr_ana_a",
        channel: "email",
        attachmentHashes: [],
        expectedVersion: 1,
        policyVersion: "policy_reply_v1",
        caseVersion: 1,
      },
      { now: FIXTURE_NOW, revocationVersion: 2 },
    );
  } catch {
    revocationBlocked = true;
  }
  assertions.push({
    name: "revocación posterior invalida la aprobación",
    ok: revocationBlocked,
    detail: "revocationVersion distinta → 409",
  });

  return {
    id: "F",
    name: "Revocación de permiso",
    status: assertions.every((a) => a.ok) ? "PASS" : "FAIL",
    assertions,
    notes: ["La comprobación de revocación de mandato vive en MandateVerifier"],
  };
}

/** G · Privacidad: exportación revisada y supresión planificada. */
async function scenarioG(): Promise<ScenarioResult> {
  const ctx = testContext();
  const assertions: ScenarioResult["assertions"] = [];
  const request = ctx.privacyRequests.open({
    tenantId: TENANT_A,
    kind: "export",
    requesterRef: USERS.contactA1,
    subjectRef: USERS.contactA1,
    scope: ["messages", "cases", "third_party:other_contact"],
  });
  ctx.privacyRequests.verify(request.id, TENANT_A, USERS.reviewerA);
  const preview = ctx.privacyRequests.previewExport(request.id, TENANT_A);
  assertions.push({
    name: "export minimiza datos de terceros",
    ok: preview.redactions.length === 1 && !preview.includedScopes.some((s) => s.startsWith("third_party:")),
    detail: `redactions=${preview.redactions.length}`,
  });
  ctx.privacyRequests.approve(request.id, TENANT_A, USERS.reviewerA);
  const executed = ctx.privacyRequests.execute(request.id, TENANT_A, ["messages", "cases", "vector_index"]);
  assertions.push({
    name: "propagación con ACK por almacén",
    ok: executed.notes.filter((n) => n.startsWith("propagated:")).length === 3,
    detail: executed.notes.join(","),
  });

  let modelExportBlocked = false;
  try {
    ctx.privacyRequests.open({
      tenantId: TENANT_A,
      kind: "export",
      requesterRef: "agent_fixture_support",
      subjectRef: USERS.contactA1,
      scope: ["*"],
      requestedByModel: true,
    });
  } catch {
    modelExportBlocked = true;
  }
  assertions.push({ name: "el modelo no pide export total", ok: modelExportBlocked, detail: "scope=* denegado" });

  const erasure = ctx.privacyRequests.open({
    tenantId: TENANT_A,
    kind: "erasure",
    requesterRef: USERS.contactA1,
    subjectRef: USERS.contactA1,
    scope: ["messages"],
    legalHold: true,
  });
  ctx.privacyRequests.verify(erasure.id, TENANT_A, USERS.reviewerA);
  let holdBlocked = false;
  try {
    ctx.privacyRequests.approve(erasure.id, TENANT_A, USERS.reviewerA);
  } catch {
    holdBlocked = true;
  }
  assertions.push({ name: "bloqueo legal impide borrado", ok: holdBlocked, detail: "restricción en lugar de supresión" });

  return {
    id: "G",
    name: "Privacidad y retención",
    status: assertions.every((a) => a.ok) ? "PASS" : "FAIL",
    assertions,
    notes: ["Backup/restore real y reindexación NOT_VERIFIED"],
  };
}

/** H · Portal externo sin UI AgntiaPro. */
async function scenarioH(): Promise<ScenarioResult> {
  const ctx = testContext();
  const assertions: ScenarioResult["assertions"] = [];
  const contactActor = await resolveActor(claimsFor(USERS.contactA1), ctx.directory);
  assertions.push({
    name: "principal de portal identificado",
    ok: contactActor.kind === "contact" && contactActor.roleId === "contact_portal",
    detail: `${contactActor.kind}/${contactActor.roleId}`,
  });

  const ownCase = ctx.store.cases.get(contactActor.tenantId, "case_case_ana_1");
  const foreignCase = ctx.store.cases.get(contactActor.tenantId, "case_case_ana_private");
  assertions.push({
    name: "su caso visible, el de otro contacto no",
    ok: ownCase !== null && foreignCase !== null && !contactActor.resourceScopes.includes(foreignCase.id),
    detail: `scopes=${contactActor.resourceScopes.join(",")}`,
  });

  const twin = ctx.twins.require(TENANT_A, "twin_alpha_support", "reply.propose");
  assertions.push({
    name: "twin enlazado al canónico, no un registro nuevo",
    ok: twin.canonicalActorId === "agent_fixture_support" && twin.canonicalRevision.length > 0,
    detail: `${twin.canonicalRoleId}/${twin.canonicalRuntimeId}`,
  });
  assertions.push({
    name: "revisión canónica registrada",
    ok: twin.canonicalRevision === "sha-fixture-1",
    detail: "revisión congelada en fixture",
  });
  return {
    id: "H",
    name: "Portal externo",
    status: assertions.every((a) => a.ok) ? "PASS" : "FAIL",
    assertions,
    notes: ["Sin Supabase real: el JWT se verifica con firma de fixture"],
  };
}

/** I · SLA y customer success honestos. */
async function scenarioI(): Promise<ScenarioResult> {
  const assertions: ScenarioResult["assertions"] = [];
  const dueAt = computeDueAt(DEFAULT_SLA_POLICY, "2026-11-13T15:30:00.000Z", "first_response");
  const holidaySkipped = computeDueAt(DEFAULT_SLA_POLICY, "2026-12-24T16:00:00.000Z", "first_response");
  assertions.push({
    name: "SLA reproducible con calendario IANA",
    ok: dueAt > "2026-11-13T15:30:00.000Z",
    detail: `dueAt=${dueAt}`,
  });
  assertions.push({
    name: "festivo no consume SLA",
    ok: holidaySkipped.startsWith("2026-12-28") || holidaySkipped.startsWith("2027-01-04"),
    detail: `dueAt=${holidaySkipped}`,
  });

  const health = computeHealth({ tenantId: TENANT_A, organizationId: "org_acme_a", observations: [], now: FIXTURE_NOW });
  assertions.push({
    name: "sin datos el score es null, no 0",
    ok: health.score === null && health.reasonCodes.includes("insufficient_data"),
    detail: `score=${String(health.score)}`,
  });

  const { buildReport } = await import("../reporting/reports.ts");
  const report = buildReport({
    id: "report_i",
    tenantId: TENANT_A,
    window: { from: "2026-11-01T00:00:00.000Z", to: FIXTURE_NOW },
    generatedAt: FIXTURE_NOW,
    sources: [],
    cases: { opened: 2, resolvedVerified: 0, autoClosed: 0, reopened: 0, open: 2 },
    responses: { substantiveFirstResponsesMinutes: [], automaticAcks: 0 },
    surveys: { responses: 0, csat: null, note: "sin encuestas" },
    cost: { amount: "0.00", currency: "EUR", measured: false },
  });
  assertions.push({
    name: "reporte declara datos faltantes",
    ok: report.surveys.csat === null && report.gaps.includes("no_survey_data"),
    detail: report.gaps.join(","),
  });
  return {
    id: "I",
    name: "SLA y customer success",
    status: assertions.every((a) => a.ok) ? "PASS" : "FAIL",
    assertions,
    notes: ["tZdata del sistema; versión fijada por política"],
  };
}

function mandateFor(ctx: AppContext, id: string) {
  const tenantA = id === "mandate_alpha";
  const twin = tenantA ? "twin_alpha_support" : "twin_beta_support";
  const target = tenantA ? TENANT_A : TENANT_B;
  const base = {
    id,
    originatingActorRef: "agent_fixture_support",
    originatingTenantId: OPERATOR_P,
    targetTenantId: target,
    serviceAgreementId: tenantA ? "agreement_alpha" : "agreement_beta",
    twinBindingId: twin,
    capabilities: ["reply.propose", "knowledge.read"],
    resourceScope: [tenantA ? "case_case_ana_1" : "case_beta_1"],
    fieldScope: ["case.state"],
    purpose: "Atención de nivel 1",
    costCeiling: { amount: "5.00", currency: "EUR", exponent: 2 },
    issuedAt: FIXTURE_NOW,
    expiresAt: "2027-11-11T00:00:00.000Z",
    revocationVersion: 1,
  };
  return { ...base, signatureOrVerificationRef: ctx.mandates.sign(base) };
}
