/**
 * CLI-C06 · Durabilidad a través del API HTTP.
 *
 * `db:verify` prueba RLS y SQL; `db:persistence` prueba `PgStore` entre
 * procesos. Esto prueba la superficie que el cliente realmente usa: el API
 * sirviendo casos desde PostgreSQL, con reinicio del proceso del API en medio.
 *
 * Secuencia:
 *   1. PostgreSQL efímero + migraciones + tenants, sin casos ni contactos.
 *   2. API #1 con `DATABASE_URL`, arranca como rol `app_login` (no owner), siembra
 *      fixtures en la base y atiende una transición FSM real por HTTP.
 *   3. Se para el API con SIGTERM y se arranca otro proceso sobre la misma base.
 *   4. API #2 debe devolver el caso en el estado y la versión posteriores, sin
 *      volver a sembrar, con auditoría durable y aislamiento A/B intacto.
 *
 * Uso: npm run db:http
 * Salida: una línea PASS/FAIL por garantía y código 1 si algo falla.
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
const OWNER_B = "user_owner_b";
const CASE_A = "case_case_ana_1";
const AUDIT_REF = `case:${CASE_A}:in_progress->waiting_internal`;
const FIXTURE_SECRET = "fixture-hmac-secret-not-a-real-credential";
const ISSUER = "https://fixture.supabase.co/auth/v1";

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
      throw new Error(`el API terminó con ${child.exitCode} antes de responder:\n${output.slice(-1200)}`);
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
  throw new Error(`el API no respondió en 30s:\n${output.slice(-1200)}`);
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

async function main(): Promise<void> {
  const dataDir = mkdtempSync(join(tmpdir(), "cli06-http-"));
  const socketDir = mkdtempSync(join(tmpdir(), "cli06-http-sock-"));
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
  let first: ApiHandle | null = null;
  let second: ApiHandle | null = null;
  const pool = new pg.Pool({
    host: "127.0.0.1",
    port: dbPort,
    user: "app_login",
    database: "postgres",
    max: 2,
  });

  try {
    for (const file of readdirSync(MIGRATIONS).filter((f) => f.endsWith(".sql")).sort()) {
      await admin.query(readFileSync(join(MIGRATIONS, file), "utf8"));
    }
    await admin.query(
      `insert into tenants (id, display_name) values ($1,'Tenant A'), ($2,'Tenant B')`,
      [TENANT_A, TENANT_B],
    );
    // Solo tenants: los contactos y casos los escribe el API al sembrar. Si la
    // semilla no pasara por PostgreSQL, el arranque fallaría por la FK compuesta.
    await admin.query(
      `do $$ begin
         if not exists (select 1 from pg_roles where rolname = 'app_login') then
           create role app_login login;
         end if;
       end $$`,
    );
    await admin.query("grant app_api to app_login");

    const databaseUrl = `postgres://app_login@127.0.0.1:${dbPort}/postgres`;

    // ── API #1: arranque con semilla durable y transición real por HTTP ──────
    first = await startApi(apiPort, databaseUrl);
    const health = await api(apiPort, "/healthz");
    check(
      "el API sirve casos desde PostgreSQL (no memoria)",
      health.status === 200 && health.body.case_store === "postgres",
      JSON.stringify(health.body),
    );
    check(
      "healthz no expone la cadena de conexión",
      !JSON.stringify(health.body).includes("app_login"),
      JSON.stringify(health.body),
    );

    const tokenA = await tokenFor(apiPort, OWNER_A, TENANT_A);
    const tokenB = await tokenFor(apiPort, OWNER_B, TENANT_B);

    check(
      "sin token, /v1 responde 401 (JWT sigue siendo obligatorio)",
      (await api(apiPort, "/v1/clientes/cases")).status === 401,
    );

    const listBefore = await api(apiPort, "/v1/clientes/cases", { token: tokenA });
    const itemsBefore = listBefore.body.items as Array<{ id: string }> | undefined;
    check(
      "la semilla escribió los casos de fixture en PostgreSQL",
      listBefore.status === 200 && itemsBefore?.length === 2,
      `${listBefore.status} / ${itemsBefore?.length ?? "sin items"} filas`,
    );

    const detailBefore = await api(apiPort, `/v1/clientes/cases/${CASE_A}`, { token: tokenA });
    const caseBefore = detailBefore.body.case as { state?: string; version?: number } | undefined;
    check(
      "el caso se lee con su estado y versión de fixture",
      detailBefore.status === 200 && caseBefore?.state === "in_progress" && caseBefore.version === 1,
      JSON.stringify(caseBefore),
    );

    const moved = await api(apiPort, `/v1/clientes/cases/${CASE_A}/transitions`, {
      token: tokenA,
      method: "POST",
      body: { event: "wait_internal", expectedVersion: 1 },
    });
    const movedCase = moved.body.case as { state?: string; version?: number } | undefined;
    check(
      "transición FSM aplicada por HTTP y persistida",
      moved.status === 200 && movedCase?.state === "waiting_internal" && movedCase.version === 2,
      `${moved.status} ${JSON.stringify(movedCase)}`,
    );

    check(
      "CAS: repetir con expectedVersion obsoleto devuelve 409",
      (
        await api(apiPort, `/v1/clientes/cases/${CASE_A}/transitions`, {
          token: tokenA,
          method: "POST",
          body: { event: "wait_internal", expectedVersion: 1 },
        })
      ).status === 409,
    );

    // ── Reinicio del proceso del API sobre la misma base ────────────────────
    await stopApi(first);
    first = null;
    second = await startApi(apiPort, databaseUrl);
    check("el API se reinicia sobre la misma base de datos", true);

    const detailAfter = await api(apiPort, `/v1/clientes/cases/${CASE_A}`, { token: tokenA });
    const caseAfter = detailAfter.body.case as { state?: string; version?: number } | undefined;
    check(
      "el estado y la versión sobreviven al reinicio del API",
      detailAfter.status === 200 && caseAfter?.state === "waiting_internal" && caseAfter.version === 2,
      JSON.stringify(caseAfter),
    );

    const listAfter = await api(apiPort, "/v1/clientes/cases", { token: tokenA });
    const itemsAfter = listAfter.body.items as Array<{ id: string }> | undefined;
    check(
      "el reinicio no vuelve a sembrar ni resetea versiones",
      itemsAfter?.length === 2,
      `${itemsAfter?.length ?? "sin items"} filas`,
    );

    const store = new PgStore(pool);
    const audit = await store.withTenant(TENANT_A, (tx) => tx.listAuditByPayloadRef(AUDIT_REF));
    check(
      "la auditoría de la transición es durable en audit_log",
      audit.length === 1 && audit[0]?.outcome === "applied",
      JSON.stringify(audit),
    );

    const foreign = await api(apiPort, `/v1/clientes/cases/${CASE_A}`, { token: tokenB });
    const bList = await api(apiPort, "/v1/clientes/cases", { token: tokenB });
    const bItems = bList.body.items as Array<{ id: string }> | undefined;
    check(
      "aislamiento tras reinicio: B no ve el caso de A",
      foreign.status === 404 && bItems?.length === 1,
      `${foreign.status} / ${bItems?.length ?? "sin items"} filas`,
    );

    // Sin `app.tenant_id` la política no deja ver nada, aunque el caso exista.
    const client = await pool.connect();
    try {
      await client.query("begin");
      const noTenant = await client.query("select id from cases");
      await client.query("commit");
      check("fail-closed sin app.tenant_id en el pool del API", noTenant.rows.length === 0, `${noTenant.rows.length} filas`);
    } finally {
      client.release();
    }
  } finally {
    for (const apiHandle of [first, second]) {
      if (apiHandle) await stopApi(apiHandle).catch(() => undefined);
    }
    await pool.end().catch(() => undefined);
    await admin.end().catch(() => undefined);
    try {
      run("pg_ctl", ["-D", dataDir, "-m", "immediate", "-w", "stop"]);
    } catch {
      /* el proceso ya puede estar parado */
    }
    rmSync(dataDir, { recursive: true, force: true });
    rmSync(socketDir, { recursive: true, force: true });
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} garantías HTTP durables verificadas`);
  if (failed.length > 0) process.exitCode = 1;
}

await main();
