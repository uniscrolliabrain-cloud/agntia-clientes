/**
 * CLI-C06 · Persistencia real entre reinicios.
 *
 * `npm run db:verify` prueba RLS y `PgStore` dentro de un solo proceso. Esto
 * prueba lo que aquel no podía: que lo escrito sobrevive a que el proceso
 * termine y a que PostgreSQL se reinicie, y que idempotencia y aislamiento
 * siguen valiendo después.
 *
 * Secuencia:
 *   1. PostgreSQL efímero (binarios embebidos, sin Docker ni root) + migraciones.
 *   2. Proceso hijo `writer` escribe como rol `app_login` (no owner) y termina.
 *   3. Se para PostgreSQL con `-m fast` y se vuelve a arrancar sobre el mismo
 *      data dir.
 *   4. Proceso hijo `reader`, nuevo pool y nueva conexión, comprueba las filas,
 *      el claim idempotente y el aislamiento.
 *
 * Uso: npm run db:persistence
 * Salida: una línea PASS/FAIL por garantía y código 1 si algo falla.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { PgStore } from "../src/storage/pg.ts";

const SELF = fileURLToPath(import.meta.url);
const BIN = resolve("node_modules/@embedded-postgres/linux-x64/native/bin");
const LIB = resolve(BIN, "..", "lib");
const MIGRATIONS = resolve("src/storage/migrations");
const TENANT_A = "tn_a";
const TENANT_B = "tn_b";
const CASE_ID = "case_persist";
const CONTACT_ID = "ct_persist";
const AUDIT_ID = "al_persist";
const OPERATION_KEY = "op-persist-1";

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

function poolFor(port: number): pg.Pool {
  return new pg.Pool({ host: "127.0.0.1", port, user: "app_login", database: "postgres", max: 2 });
}

interface WriterReport {
  phase: "writer";
  currentUser: string;
  superuser: boolean;
  claimCreated: boolean;
}

interface ReaderReport {
  phase: "reader";
  currentUser: string;
  caseRow: { id: string; state: string; priority: string; contact_id: string } | null;
  contactRow: { id: string; display_name: string } | null;
  ownCaseCount: number;
  auditRows: { id: string; outcome: string }[];
  replayCreated: boolean;
  foreignCase: unknown;
  foreignCaseCount: number;
  noTenantRows: number;
}

async function currentUser(pool: pg.Pool): Promise<{ user: string; superuser: boolean }> {
  const out = await pool.query<{ user: string; superuser: boolean }>(
    `select current_user as user, (select rolsuper from pg_roles where rolname = current_user) as superuser`,
  );
  const row = out.rows[0];
  if (!row) throw new Error("sin fila de current_user");
  return row;
}

async function writePhase(port: number): Promise<void> {
  const pool = poolFor(port);
  const store = new PgStore(pool);
  try {
    const who = await currentUser(pool);
    if (who.superuser) throw new Error("el writer no puede ser superusuario: RLS no aplicaría");
    const claim = await store.withTenant(TENANT_A, async (tx) => {
      await tx.insertContact({ id: CONTACT_ID, displayName: "Contacto persistente" });
      await tx.insertCase({
        id: CASE_ID,
        contactId: CONTACT_ID,
        category: "billing",
        priority: "high",
        state: "open",
        slaPolicyId: "sla-1",
        slaPolicyVersion: "1",
        resolutionContract: { kind: "informational" },
      });
      await tx.appendAudit({
        id: AUDIT_ID,
        actorId: "u_owner_a",
        capability: "case.create",
        operationId: "op-persist",
        correlationId: "corr-persist",
        outcome: "allow",
        payloadRef: `case:${CASE_ID}`,
      });
      return tx.claimOutboundIntent({
        id: "oi_persist",
        operationKey: OPERATION_KEY,
        conversationRef: "conv-persist",
        contactRef: CONTACT_ID,
        channel: "email",
        payloadHash: "h-persist",
        proposalRef: "p-persist",
      });
    });
    const report: WriterReport = {
      phase: "writer",
      currentUser: who.user,
      superuser: who.superuser,
      claimCreated: claim.created,
    };
    console.log(`RESULT ${JSON.stringify(report)}`);
  } finally {
    await pool.end();
  }
}

async function readPhase(port: number): Promise<void> {
  const pool = poolFor(port);
  const store = new PgStore(pool);
  try {
    const who = await currentUser(pool);

    const caseRow = await store.withTenant(TENANT_A, (tx) => tx.getCase(CASE_ID));
    const contactRow = await store.withTenant(TENANT_A, (tx) => tx.getContact(CONTACT_ID));
    const ownCases = await store.withTenant(TENANT_A, (tx) => tx.listCases(50));
    const audit = await store.withTenant(TENANT_A, (tx) => tx.listAuditByPayloadRef(`case:${CASE_ID}`));
    const replay = await store.withTenant(TENANT_A, (tx) =>
      tx.claimOutboundIntent({
        id: "oi_persist_replay",
        operationKey: OPERATION_KEY,
        conversationRef: "conv-persist",
        contactRef: CONTACT_ID,
        channel: "email",
        payloadHash: "h-persist",
        proposalRef: "p-persist",
      }),
    );
    const foreignCase = await store.withTenant(TENANT_B, (tx) => tx.getCase(CASE_ID));
    const foreignCases = await store.withTenant(TENANT_B, (tx) => tx.listCases(50));

    // Sin `app.tenant_id` la política no deja ver nada: fail-closed tras reinicio.
    const client = await pool.connect();
    let noTenantRows = -1;
    try {
      await client.query("begin");
      const out = await client.query("select id from cases");
      noTenantRows = out.rows.length;
      await client.query("commit");
    } finally {
      client.release();
    }

    const report: ReaderReport = {
      phase: "reader",
      currentUser: who.user,
      caseRow,
      contactRow,
      ownCaseCount: ownCases.length,
      auditRows: audit,
      replayCreated: replay.created,
      foreignCase,
      foreignCaseCount: foreignCases.length,
      noTenantRows,
    };
    console.log(`RESULT ${JSON.stringify(report)}`);
  } finally {
    await pool.end();
  }
}

function parseResult<T>(stdout: string): T {
  const line = stdout
    .split("\n")
    .reverse()
    .find((row) => row.startsWith("RESULT "));
  if (!line) throw new Error(`sin línea RESULT: ${stdout.slice(0, 400)}`);
  return JSON.parse(line.slice("RESULT ".length)) as T;
}

function child(phase: "writer" | "reader", port: number): string {
  return execFileSync(process.execPath, [SELF, "--phase", phase], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, PERSISTENCE_PORT: String(port) },
    timeout: 120_000,
  });
}

type Result = { name: string; ok: boolean; detail?: string };
const results: Result[] = [];

function check(name: string, ok: boolean, detail?: string): void {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function main(): Promise<void> {
  const dataDir = mkdtempSync(join(tmpdir(), "cli06-persist-"));
  const socketDir = mkdtempSync(join(tmpdir(), "cli06-persist-sock-"));
  const port = await freePort();
  const logFile = join(dataDir, "postgres.log");
  const serverArgs = [
    "-p",
    String(port),
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

  const admin = new pg.Client({ host: "127.0.0.1", port, user: "postgres", database: "postgres" });
  // El reinicio de PostgreSQL corta las conexiones: sin listener, el evento
  // `error` del cliente tumba el proceso del arnés.
  admin.on("error", () => undefined);
  await admin.connect();

  try {
    const files = readdirSync(MIGRATIONS).filter((f) => f.endsWith(".sql")).sort();
    for (const file of files) await admin.query(readFileSync(join(MIGRATIONS, file), "utf8"));

    await admin.query(
      `insert into tenants (id, display_name) values ($1,'Tenant A'), ($2,'Tenant B')`,
      [TENANT_A, TENANT_B],
    );
    for (const tenant of [TENANT_A, TENANT_B]) {
      await admin.query(`insert into contacts (tenant_id, id, display_name) values ($1,$2,$3)`, [
        tenant,
        `ct_${tenant}`,
        `Contacto ${tenant}`,
      ]);
    }
    await admin.query(
      `do $$ begin
         if not exists (select 1 from pg_roles where rolname = 'app_login') then
           create role app_login login;
         end if;
       end $$`,
    );
    await admin.query("grant app_api to app_login");

    // Se cierra antes de parar el servidor: el reinicio debe ser limpio.
    await admin.end();

    const writer = parseResult<WriterReport>(child("writer", port));
    check(
      "escritura en proceso aparte como rol no-owner",
      writer.currentUser === "app_login" && !writer.superuser,
      `${writer.currentUser}, superuser=${writer.superuser}`,
    );
    check("el claim inicial devuelve created=true", writer.claimCreated === true, String(writer.claimCreated));

    // Reinicio real del servidor sobre el mismo data dir.
    run("pg_ctl", ["-D", dataDir, "-m", "fast", "-w", "stop"]);
    run("pg_ctl", ["-D", dataDir, "-l", logFile, "-o", serverArgs.join(" "), "-w", "start"]);
    check("PostgreSQL detenido y arrancado sobre el mismo data dir", true);

    const reader = parseResult<ReaderReport>(child("reader", port));
    check(
      "el caso sobrevive al fin del proceso y al reinicio",
      reader.caseRow?.id === CASE_ID &&
        reader.caseRow.state === "open" &&
        reader.caseRow.priority === "high" &&
        reader.caseRow.contact_id === CONTACT_ID,
      JSON.stringify(reader.caseRow),
    );
    check(
      "el contacto sobrevive y conserva su nombre",
      reader.contactRow?.id === CONTACT_ID && reader.contactRow.display_name === "Contacto persistente",
      JSON.stringify(reader.contactRow),
    );
    check("listado del tenant A contiene el caso", reader.ownCaseCount === 1, `${reader.ownCaseCount} filas`);
    check(
      "auditoría append-only conserva la fila tras el reinicio",
      reader.auditRows.length === 1 &&
        reader.auditRows[0]?.id === AUDIT_ID &&
        reader.auditRows[0]?.outcome === "allow",
      JSON.stringify(reader.auditRows),
    );
    check(
      "idempotencia durable: el claim repetido devuelve created=false",
      reader.replayCreated === false,
      String(reader.replayCreated),
    );
    check(
      "aislamiento intacto tras reinicio: B no ve el caso de A",
      reader.foreignCase === null && reader.foreignCaseCount === 0,
      `${JSON.stringify(reader.foreignCase)} / ${reader.foreignCaseCount} filas`,
    );
    check(
      "fail-closed sin app.tenant_id tras reinicio",
      reader.noTenantRows === 0,
      `${reader.noTenantRows} filas`,
    );
  } finally {
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
  console.log(`\n${results.length - failed.length}/${results.length} garantías de persistencia verificadas`);
  if (failed.length > 0) process.exitCode = 1;
}

const phaseArgIndex = process.argv.indexOf("--phase");
if (phaseArgIndex !== -1) {
  const phase = process.argv[phaseArgIndex + 1];
  const port = Number(process.env.PERSISTENCE_PORT);
  if (!Number.isInteger(port) || port <= 0) throw new Error("PERSISTENCE_PORT inválido");
  if (phase === "writer") await writePhase(port);
  else if (phase === "reader") await readPhase(port);
  else throw new Error(`fase desconocida: ${String(phase)}`);
} else {
  await main();
}

