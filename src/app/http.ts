import { Hono } from "hono";
import { z } from "zod";
import type { AppContext } from "./context.ts";
import { assertTenant, assertResourceAccess, requireCapability, resolveActor, type Actor } from "../auth/principal.ts";
import { ServiceError, forbidden, invalid, notFound, toServiceError } from "../lib/errors.ts";
import { CASE_STATES, transition, type CaseEvent } from "../domain/cases.ts";
import { proposeReply } from "../domain/proposals.ts";
import { buildApproval } from "../domain/approvals.ts";
import { computeDueAt, DEFAULT_SLA_POLICY } from "../domain/sla.ts";
import { buildReport, percentile } from "../reporting/reports.ts";
import { renderCasePage, renderPortalHome } from "./ui.ts";
import { seedContext } from "./context.ts";
import { mintDevToken, assertDevTokensAllowed } from "../auth/dev-token.ts";

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
    }),
  );

  // Portal HTML mínimo (sin datos si no hay sesión: la UI real usa Supabase).
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

  app.get("/v1/clientes/cases", (c) => {
    const actor = c.get("actor");
    requireCapability(actor, "cases.read");
    const rows = ctx.store.cases.list(actor.tenantId).map((row) => ({
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

  app.get("/v1/clientes/cases/:id", (c) => {
    const actor = c.get("actor");
    requireCapability(actor, "cases.read");
    const row = ctx.store.cases.get(actor.tenantId, c.req.param("id"));
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
    const row = ctx.store.cases.get(actor.tenantId, c.req.param("id"));
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
    ctx.store.cases.replace(actor.tenantId, result.case.id, result.case);
    ctx.store.appendAudit({
      id: `audit_${crypto.randomUUID()}`,
      tenantId: actor.tenantId,
      actorId: actor.id,
      capability: "cases.transition",
      operationId: c.get("correlationId"),
      correlationId: c.get("correlationId"),
      outcome: "applied",
      payloadRef: `case:${row.id}:${result.from}->${result.to}`,
    });
    ctx.metrics.increment("cases.transition", { tenant: actor.tenantId });
    return c.json({ case: result.case, transition: { from: result.from, to: result.to } });
  });

  app.post("/v1/clientes/cases/:id/answer-proposals", async (c) => {
    const actor = c.get("actor");
    requireCapability(actor, "reply.propose");
    const body = ProposalBody.parse(await c.req.json());
    const row = ctx.store.cases.get(actor.tenantId, c.req.param("id"));
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
    ctx.store.proposals.insert(proposal);
    return c.json({ proposal, effect: "none", note: "La propuesta no envía nada" }, 201);
  });

  app.post("/v1/clientes/outbound-previews", async (c) => {
    const actor = c.get("actor");
    requireCapability(actor, "reply.propose");
    const body = PreviewBody.parse(await c.req.json());
    const proposal = ctx.store.proposals.get(actor.tenantId, body.proposalId);
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
    const proposal = ctx.store.proposals.get(actor.tenantId, body.proposalId);
    if (!proposal) throw notFound();
    const caseDto = ctx.store.cases.get(actor.tenantId, body.caseId);
    if (!caseDto) throw notFound();
    const now = ctx.store.now();
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
    ctx.store.approvals.insert(approval);
    const intent = ctx.intents.create({
      tenantId: actor.tenantId,
      conversationRef: caseDto.conversationRefs[0] ?? "conv_unknown",
      contactRef: caseDto.contactId,
      channel: body.channel === "whatsapp" ? "whatsapp" : body.channel === "email" ? "email" : "chatwoot",
      payload: { body: proposal.body, recipientRef: body.recipientRef },
      proposalRef: proposal.id,
    });
    const awaiting = ctx.intents.attachApproval(actor.tenantId, intent.id, approval.id);
    ctx.store.intents.insert(awaiting);
    return c.json({ intent: awaiting, approval }, 201);
  });

  app.get("/v1/clientes/outbound-intents/:id", (c) => {
    const actor = c.get("actor");
    requireCapability(actor, "cases.read");
    const intent = ctx.intents.get(actor.tenantId, c.req.param("id"));
    return c.json({ intent });
  });

  app.post("/v1/clientes/outbound-intents/:id/reconcile", async (c) => {
    const actor = c.get("actor");
    requireCapability(actor, "cases.write");
    const body = z
      .object({ remoteRef: z.string().min(1).max(300), delivered: z.boolean() })
      .strict()
      .parse(await c.req.json());
    const workerReconcile = ctx.intents.get(actor.tenantId, c.req.param("id"));
    if (workerReconcile.state !== "outcome_unknown" && workerReconcile.state !== "reconciliation_required" && workerReconcile.state !== "accepted") {
      throw invalid("El intent no está en un estado reconciliable");
    }
    const next = body.delivered
      ? ctx.intents.transition(actor.tenantId, workerReconcile.id, "delivered", { remoteRefs: [body.remoteRef] })
      : ctx.intents.transition(actor.tenantId, workerReconcile.id, "accepted", { remoteRefs: [body.remoteRef] });
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

  app.get("/v1/clientes/reports", (c) => {
    const actor = c.get("actor");
    requireCapability(actor, "reports.read");
    const rows = ctx.store.cases.list(actor.tenantId);
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
      ctx.logger.log("error", serviceError.message, {
        correlationId: c.get("correlationId"),
        tenantRef: c.get("tenantId") ?? null,
      });
    }
    return c.json(serviceError.toEnvelope(c.get("correlationId")), serviceError.status as 500);
  });

  return app;
}
