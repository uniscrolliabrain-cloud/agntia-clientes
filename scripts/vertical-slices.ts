/**
 * CLI-C06/C25/C26/C27/C29 · Vertical slices end-to-end.
 *
 * Activa dos cortes verticales sobre PostgreSQL real, sin proveedores externos:
 *
 *   VS1 · Atención: caso → propuesta con citas → preview → aprobación humana →
 *         intent idempotente → despacho sandbox → receipt → reconciliación a
 *         `delivered` → reporte.
 *   VS2 · Onboarding: plan versionado → documento con evidencia → aceptación
 *         humana → hito `done`.
 *
 * Lo que este arnés demuestra y lo que no:
 * - demuestra que ambos agregados sobreviven al reinicio del proceso del API y
 *   que el tenant B no ve nada del tenant A;
 * - NO demuestra entrega a un proveedor real: el despacho es `sandbox_only` y
 *   así se declara en la respuesta y en la evidencia.
 *
 * Uso: npm run slices
 */
import { execFileSync, spawn, type ChildProcess } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import pg from "pg";
import { PgStore } from "../src/storage/pg.ts";

const BIN = resolve("node_modules/@embedded-postgres/linux-x64/native/bin");
const LIB = resolve(BIN, "..", "lib");
const MIGRATIONS = resolve("src/storage/migrations");
const TENANT_A = "tenant_alpha";
const TENANT_B = "tenant_beta";
const OWNER_A = "user_owner_a";
const REVIEWER_A = "user_reviewer_a";
const OWNER_B = "user_owner_b";
const CASE_A = "case_case_ana_1";
const FIXTURE_SECRET = "fixture-hmac-secret-not-a-real-credential";
const ISSUER = "https://fixture.supabase.co/auth/v1";
const PLAN_STEP = "dpa_signed";

function run(bin: string, args: string[]): string {
  return execFileSync(join(BIN, bin), args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, LD_LIBRARY_PATH: `${LIB}:${process.env.LD_LIBRARY_PATH ?? ""}` },
  });
}

function freePort(): Promise<number> {
  return new Promise((done, fail) => {
    const srv = createServer();
    srv.once("error", fail);
    srv.listen(0, "127.0.0.1", () => {
      const address = srv.address();
      const port = typeof address === "object" && address ? address.port : 0;
      srv.close(() => done(port));
    });
  });
}

type Result = { name: string; ok: boolean; detail?: string };
const results: Result[] = [];

function check(name: string, ok: boolean, detail?: string): void {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

const sleep = (ms: number): Promise<void> => new Promise((done) => setTimeout(done, ms));

interface ApiHandle {
  child: ChildProcess;
  output: () => string;
}

async function startApi(port: number, databaseUrl: string): Promise<ApiHandle> {
  let output = "";
  const child = spawn(process.execPath, [resolve("src/server.ts")], {
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      PORT: String(port),
      DATABASE_URL: databaseUrl,
      NODE_ENV: "development",
      SUPABASE_ISSUER: ISSUER,
      SUPABASE_JWT_SECRET: FIXTURE_SECRET,
    },
  });
  child.stdout?.on("data", (chunk: Buffer) => {
    output += chunk.toString("utf8");
  });
  child.stderr?.on("data", (chunk: Buffer) => {
    output += chunk.toString("utf8");
  });

  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`el API terminó con ${child.exitCode} antes de responder:\n${output.slice(-1500)}`);
    }
    try {
      const response = await fetch(`http://127.0.0.1:${port}/healthz`);
      if (response.ok) {
        await response.arrayBuffer();
        return { child, output: () => output };
      }
    } catch {
      /* todavía no escucha */
    }
    await sleep(150);
  }
  child.kill("SIGKILL");
  throw new Error(`el API no respondió en 30s:\n${output.slice(-1500)}`);
}

