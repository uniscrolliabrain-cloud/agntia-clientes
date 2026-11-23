import { Hono } from "hono";
import { z } from "zod";
import type { AppContext } from "./context.ts";
import { assertTenant, assertResourceAccess, requireCapability, resolveActor, type Actor } from "../auth/principal.ts";
import { ServiceError, conflict, forbidden, invalid, notFound, toServiceError } from "../lib/errors.ts";
import { CASE_STATES, transition, type CaseEvent } from "../domain/cases.ts";
import { proposeReply } from "../domain/proposals.ts";
import { buildApproval } from "../domain/approvals.ts";
import { buildIntent, transitionIntent } from "../domain/outbound.ts";
import { acceptStepIn, submitDocumentInto } from "../domain/onboarding.ts";
import { computeDueAt, DEFAULT_SLA_POLICY } from "../domain/sla.ts";
import { buildReport, percentile } from "../reporting/reports.ts";
import { renderCasePage, renderPortalHome } from "./ui.ts";
import { seedContext } from "./context.ts";
import { mintDevToken, assertDevTokensAllowed } from "../auth/dev-token.ts";
import { NonBlockingMetrics } from "../observability/nonblocking.ts";

/**
 * API nominada /v1/clientes (CLI-C34). Sin proxy genérico: rutas exactas,
 * capabilities explícitas y errores sin metadatos de otro tenant.
 */
export interface AuthContext {
  Variables: { actor: Actor; correlationId: string; tenantId: string };
}

const TransitionBody = z
  .object({
    event: z.enum([
      "triage",
      "assign",
      "start_work",
      "ask_customer",
      "resume_work",
      "wait_internal",
      "propose_resolution",
      "resolve",
      "close",
      "reopen",
    ]),
    expectedVersion: z.number().int().nonnegative(),
    assignedTo: z.string().min(3).max(200).nullable().optional(),
    evidence: z
      .array(
        z
          .object({
            kind: z.enum(["citation", "receipt", "remote_state", "human_ack"]),
            ref: z.string().min(1).max(400),
            satisfied: z.boolean(),
          })
          .strict(),
      )
      .optional(),
    silentCloseAgreed: z.boolean().optional(),
  })
  .strict();

const ProposalBody = z
  .object({
    locale: z.enum(["es", "en", "fr"]),
    question: z.string().min(3).max(2000),
    acl: z.array(z.string().max(120)).max(20),
  })
  .strict();

const PreviewBody = z
  .object({
    caseId: z.string().min(3).max(200),
    proposalId: z.string().min(3).max(200),
    recipientRef: z.string().min(1).max(300),
    channel: z.enum(["web", "email", "whatsapp", "chatwoot"]),
    attachmentHashes: z.array(z.string().regex(/^[0-9a-f]{64}$/)).max(20),
  })
  .strict();

const ApproveBody = PreviewBody.extend({
  expectedVersion: z.number().int().nonnegative(),
  policyVersion: z.string().min(1).max(60),
  expiresInMinutes: z.number().int().min(1).max(1440).optional(),
}).strict();

const HandoffBody = z
  .object({
    caseRef: z.string().min(3).max(200),
    conversationRef: z.string().min(3).max(200),
    reason: z.enum(["customer_request", "identity_doubt", "legal_risk", "sensitive_data", "uncertain_outcome"]),
    summaryRefs: z.array(z.string().max(400)).min(1).max(20),
    actionNotTaken: z.string().min(1).max(500),
  })
  .strict();

