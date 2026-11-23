/**
 * CLI-C35 · Contrato del puente con el padre, extremo a extremo local.
 *
 * Levanta un servidor que implementa **el contrato** de `/agente` (no es
 * `/agente`) y ejercita `HttpHost`: principal, aprobación, tarea, evento
 * proyectado, rechazo 401 y fallo cerrado sin configuración.
 *
 * Lo que NO demuestra: que el padre real exista, acepte este token o tenga el
 * wiring. Por eso el estado global sigue `HOST_BRIDGE_NOT_VERIFIED`.
 *
 * Uso: npm run bridge:contract
 */
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { createServer as createNetServer } from "node:net";
import { HttpHost, type HostTransport } from "../src/bridge/http-host.ts";
import { ServiceError } from "../src/lib/errors.ts";

const TOKEN = "fixture-host-service-token-not-a-real-credential";
const TENANT = "tenant_alpha";

type Result = { name: string; ok: boolean; detail?: string };
const results: Result[] = [];
const check = (name: string, ok: boolean, detail?: string): void => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

function freePort(): Promise<number> {
  return new Promise((done, fail) => {
    const srv = createNetServer();
    srv.once("error", fail);
    srv.listen(0, "127.0.0.1", () => {
      const address = srv.address();
      const port = typeof address === "object" && address ? address.port : 0;
      srv.close(() => done(port));
    });
  });
}

interface Observed {
  path: string;
  authorization: string | null;
  idempotencyKey: string | null;
  body: string;
}

async function bodyOf(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk as Buffer));
  return Buffer.concat(chunks).toString("utf8");
}

function json(res: ServerResponse, status: number, payload: unknown): void {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(payload));
}

async function startStandIn(): Promise<{ server: Server; port: number; seen: Observed[] }> {
  const seen: Observed[] = [];
  const server = createServer(async (req, res) => {
    const body = await bodyOf(req);
    const observed: Observed = {
      path: req.url ?? "",
      authorization: req.headers.authorization ?? null,
      idempotencyKey: (req.headers["idempotency-key"] as string | undefined) ?? null,
      body,
    };
    seen.push(observed);
    const path = new URL(req.url ?? "/", "http://stand-in").pathname;

    if (observed.authorization !== `Bearer ${TOKEN}`) {
      json(res, 401, { error: "unauthorized" });
      return;
    }
    if (path === "/internal/host/principal") {
      const parsed = JSON.parse(body) as { subjectRef?: string };
      if (!parsed.subjectRef?.startsWith("sub_")) {
        json(res, 404, { error: "not_found" });
        return;
      }
      json(res, 200, { actorId: parsed.subjectRef, tenantId: TENANT });
      return;
    }
    if (path === "/internal/host/approvals") {
      json(res, 200, { approvalRef: "host_approval_fixture_1" });
      return;
    }
    if (path === "/internal/host/tasks") {
      json(res, 200, { taskId: "host_task_fixture_1" });
      return;
    }
    if (path === "/internal/host/events") {
      json(res, 200, { accepted: true });
      return;
    }
    json(res, 404, { error: "not_found" });
  });
  const port = await freePort();
  await new Promise<void>((done) => server.listen(port, "127.0.0.1", done));
  return { server, port, seen };
}

function isServiceError(error: unknown, code: string): boolean {
  return error instanceof ServiceError && error.code === code;
}