async function stopApi(api: ApiHandle): Promise<void> {
  if (api.child.exitCode !== null) return;
  const exited = new Promise<void>((done) => api.child.once("exit", () => done()));
  api.child.kill("SIGTERM");
  const timedOut = await Promise.race([exited.then(() => false), sleep(8_000).then(() => true)]);
  if (timedOut) {
    api.child.kill("SIGKILL");
    await exited;
  }
}

interface ApiResponse {
  status: number;
  body: Record<string, unknown>;
}

async function api(
  port: number,
  path: string,
  init: { method?: string; token?: string; body?: unknown } = {},
): Promise<ApiResponse> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (init.token) headers.authorization = `Bearer ${init.token}`;
  const response = await fetch(`http://127.0.0.1:${port}${path}`, {
    method: init.method ?? "GET",
    headers,
    ...(init.body ? { body: JSON.stringify(init.body) } : {}),
  });
  const text = await response.text();
  return { status: response.status, body: text.length ? (JSON.parse(text) as Record<string, unknown>) : {} };
}

async function tokenFor(port: number, sub: string, tenantId: string): Promise<string> {
  const response = await api(port, "/dev/token", { method: "POST", body: { sub, tenantId } });
  const token = response.body.token;
  if (response.status !== 200 || typeof token !== "string") {
    throw new Error(`sin token de desarrollo: ${response.status} ${JSON.stringify(response.body)}`);
  }
  return token;
}

type Json = Record<string, unknown>;
const asJson = (value: unknown): Json => (value && typeof value === "object" ? (value as Json) : {});