export function createApp(ctx: AppContext): Hono<AuthContext> {
  const app = new Hono<AuthContext>();

  app.use("*", async (c, next) => {
    const correlationId = c.req.header("x-correlation-id") ?? `corr_${crypto.randomUUID()}`;
    c.set("correlationId", correlationId);
    c.header("x-correlation-id", correlationId);
    await next();
  });

  app.get("/healthz", (c) =>
    c.json({
      status: "ok",
      bridge: "HOST_BRIDGE_NOT_VERIFIED",
      providers: ctx.connections ? "not_configured" : "absent",
      anam: ctx.anam.snapshot().configured ? "configured" : "not_configured",
      database: ctx.config.databaseUrl ? "configured" : "in_memory",
      case_store: ctx.caseRepo.kind,
      proposal_store: ctx.proposals.kind,
      approval_store: ctx.approvals.kind,
      intent_store: ctx.intentRepo.kind,
      plan_store: ctx.plans.kind,
      host_bridge: ctx.config.agente.baseUrl ? "endpoint_configured_not_verified" : "not_configured",
    }),
  );

  // Portal HTML mínimo (sin datos si no hay sesión: la UI real usa Supabase).
  // Raíz del servicio: el portal es la única superficie pública útil.
  app.get("/", (c) => c.redirect("/portal", 302));
  app.get("/portal", (c) => c.html(renderPortalHome()));
  app.get("/portal/cases/:caseId", (c) => c.html(renderCasePage(c.req.param("caseId"))));

  // Autenticación: JWT verificado + membresía + tenant efectivo.
  app.use("/v1/*", async (c, next) => {
    const header = c.req.header("authorization") ?? "";
    if (!header.startsWith("Bearer ")) throw new ServiceError("unauthorized", "Falta Bearer token");
    const claims = await ctx.jwt.verify(header.slice("Bearer ".length));
    const requestedTenant = c.req.header("x-tenant-id");
    const actor = await resolveActor(claims, ctx.directory, {
      ...(requestedTenant ? { requestedTenantId: requestedTenant } : {}),
    });
    if (c.req.method !== "GET" && c.req.method !== "HEAD") {
      const origin = c.req.header("origin");
      if (origin && new URL(origin).host !== new URL(c.req.url).host) {
        throw forbidden("Origen no permitido para mutación");
      }
    }
    c.set("actor", actor);
    c.set("tenantId", actor.tenantId);
    await next();
  });

  app.get("/v1/clientes/me", (c) => {
    const actor = c.get("actor");
    return c.json({
      principal: {
        kind: actor.kind,
        id: actor.id,
        tenantId: actor.tenantId,
        roleId: actor.roleId,
        capabilities: actor.capabilities,
      },
      entitlements: ctx.agreements.entitlement(actor.tenantId, "support"),
    });
  });

  app.get("/v1/clientes/cases", async (c) => {
    const actor = c.get("actor");
    requireCapability(actor, "cases.read");
    const rows = (await ctx.caseRepo.list(actor.tenantId)).map((row) => ({
      id: row.id,
      state: row.state,
      priority: row.priority,
      contactId: row.contactId,
      dueAt: row.dueAt,
      version: row.version,
      category: row.category,
    }));
    return c.json({ items: rows, denominator: rows.length });
  });

  app.get("/v1/clientes/cases/:id", async (c) => {
    const actor = c.get("actor");
    requireCapability(actor, "cases.read");
    const row = await ctx.caseRepo.get(actor.tenantId, c.req.param("id"));
    if (!row) throw notFound();
    assertTenant(actor, row.tenantId);
    assertResourceAccess(actor, row.id);
    return c.json({
      case: row,
      sla: {
        policyId: row.slaPolicyId,
        dueAt: row.dueAt ?? computeDueAt(DEFAULT_SLA_POLICY, row.createdAt, "first_response"),
        timeZone: DEFAULT_SLA_POLICY.calendar.timeZone,
        policyVersion: DEFAULT_SLA_POLICY.version,
      },
      timeline: ctx.store.messages.list(actor.tenantId, (m) => m.caseRef === row.id).length,
    });
  });

  app.post("/v1/clientes/cases/:id/transitions", async (c) => {
    const actor = c.get("actor");
    requireCapability(actor, "cases.transition");
    const body = TransitionBody.parse(await c.req.json());
    const row = await ctx.caseRepo.get(actor.tenantId, c.req.param("id"));
    if (!row) throw notFound();
    assertResourceAccess(actor, row.id);
    const result = transition(row, body.event as CaseEvent, {
      expectedVersion: body.expectedVersion,
      actorId: actor.id,
      actorKind: actor.kind,
      ...(body.assignedTo !== undefined ? { assignedTo: body.assignedTo } : {}),
      ...(body.evidence ? { evidence: body.evidence } : {}),
      ...(body.silentCloseAgreed !== undefined ? { silentCloseAgreed: body.silentCloseAgreed } : {}),
    });
    // CAS: si otra instancia escribió entre la lectura y este punto, no se
    // sobrescribe; el llamador recibe 409 y vuelve a leer.
    const applied = await ctx.caseRepo.save(actor.tenantId, result.case, row.version);
    if (!applied) throw conflict("expectedVersion obsoleto: el caso cambió");
    await ctx.caseRepo.appendAudit({
      id: `audit_${crypto.randomUUID()}`,
      tenantId: actor.tenantId,
      actorId: actor.id,
      capability: "cases.transition",
      operationId: c.get("correlationId"),
      correlationId: c.get("correlationId"),
      outcome: "applied",
      payloadRef: `case:${row.id}:${result.from}->${result.to}`,
    });
    // Observabilidad accesoria: un sumidero caído no revierte la transición.
    NonBlockingMetrics.guard(() => ctx.metrics.increment("cases.transition", { tenant: actor.tenantId }), undefined);
    return c.json({ case: result.case, transition: { from: result.from, to: result.to } });
  });

  app.post("/v1/clientes/cases/:id/answer-proposals", async (c) => {
    const actor = c.get("actor");
    requireCapability(actor, "reply.propose");
    const body = ProposalBody.parse(await c.req.json());
    const row = await ctx.caseRepo.get(actor.tenantId, c.req.param("id"));
    if (!row) throw notFound();
    assertResourceAccess(actor, row.id);
    const contact = ctx.store.contacts.get(actor.tenantId, row.contactId);
    if (!contact) throw notFound();
    const proposal = await proposeReply({
      tenantId: actor.tenantId,
      caseDto: row,
      contact,
      locale: body.locale,
      question: body.question,
      acl: [...body.acl, actor.roleId === "contact_portal" ? "support" : "support"],
      knowledge: ctx.knowledge,
      gateway: ctx.gateway,
      now: ctx.store.now(),
      policyRef: "policy_reply_v1",
    });
    await ctx.proposals.insert(proposal);
    return c.json({ proposal, effect: "none", note: "La propuesta no envía nada" }, 201);
  });

  app.get("/v1/clientes/answer-proposals/:id", async (c) => {
    const actor = c.get("actor");
    requireCapability(actor, "cases.read");
    const proposal = await ctx.proposals.get(actor.tenantId, c.req.param("id"));
    if (!proposal) throw notFound();
    assertTenant(actor, proposal.tenantId);
    return c.json({ proposal });
  });

  app.post("/v1/clientes/outbound-previews", async (c) => {
    const actor = c.get("actor");
    requireCapability(actor, "reply.propose");
    const body = PreviewBody.parse(await c.req.json());
    const proposal = await ctx.proposals.get(actor.tenantId, body.proposalId);
    if (!proposal) throw notFound();
    return c.json({
      preview: {
        recipientRef: body.recipientRef,
        channel: body.channel,
        body: proposal.body,
        attachments: body.attachmentHashes.length,
        expiresAt: new Date(Date.parse(ctx.store.now()) + 30 * 60_000).toISOString(),
      },
      effect: "none",
      requiresApproval: true,
    });
  });

  app.post("/v1/clientes/outbound-intents", async (c) => {
    const actor = c.get("actor");
    requireCapability(actor, "reply.approve");
    const body = ApproveBody.parse(await c.req.json());
    const proposal = await ctx.proposals.get(actor.tenantId, body.proposalId);
    if (!proposal) throw notFound();
    const caseDto = await ctx.caseRepo.get(actor.tenantId, body.caseId);
    if (!caseDto) throw notFound();
    const now = ctx.store.now();
    const channel = body.channel === "whatsapp" ? "whatsapp" : body.channel === "email" ? "email" : "chatwoot";
    const candidate = buildIntent(
      {
        tenantId: actor.tenantId,
        conversationRef: caseDto.conversationRefs[0] ?? "conv_unknown",
        contactRef: caseDto.contactId,
        channel,
        payload: { body: proposal.body, recipientRef: body.recipientRef },
        proposalRef: proposal.id,
      },
      now,
    );
    // Idempotencia durable: el mismo envío repetido devuelve el intent existente
    // en vez de crear otra aprobación o encolar dos veces.
    const created = await ctx.intentRepo.create(candidate);
    if (!created.created && created.intent.approvalRef) {
      // Replay completo: ni otra aprobación ni otro intent.
      const existingApproval = await ctx.approvals.get(actor.tenantId, created.intent.approvalRef);
      return c.json({ intent: created.intent, approval: existingApproval, idempotentReplay: true }, 201);
    }
    const approval = buildApproval(
      {
        tenantId: actor.tenantId,
        proposal,
        recipientRef: body.recipientRef,
        channel: body.channel,
        attachmentHashes: body.attachmentHashes,
        expectedVersion: body.expectedVersion,
        policyVersion: body.policyVersion,
      },
      { actorId: actor.id, kind: actor.kind, capabilities: actor.capabilities },
      {
        now,
        expiresAt: new Date(Date.parse(now) + (body.expiresInMinutes ?? 30) * 60_000).toISOString(),
        revocationVersion: 1,
        proposerActorId: proposal.modelConfigRef,
      },
    );
    await ctx.approvals.insert(approval);
    const awaiting = transitionIntent(created.intent, "awaiting_approval", { approvalRef: approval.id }, now);
    const saved = await ctx.intentRepo.save(actor.tenantId, awaiting, created.intent);
    if (!saved) throw conflict("El intent cambió mientras se aprobaba: reintentar");
    return c.json({ intent: awaiting, approval }, 201);
  });

  app.get("/v1/clientes/outbound-intents/:id", async (c) => {
    const actor = c.get("actor");
    requireCapability(actor, "cases.read");
    const intent = await ctx.intentRepo.get(actor.tenantId, c.req.param("id"));
    if (!intent) throw notFound();
    return c.json({ intent });
  });

  /**
   * Envío a un sandbox local: no habla con ningún proveedor y lo declara en la
   * respuesta. Sirve para activar la vertical completa (aprobación → receipt)
   * sin presentar un mock como integración real. Prohibido en producción.
   */
  app.post("/v1/clientes/outbound-intents/:id/sandbox-dispatch", async (c) => {
    const actor = c.get("actor");
    requireCapability(actor, "cases.write");
    if (ctx.config.env === "production") throw forbidden("Sandbox no disponible en producción");
    const current = await ctx.intentRepo.get(actor.tenantId, c.req.param("id"));
    if (!current) throw notFound();
    const chain: Array<{ next: Parameters<typeof transitionIntent>[1]; patch?: Parameters<typeof transitionIntent>[2] }> = [
      { next: "approved" },
      { next: "queued" },
      { next: "leased", patch: { leaseFence: current.leaseFence + 1 } },
      { next: "dispatching" },
      { next: "accepted", patch: { remoteRefs: [`sandbox:${current.id}`] } },
    ];
    let intent = current;
    for (const step of chain) {
      const next = transitionIntent(intent, step.next, step.patch ?? {}, ctx.store.now());
      const applied = await ctx.intentRepo.save(actor.tenantId, next, intent);
      if (!applied) throw conflict("El intent cambió durante el despacho: reintentar");
      intent = next;
    }
    return c.json({
      intent,
      receipt: { kind: "sandbox", ref: `sandbox:${current.id}`, note: "sin proveedor externo" },
      effect: "sandbox_only",
    });
  });

  app.post("/v1/clientes/outbound-intents/:id/reconcile", async (c) => {
    const actor = c.get("actor");
    requireCapability(actor, "cases.write");
    const body = z
      .object({ remoteRef: z.string().min(1).max(300), delivered: z.boolean() })
      .strict()
      .parse(await c.req.json());
    const workerReconcile = await ctx.intentRepo.get(actor.tenantId, c.req.param("id"));
    if (!workerReconcile) throw notFound();
    if (workerReconcile.state !== "outcome_unknown" && workerReconcile.state !== "reconciliation_required" && workerReconcile.state !== "accepted") {
      throw invalid("El intent no está en un estado reconciliable");
    }
    const next = transitionIntent(
      workerReconcile,
      body.delivered ? "delivered" : "accepted",
      { remoteRefs: [body.remoteRef] },
      ctx.store.now(),
    );
    const applied = await ctx.intentRepo.save(actor.tenantId, next, workerReconcile);
    if (!applied) throw conflict("El intent cambió durante la reconciliación: reintentar");
    return c.json({ intent: next });
  });

  app.get("/v1/clientes/knowledge/search", (c) => {
    const actor = c.get("actor");
    requireCapability(actor, "knowledge.read");
    const text = c.req.query("q") ?? "";
    const locale = (c.req.query("locale") ?? "es") as "es" | "en" | "fr";
    if (text.trim().length < 3) throw invalid("Consulta demasiado corta");
    const result = ctx.knowledge.search({
      tenantId: actor.tenantId,
      text,
      locale,
      acl: [actor.roleId === "contact_portal" ? "public" : "support"],
      purpose: "knowledge_lookup",
      now: ctx.store.now(),
    });
    return c.json({
      abstained: result.abstained,
      reasonCodes: result.reasonCodes,
      citations: result.citations,
    });
  });

  /* ── Onboarding (CLI-C29): vertical slice durable ───────────────────────── */

  app.post("/v1/clientes/onboarding/plans", async (c) => {
    const actor = c.get("actor");
    requireCapability(actor, "cases.write");
    const body = z
      .object({
        organizationRef: z.string().min(3).max(200),
        playbookId: z.string().min(3).max(120),
        playbookVersion: z.number().int().positive(),
      })
      .strict()
      .parse(await c.req.json());
    if (!ctx.store.organizations.get(actor.tenantId, body.organizationRef)) throw notFound();
    const plan = ctx.onboarding.startPlan({
      tenantId: actor.tenantId,
      organizationRef: body.organizationRef,
      playbookId: body.playbookId,
      version: body.playbookVersion,
      assignedBy: actor.id,
    });
    await ctx.plans.insert(plan);
    return c.json({ plan, effect: "none" }, 201);
  });

  app.get("/v1/clientes/onboarding/plans/:id", async (c) => {
    const actor = c.get("actor");
    requireCapability(actor, "cases.read");
    const plan = await ctx.plans.get(actor.tenantId, c.req.param("id"));
    if (!plan) throw notFound();
    return c.json({ plan });
  });

  app.post("/v1/clientes/onboarding/plans/:id/steps/:key/document", async (c) => {
    const actor = c.get("actor");
    requireCapability(actor, "cases.write");
    const body = z
      .object({ documentRef: z.string().min(3).max(400), evidenceRef: z.string().min(3).max(400) })
      .strict()
      .parse(await c.req.json());
    const plan = await ctx.plans.get(actor.tenantId, c.req.param("id"));
    if (!plan) throw notFound();
    const next = submitDocumentInto(plan, {
      stepKey: c.req.param("key"),
      documentRef: body.documentRef,
      evidenceRef: body.evidenceRef,
    });
    const saved = await ctx.plans.save(actor.tenantId, next, plan.version);
    if (!saved) throw conflict("El plan cambió: volver a leer antes de reenviar");
    return c.json({ plan: next, effect: "none", note: "Recibir el documento no acredita el hito" });
  });

  app.post("/v1/clientes/onboarding/plans/:id/steps/:key/acceptance", async (c) => {
    const actor = c.get("actor");
    requireCapability(actor, "cases.transition");
    if (actor.kind !== "human") throw forbidden("La aceptación de un hito exige un humano");
    const plan = await ctx.plans.get(actor.tenantId, c.req.param("id"));
    if (!plan) throw notFound();
    const next = acceptStepIn(plan, { stepKey: c.req.param("key"), acceptedBy: actor.id });
    const saved = await ctx.plans.save(actor.tenantId, next, plan.version);
    if (!saved) throw conflict("El plan cambió: volver a leer antes de aceptar");
    await ctx.caseRepo.appendAudit({
      id: `audit_${crypto.randomUUID()}`,
      tenantId: actor.tenantId,
      actorId: actor.id,
      capability: "onboarding.accept",
      operationId: c.get("correlationId"),
      correlationId: c.get("correlationId"),
      outcome: "applied",
      payloadRef: `plan:${plan.id}:${c.req.param("key")}`,
    });
    return c.json({ plan: next });
  });

  app.post("/v1/clientes/handoffs", async (c) => {
    const actor = c.get("actor");
    requireCapability(actor, "handoff.manage");
    const body = HandoffBody.parse(await c.req.json());
    const handoff = ctx.handoffs.create({ tenantId: actor.tenantId, ...body });
    return c.json({ handoff, autonomyPaused: true }, 201);
  });

  app.post("/v1/clientes/handoffs/:id/acknowledge", (c) => {
    const actor = c.get("actor");
    requireCapability(actor, "handoff.manage");
    const handoff = ctx.handoffs.acknowledge(c.req.param("id"), actor.tenantId, actor.id);
    return c.json({ handoff });
  });

  app.post("/v1/clientes/advisor-sessions", async (c) => {
    const actor = c.get("actor");
    requireCapability(actor, "advisor.session");
    const body = z
      .object({
        twinBindingId: z.string().min(3).max(200),
        caseRef: z.string().min(3).max(200),
        durationMinutes: z.number().int().min(1).max(30),
        recordingRequested: z.boolean(),
        consentRecording: z.boolean(),
      })
      .strict()
      .parse(await c.req.json());
    try {
      const grant = ctx.anam.issueSession({
        tenantId: actor.tenantId,
        principalRef: actor.id,
        twinBindingId: body.twinBindingId,
        caseRef: body.caseRef,
        capabilities: ["knowledge.read", "reply.propose"],
        durationMinutes: body.durationMinutes,
        recordingRequested: body.recordingRequested,
        consentRecording: body.consentRecording,
      });
      return c.json({ session: grant, apiKeyExposed: false }, 201);
    } catch (error) {
      const serviceError = toServiceError(error);
      // Sin Anam hay fallback de texto: se declara, no se degrada la seguridad.
      return c.json(
        { error: serviceError.toEnvelope(c.get("correlationId")).error, fallback: "text_only" },
        serviceError.status as 503,
      );
    }
  });

  app.get("/v1/clientes/reports", async (c) => {
    const actor = c.get("actor");
    requireCapability(actor, "reports.read");
    const rows = await ctx.caseRepo.list(actor.tenantId);
    const resolved = rows.filter((r) => r.state === "resolved").length;
    const snapshot = buildReport({
      id: `report_${actor.tenantId}`,
      tenantId: actor.tenantId,
      window: { from: "2026-11-01T00:00:00.000Z", to: ctx.store.now() },
      generatedAt: ctx.store.now(),
      sources: [{ ref: "store:cases", observedAt: ctx.store.now(), hash: `cases:${rows.length}` }],
      cases: {
        opened: rows.length,
        resolvedVerified: resolved,
        autoClosed: 0,
        reopened: rows.filter((r) => r.state === "reopened").length,
        open: rows.filter((r) => !["resolved", "closed"].includes(r.state)).length,
      },
      responses: { substantiveFirstResponsesMinutes: [], automaticAcks: 0 },
      surveys: { responses: 0, csat: null, note: "sin encuestas recogidas" },
      cost: { amount: "0.00", currency: "EUR", measured: false },
    });
    return c.json({
      snapshot,
      p50FirstResponse: percentile([], 0.5),
      note: "Sin datos de primera respuesta: se declara, no se inventa",
    });
  });

  app.get("/v1/clientes/jobs/:id", (c) => {
    const actor = c.get("actor");
    requireCapability(actor, "cases.read");
    return c.json({ job: ctx.outbox.get(actor.tenantId, c.req.param("id")) });
  });

  app.get("/v1/clientes/integrations/:id/capabilities", (c) => {
    const actor = c.get("actor");
    requireCapability(actor, "integrations.read");
    const report = ctx.discovery.report(actor.tenantId, c.req.param("id"));
    if (!report) throw notFound("Sin capability report: ejecutar discovery");
    return c.json({ report, credentialsExposed: false });
  });

  // Webhooks: firma/binding propio, nunca JWT humano.
  app.post("/webhooks/:connectionId", async (c) => {
    const raw = await c.req.text();
    const event = ctx.webhooks.accept({
      tenantId: c.req.header("x-tenant-id") ?? "",
      connectionId: c.req.param("connectionId"),
      externalEventId: c.req.header("x-event-id") ?? "",
      timestampSeconds: Number(c.req.header("x-timestamp") ?? 0),
      signatureHex: c.req.header("x-signature") ?? "",
      contentType: c.req.header("content-type") ?? "",
      rawBody: raw,
    });
    ctx.store.webhooks.insert({
      id: `wh_${event.externalEventId}`,
      tenantId: event.tenantId,
      connectionId: event.connectionId,
      externalEventId: event.externalEventId,
      receivedAt: event.receivedAt,
      sourceHash: event.sourceHash,
    });
    return c.json({ accepted: true, sourceHash: event.sourceHash }, 202);
  });

  // Auditoría de desarrollo: sólo en entorno de test/desarrollo.
  app.post("/dev/seed", async (c) => {
    if (ctx.config.env === "production") throw forbidden("No disponible");
    seedContext(ctx);
    return c.json({ seeded: true, tenants: 2 });
  });

  app.post("/dev/token", async (c) => {
    assertDevTokensAllowed(ctx.config);
    const body = z
      .object({
        sub: z.string().min(3).max(200),
        tenantId: z.string().min(1).max(128).optional(),
        role: z.string().max(60).optional(),
      })
      .strict()
      .parse(await c.req.json());
    const token = mintDevToken({
      sub: body.sub,
      ...(body.tenantId ? { tenantId: body.tenantId } : {}),
      ...(body.role ? { role: body.role } : {}),
      issuer: ctx.config.supabase.issuer ?? "https://fixture.supabase.co/auth/v1",
      audience: ctx.config.supabase.audience,
      secret: process.env.SUPABASE_JWT_SECRET ?? "fixture-hmac-secret-not-a-real-credential",
    });
    return c.json({ token, kind: "development_only" });
  });

  app.notFound(() => {
    throw notFound();
  });

  app.onError((error, c) => {
    const serviceError = toServiceError(error);
    if (serviceError.status >= 500) {
      NonBlockingMetrics.guard(
        () =>
          ctx.logger.log("error", serviceError.message, {
            correlationId: c.get("correlationId"),
            tenantRef: c.get("tenantId") ?? null,
          }),
        undefined,
      );
    }
    return c.json(serviceError.toEnvelope(c.get("correlationId")), serviceError.status as 500);
  });

  return app;
}
