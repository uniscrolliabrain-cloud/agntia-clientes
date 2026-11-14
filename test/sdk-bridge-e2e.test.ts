import { test } from "node:test";
import assert from "node:assert/strict";
import { isAllowedRoute, ALLOWED_ROUTES } from "../src/sdk/client.ts";
import { createProxy } from "../src/sdk/proxy.ts";
import { createAgentTools, FORBIDDEN_TOOL_NAMES } from "../src/tools/agent-tools.ts";
import { ClientesClient } from "../src/sdk/client.ts";
import { FakeHost, HostEventInbox, HOST_BRIDGE_STATUS, projectToNative, type DomainEvent } from "../src/bridge/host.ts";
import { runE2E } from "../src/eval/e2e.ts";
import { judgeLanguage, judgeTrajectory } from "../src/eval/judge.ts";

test("C34: allowlist de rutas es exacta y no por prefijo", () => {
  assert.equal(isAllowedRoute("GET", "/v1/clientes/cases"), true);
  assert.equal(isAllowedRoute("GET", "/v1/clientes/cases/case_1"), true);
  assert.equal(isAllowedRoute("POST", "/v1/clientes/approve"), false);
  assert.equal(isAllowedRoute("GET", "/v1/clientes/cases/../admin"), false);
  assert.equal(isAllowedRoute("DELETE", "/v1/clientes/cases/case_1"), false);
  assert.ok(ALLOWED_ROUTES.length >= 10);
});

test("C34: proxy rechaza método, URL absoluta y ruta no listada", async () => {
  const proxy = createProxy({
    upstreamBaseUrl: "https://internal.example.com",
    serviceToken: async () => "service-token",
    fetchImpl: async () => new Response(JSON.stringify({ ok: true }), { status: 200 }),
  });
  const forbiddenMethod = await proxy.fetch(
    new Request("http://localhost/proxy/v1/clientes/cases", { method: "DELETE" }),
  );
  assert.equal(forbiddenMethod.status, 403);
  const absolute = await proxy.fetch(
    new Request("http://localhost/proxy/v1/clientes/cases?url=https://evil.example.com"),
  );
  assert.equal(absolute.status, 403);
  const unknown = await proxy.fetch(new Request("http://localhost/proxy/v1/admin/users"));
  assert.equal(unknown.status, 403);
  const allowed = await proxy.fetch(new Request("http://localhost/proxy/v1/clientes/cases"));
  assert.equal(allowed.status, 200);
});

test("C34: las tools no incluyen aprobar, enviar, refund ni export_all", () => {
  const client = new ClientesClient({ baseUrl: "https://api.example.com", token: () => "t" });
  const names = createAgentTools(client).map((tool) => tool.name);
  for (const forbidden of FORBIDDEN_TOOL_NAMES) {
    assert.equal(names.some((name) => name === forbidden || name.endsWith(`_${forbidden}`)), false);
  }
  assert.ok(names.includes("clientes_answer_propose"));
  assert.ok(names.includes("clientes_knowledge_search"));
});

test("C35: eventos se proyectan sin inventar enums ni resolución", () => {
  assert.equal(HOST_BRIDGE_STATUS, "HOST_BRIDGE_NOT_VERIFIED");
  const event: DomainEvent = {
    id: "evt_1",
    type: "clientes.case.changed",
    tenantId: "tenant_alpha",
    actorRef: "agent_x",
    correlationId: "corr_1",
    causationId: null,
    occurredAt: "2026-11-11T09:00:00.000Z",
    refs: { caseId: "case_1" },
  };
  // Sin assignedTo no hay ticket.assigned; el hecho no se inventa.
  assert.equal(projectToNative(event, { ownerRef: "owner_1", sourceId: "service_clientes" }), null);
  const assigned = projectToNative(
    { ...event, refs: { assignedTo: "human_1" } },
    { ownerRef: "owner_1", sourceId: "service_clientes" },
  );
  assert.equal(assigned?.schemaVersion, "1.0");
  assert.equal(assigned?.type, "ticket.assigned");
  // Entregar un mensaje no cierra la conversación.
  const delivered: DomainEvent = { ...event, type: "clientes.message.delivered", refs: { delivered: "true" } };
  assert.equal(projectToNative(delivered, { ownerRef: "o", sourceId: "s" }), null);
  // Handoff sí tiene equivalente nativo.
  const escalated = projectToNative({ ...event, type: "clientes.handoff.required" }, { ownerRef: "o", sourceId: "s" });
  assert.equal(escalated?.type, "ticket.escalated");
  // Resolución solo con evidencia verificada.
  const resolved = projectToNative(
    { ...event, refs: { verifiedResolution: "true" } },
    { ownerRef: "o", sourceId: "s" },
  );
  assert.equal(resolved?.type, "ticket.resolved");
});

test("C35: inbox del host deduplica replay y valida schemaVersion", () => {
  const inbox = new HostEventInbox();
  const native = projectToNative(
    {
      id: "evt_2",
      type: "clientes.case.changed",
      tenantId: "tenant_alpha",
      actorRef: "agent_x",
      correlationId: "c",
      causationId: null,
      occurredAt: "2026-11-11T09:00:00.000Z",
      refs: { assignedTo: "human_1" },
    },
    { ownerRef: "o", sourceId: "s" },
  )!;
  inbox.accept(native);
  inbox.accept(native);
  assert.equal(inbox.seenCount(), 1);
  assert.throws(() => inbox.accept({ ...native, schemaVersion: 1 as unknown as "1.0" }));
});

test("C35: host fake registra aprobaciones y tareas sin tocar el padre", async () => {
  const host = new FakeHost();
  const principal = await host.verifyPrincipal("sub_123");
  assert.equal(principal?.actorId, "sub_123");
  assert.equal(await host.verifyPrincipal("otro"), null);
  const approval = await host.requestApproval({ proposalRef: "p1", payloadHash: "a".repeat(64) });
  assert.ok(approval.approvalRef.startsWith("host_approval_"));
  const task = await host.recordTask({ assignedBy: "a", assignedTo: "b", evidenceRefs: ["e"] });
  assert.equal(task.taskId, "host_task_1");
});

test("C40: juez detecta promesas de efecto y fugas", () => {
  assert.equal(judgeLanguage("Hemos reembolsado el importe.", "es").ok, false);
  assert.equal(judgeLanguage("Aquí tienes el procedimiento vigente.", "es").ok, true);
  assert.equal(judgeLanguage("token eyJhbGciOiJIUzI1NiJ9", "es").ok, false);
  assert.equal(judgeTrajectory(["reply.propose", "refund"], ["reply.propose"]).ok, false);
});

test("C40: E2E A–I ejecutado pasa las nueve trayectorias", async () => {
  const result = await runE2E();
  assert.equal(result.scenarios.length, 9);
  const failed = result.scenarios.filter((scenario) => scenario.status !== "PASS");
  assert.deepEqual(
    failed.map((scenario) => `${scenario.id}:${scenario.status}`),
    [],
  );
});