async function main(): Promise<void> {
  const dataDir = mkdtempSync(join(tmpdir(), "cli06-slices-"));
  const socketDir = mkdtempSync(join(tmpdir(), "cli06-slices-sock-"));
  const dbPort = await freePort();
  const apiPort = await freePort();
  const logFile = join(dataDir, "postgres.log");
  const serverArgs = [
    "-p",
    String(dbPort),
    "-k",
    socketDir,
    "-c",
    "listen_addresses=127.0.0.1",
    "-c",
    "fsync=off",
    "-c",
    "full_page_writes=off",
  ];

  run("initdb", ["-D", dataDir, "-U", "postgres", "--auth=trust", "--encoding=UTF8", "--locale=C"]);
  run("pg_ctl", ["-D", dataDir, "-l", logFile, "-o", serverArgs.join(" "), "-w", "start"]);

  const admin = new pg.Client({ host: "127.0.0.1", port: dbPort, user: "postgres", database: "postgres" });
  admin.on("error", () => undefined);
  await admin.connect();
  const pool = new pg.Pool({ host: "127.0.0.1", port: dbPort, user: "app_login", database: "postgres", max: 3 });
  let handle: ApiHandle | null = null;
  let proposalId = "";
  let proposalBody = "";
  let intentId = "";
  let planId = "";

  try {
    for (const file of readdirSync(MIGRATIONS).filter((f) => f.endsWith(".sql")).sort()) {
      await admin.query(readFileSync(join(MIGRATIONS, file), "utf8"));
    }
    await admin.query(
      `insert into tenants (id, display_name) values ($1,'Tenant A'), ($2,'Tenant B')`,
      [TENANT_A, TENANT_B],
    );
    await admin.query(
      `do $$ begin
         if not exists (select 1 from pg_roles where rolname = 'app_login') then
           create role app_login login;
         end if;
       end $$`,
    );
    await admin.query("grant app_api to app_login");
    const databaseUrl = `postgres://app_login@127.0.0.1:${dbPort}/postgres`;

    // ── API #1: VS1 completa, VS2 hasta el documento ─────────────────────────
    handle = await startApi(apiPort, databaseUrl);
    const health = await api(apiPort, "/healthz");
    check(
      "healthz declara los agregados durables",
      health.status === 200 &&
        health.body.case_store === "postgres" &&
        health.body.proposal_store === "postgres" &&
        health.body.intent_store === "postgres" &&
        health.body.plan_store === "postgres",
      JSON.stringify(health.body),
    );

    const reviewer = await tokenFor(apiPort, REVIEWER_A, TENANT_A);
    const owner = await tokenFor(apiPort, OWNER_A, TENANT_A);

    const proposed = await api(apiPort, `/v1/clientes/cases/${CASE_A}/answer-proposals`, {
      token: reviewer,
      method: "POST",
      body: { locale: "es", question: "¿Cómo doy de alta un usuario?", acl: ["support"] },
    });
    const proposal = asJson(proposed.body.proposal);
    proposalId = typeof proposal.id === "string" ? proposal.id : "";
    proposalBody = typeof proposal.body === "string" ? proposal.body : "";
    const citations = Array.isArray(proposal.citations) ? proposal.citations : [];
    check(
      "VS1 · propuesta con cita de la versión vigente",
      proposed.status === 201 && proposalId !== "" && citations.length > 0 && proposalBody.length > 0,
      `${proposed.status} · ${citations.length} citas`,
    );

    const preview = await api(apiPort, "/v1/clientes/outbound-previews", {
      token: reviewer,
      method: "POST",
      body: {
        caseId: CASE_A,
        proposalId,
        recipientRef: "addr_ana_a",
        channel: "email",
        attachmentHashes: [],
      },
    });
    check(
      "VS1 · preview no produce efecto y exige aprobación",
      preview.status === 200 && preview.body.effect === "none" && preview.body.requiresApproval === true,
      JSON.stringify(preview.body),
    );

    const intentBody = {
      caseId: CASE_A,
      proposalId,
      recipientRef: "addr_ana_a",
      channel: "email",
      attachmentHashes: [],
      expectedVersion: 1,
      policyVersion: "policy_reply_v1",
    };
    const created = await api(apiPort, "/v1/clientes/outbound-intents", {
      token: owner,
      method: "POST",
      body: intentBody,
    });
    const intent = asJson(created.body.intent);
    intentId = typeof intent.id === "string" ? intent.id : "";
    check(
      "VS1 · aprobación humana crea intent waiting_approval",
      created.status === 201 && intent.state === "awaiting_approval" && intentId !== "",
      `${created.status} · ${String(intent.state)}`,
    );

    const replay = await api(apiPort, "/v1/clientes/outbound-intents", {
      token: owner,
      method: "POST",
      body: intentBody,
    });
    const replayIntent = asJson(replay.body.intent);
    check(
      "VS1 · el mismo envío es idempotente (un solo intent)",
      replay.status === 201 && replay.body.idempotentReplay === true && replayIntent.id === intentId,
      `${replay.status} · ${String(replayIntent.id)}`,
    );

    const dispatched = await api(apiPort, `/v1/clientes/outbound-intents/${intentId}/sandbox-dispatch`, {
      token: owner,
      method: "POST",
      body: {},
    });
    const acceptedIntent = asJson(dispatched.body.intent);
    const receipt = asJson(dispatched.body.receipt);
    check(
      "VS1 · despacho sandbox deja receipt y NO finge entrega",
      dispatched.status === 200 &&
        acceptedIntent.state === "accepted" &&
        receipt.kind === "sandbox" &&
        dispatched.body.effect === "sandbox_only",
      `${dispatched.status} · ${String(acceptedIntent.state)} · ${String(receipt.ref)}`,
    );

    const delivered = await api(apiPort, `/v1/clientes/outbound-intents/${intentId}/reconcile`, {
      token: owner,
      method: "POST",
      body: { remoteRef: String(receipt.ref ?? "sandbox:unknown"), delivered: true },
    });
    const deliveredIntent = asJson(delivered.body.intent);
    check(
      "VS1 · reconciliación con receipt marca delivered",
      delivered.status === 200 && deliveredIntent.state === "delivered",
      `${delivered.status} · ${String(deliveredIntent.state)}`,
    );

    // VS2 se inicia antes del reinicio: la aceptación posterior debe leer el
    // plan desde PostgreSQL, no desde la memoria del proceso.
    const planResponse = await api(apiPort, "/v1/clientes/onboarding/plans", {
      token: owner,
      method: "POST",
      body: { organizationRef: "org_acme_a", playbookId: "playbook_onboarding_v1", playbookVersion: 1 },
    });
    const plan = asJson(planResponse.body.plan);
    planId = typeof plan.id === "string" ? plan.id : "";
    check(
      "VS2 · plan de onboarding arranca en pending",
      planResponse.status === 201 && planId !== "" && Array.isArray(plan.stepState) && plan.version === 0,
      `${planResponse.status} · ${String(plan.version)}`,
    );

    const document = await api(apiPort, `/v1/clientes/onboarding/plans/${planId}/steps/${PLAN_STEP}/document`, {
      token: owner,
      method: "POST",
      body: { documentRef: "doc:dpa:acme:v1", evidenceRef: "evidence:dpa:acme:2026-11-11" },
    });
    const waitingPlan = asJson(document.body.plan);
    check(
      "VS2 · documento recibido queda waiting, no done",
      document.status === 200 && waitingPlan.version === 1,
      `${document.status} · ${String(waitingPlan.version)}`,
    );

    // ── Reinicio #1: la aceptación ocurre en otro proceso ───────────────────
    await stopApi(handle);
    handle = await startApi(apiPort, databaseUrl);
    check("el API se reinicia sobre la misma base", true);

    const ownerAfter = await tokenFor(apiPort, OWNER_A, TENANT_A);
    const reviewerAfter = await tokenFor(apiPort, REVIEWER_A, TENANT_A);

    const intentAfter = await api(apiPort, `/v1/clientes/outbound-intents/${intentId}`, { token: ownerAfter });
    const durableIntent = asJson(intentAfter.body.intent);
    check(
      "VS1 · el intent delivered y su receipt sobreviven al reinicio",
      intentAfter.status === 200 &&
        durableIntent.state === "delivered" &&
        Array.isArray(durableIntent.remoteRefs) &&
        (durableIntent.remoteRefs as string[]).some((ref) => ref.startsWith("sandbox:")),
      `${intentAfter.status} · ${JSON.stringify(durableIntent.remoteRefs)}`,
    );

    const proposalAfter = await api(apiPort, `/v1/clientes/answer-proposals/${proposalId}`, {
      token: reviewerAfter,
    });
    const durableProposal = asJson(proposalAfter.body.proposal);
    check(
      "VS1 · la propuesta aprobada se relee idéntica desde PostgreSQL",
      proposalAfter.status === 200 && durableProposal.body === proposalBody,
      `${proposalAfter.status} · ${typeof durableProposal.body === "string" ? `${durableProposal.body.length} chars` : "sin body"}`,
    );

    const planAfter = await api(apiPort, `/v1/clientes/onboarding/plans/${planId}`, { token: ownerAfter });
    const reloadedPlan = asJson(planAfter.body.plan);
    check(
      "VS2 · el plan se relee desde PostgreSQL antes de aceptar",
      planAfter.status === 200 && reloadedPlan.version === 1,
      `${planAfter.status} · ${String(reloadedPlan.version)}`,
    );

    const accepted = await api(apiPort, `/v1/clientes/onboarding/plans/${planId}/steps/${PLAN_STEP}/acceptance`, {
      token: ownerAfter,
      method: "POST",
      body: {},
    });
    const acceptedPlan = asJson(accepted.body.plan);
    const steps = Array.isArray(acceptedPlan.stepState) ? (acceptedPlan.stepState as Json[]) : [];
    const step = steps.find((row) => row.key === PLAN_STEP) ?? {};
    check(
      "VS2 · la aceptación humana deja evidencia y el hito done",
      accepted.status === 200 &&
        step.state === "done" &&
        step.acceptedBy === OWNER_A &&
        typeof step.evidenceRef === "string",
      `${accepted.status} · ${String(step.state)}`,
    );

    // ── Reinicio #2: comprobar ambos agregados y el aislamiento ─────────────
    await stopApi(handle);
    handle = await startApi(apiPort, databaseUrl);
    const ownerFinal = await tokenFor(apiPort, OWNER_A, TENANT_A);
    const ownerBFinal = await tokenFor(apiPort, OWNER_B, TENANT_B);

    const planFinal = await api(apiPort, `/v1/clientes/onboarding/plans/${planId}`, { token: ownerFinal });
    const finalPlan = asJson(planFinal.body.plan);
    const finalSteps = Array.isArray(finalPlan.stepState) ? (finalPlan.stepState as Json[]) : [];
    const finalStep = finalSteps.find((row) => row.key === PLAN_STEP) ?? {};
    check(
      "VS2 · el hito aceptado sigue done tras un segundo reinicio",
      planFinal.status === 200 && finalStep.state === "done",
      `${planFinal.status} · ${String(finalStep.state)}`,
    );

    const report = await api(apiPort, "/v1/clientes/reports", { token: ownerFinal });
    const snapshot = asJson(report.body.snapshot);
    const caseCounts = asJson(snapshot.cases);
    check(
      "VS1 · el reporte se calcula sobre casos durables",
      report.status === 200 && caseCounts.opened === 2,
      `${report.status} · opened=${String(caseCounts.opened)}`,
    );

    const foreignIntent = await api(apiPort, `/v1/clientes/outbound-intents/${intentId}`, { token: ownerBFinal });
    const foreignProposal = await api(apiPort, `/v1/clientes/answer-proposals/${proposalId}`, {
      token: ownerBFinal,
    });
    const foreignPlan = await api(apiPort, `/v1/clientes/onboarding/plans/${planId}`, { token: ownerBFinal });
    check(
      "aislamiento: el tenant B no ve intent, propuesta ni plan de A",
      foreignIntent.status === 404 && foreignProposal.status === 404 && foreignPlan.status === 404,
      `${foreignIntent.status}/${foreignProposal.status}/${foreignPlan.status}`,
    );

    const store = new PgStore(pool);
    const countsA = await store.withTenant(TENANT_A, async (tx) => ({
      proposals: (await tx.listProposalDocuments()).length,
      intents: (await tx.listIntentDocuments()).length,
      plans: (await tx.listPlanDocuments()).length,
    }));
    const countsB = await store.withTenant(TENANT_B, async (tx) => ({
      proposals: (await tx.listProposalDocuments()).length,
      intents: (await tx.listIntentDocuments()).length,
      plans: (await tx.listPlanDocuments()).length,
    }));
    check(
      "las filas existen en A y ninguna en B (RLS + tenant)",
      countsA.proposals === 1 && countsA.intents === 1 && countsA.plans === 1 &&
        countsB.proposals === 0 && countsB.intents === 0 && countsB.plans === 0,
      `A=${JSON.stringify(countsA)} B=${JSON.stringify(countsB)}`,
    );

    const client = await pool.connect();
    try {
      await client.query("begin");
      const noTenant = await client.query("select id from onboarding_plans");
      await client.query("commit");
      check(
        "fail-closed: sin app.tenant_id no se ve ningún plan",
        noTenant.rows.length === 0,
        `${noTenant.rows.length} filas`,
      );
    } finally {
      client.release();
    }

    // Evidencia de que el intent no saltó la FSM: un segundo despacho no es
    // posible desde `delivered`.
    const secondDispatch = await api(apiPort, `/v1/clientes/outbound-intents/${intentId}/sandbox-dispatch`, {
      token: ownerFinal,
      method: "POST",
      body: {},
    });
    check(
      "el intent delivered no se vuelve a despachar (FSM)",
      secondDispatch.status === 409,
      `${secondDispatch.status}`,
    );
  } finally {
    if (handle) await stopApi(handle).catch(() => undefined);
    await pool.end().catch(() => undefined);
    await admin.end().catch(() => undefined);
    try {
      run("pg_ctl", ["-D", dataDir, "-m", "immediate", "-w", "stop"]);
    } catch {
      /* ya parado */
    }
    rmSync(dataDir, { recursive: true, force: true });
    rmSync(socketDir, { recursive: true, force: true });
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} garantías de vertical slices verificadas`);
  if (failed.length > 0) process.exitCode = 1;
}

await main();