async function main(): Promise<void> {
  const standIn = await startStandIn();
  const baseUrl = `http://127.0.0.1:${standIn.port}`;

  try {
    const unconfigured = new HttpHost({ baseUrl: null, serviceToken: null });
    let unconfiguredError: unknown = null;
    try {
      await unconfigured.verifyPrincipal("sub_ana");
    } catch (error) {
      unconfiguredError = error;
    }
    check(
      "sin endpoint/token falla cerrado y NO hace ninguna petición",
      isServiceError(unconfiguredError, "not_configured") && standIn.seen.length === 0,
      `${standIn.seen.length} peticiones`,
    );

    const host = new HttpHost({ baseUrl, serviceToken: TOKEN });
    const principal = await host.verifyPrincipal("sub_ana");
    check(
      "verifyPrincipal devuelve actor y tenant del padre",
      principal?.actorId === "sub_ana" && principal.tenantId === TENANT,
      JSON.stringify(principal),
    );

    const principalMiss = await host.verifyPrincipal("ana");
    check("un principal desconocido no se inventa", principalMiss === null);

    const approval = await host.requestApproval({ proposalRef: "prop_1", payloadHash: "a".repeat(64) });
    const task = await host.recordTask({
      assignedBy: "user_agent_1",
      assignedTo: "user_reviewer_a",
      evidenceRefs: ["case:case_ana_1"],
    });
    check(
      "aprobación y tarea se registran con el contrato del padre",
      approval?.approvalRef === "host_approval_fixture_1" && task.taskId === "host_task_fixture_1",
      `${approval?.approvalRef} / ${task.taskId}`,
    );

    const calls = standIn.seen.filter((row) => row.path.startsWith("/internal/host/"));
    check(
      "el token viaja solo en Authorization, nunca en la URL",
      calls.length === 4 &&
        calls.every((row) => row.authorization === `Bearer ${TOKEN}`) &&
        calls.every((row) => !row.path.includes(TOKEN)),
      `${calls.length} llamadas`,
    );
    check(
      "cada POST lleva Idempotency-Key de 64 hex",
      calls.every((row) => row.path === "/internal/host/principal" || /^[0-9a-f]{64}$/u.test(row.idempotencyKey ?? "")),
    );

    const forbiddenHost = new HttpHost({ baseUrl, serviceToken: "token-rechazado" });
    let forbiddenError: unknown = null;
    try {
      await forbiddenHost.verifyPrincipal("sub_ana");
    } catch (error) {
      forbiddenError = error;
    }
    check("un 401 del padre se convierte en forbidden, sin filtrar el cuerpo", isServiceError(forbiddenError, "forbidden"));

    const failingTransport: HostTransport = {
      async send() {
        throw new Error(`fallo con ${baseUrl} y ${TOKEN}`);
      },
    };
    const failingHost = new HttpHost({ baseUrl, serviceToken: TOKEN, transport: failingTransport });
    let transportError: unknown = null;
    try {
      await failingHost.verifyPrincipal("sub_ana");
    } catch (error) {
      transportError = error;
    }
    check(
      "un fallo de transporte no propaga URL ni token en el mensaje",
      isServiceError(transportError, "unavailable") &&
        !String((transportError as Error).message).includes(TOKEN) &&
        !String((transportError as Error).message).includes(baseUrl),
      transportError instanceof Error ? transportError.message : "sin error",
    );

    const before = standIn.seen.length;
    const unmapped = await host.publish(
      {
        id: "evt_1",
        type: "clientes.message.delivered",
        tenantId: TENANT,
        actorRef: "user_agent_1",
        correlationId: "corr_1",
        causationId: null,
        occurredAt: "2026-11-23T10:00:00.000Z",
        refs: { caseId: "case_ana_1" },
      },
      { ownerRef: "tenant_alpha", sourceId: "agntia-clientes" },
    );
    check(
      "entregar un mensaje NO se proyecta a conversation.closed ni hace POST",
      unmapped === null && standIn.seen.length === before,
      `${standIn.seen.length - before} peticiones`,
    );

    const projected = await host.publish(
      {
        id: "evt_2",
        type: "clientes.handoff.required",
        tenantId: TENANT,
        actorRef: "user_agent_1",
        correlationId: "corr_2",
        causationId: "evt_1",
        occurredAt: "2026-11-23T10:01:00.000Z",
        refs: { caseId: "case_ana_1", reason: "customer_request" },
      },
      { ownerRef: "tenant_alpha", sourceId: "agntia-clientes", personaId: "persona_support" },
    );
    check(
      "handoff se proyecta a ticket.escalated con schemaVersion 1.0",
      projected?.event.type === "ticket.escalated" &&
        projected.event.schemaVersion === "1.0" &&
        projected.accepted === true,
      JSON.stringify(projected?.event.type),
    );

    const invalidJson: HostTransport = {
      async send() {
        return { status: 200, body: "no-json" };
      },
    };
    const invalidHost = new HttpHost({ baseUrl, serviceToken: TOKEN, transport: invalidJson });
    let invalidError: unknown = null;
    try {
      await invalidHost.verifyPrincipal("sub_ana");
    } catch (error) {
      invalidError = error;
    }
    check("respuesta no-JSON se declara upstream_invalid", isServiceError(invalidError, "upstream_invalid"));
  } finally {
    await new Promise<void>((done) => standIn.server.close(() => done()));
  }

  const failed = results.filter((row) => !row.ok);
  console.log(`\n${results.length - failed.length}/${results.length} garantías del contrato host verificadas`);
  console.log("estado del puente: HOST_BRIDGE_NOT_VERIFIED (el padre real no está en este entorno)");
  if (failed.length > 0) process.exitCode = 1;
}

await main();
