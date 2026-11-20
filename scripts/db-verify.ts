/**
 * CLI-C06 · Verificación real de migraciones y RLS.
 *
 * Levanta un PostgreSQL efímero (binarios de `@embedded-postgres/linux-x64`,
 * sin Docker ni root), aplica `src/storage/migrations/*.sql` en orden y ejerce
 * el aislamiento por tenant como rol `app_api` (no como owner, que en Postgres
 * se salta RLS).
 *
 * Uso: npm run db:verify
 * Salida: una línea PASS/FAIL por garantía y código 1 si algo falla.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import pg from "pg";
import { PgStore } from "../src/storage/pg.ts";

const BIN = resolve("node_modules/@embedded-postgres/linux-x64/native/bin");
const MIGRATIONS = resolve("src/storage/migrations");
const TENANT_A = "tn_a";
const TENANT_B = "tn_b";

type Result = { name: string; ok: boolean; detail?: string };
const results: Result[] = [];

function check(name: string, ok: boolean, detail?: string): void {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
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

/** Los binarios traen sus propias libs (libssl1.1, icu60): se apunta ahí para no depender del runner. */
const LIB = resolve(BIN, "..", "lib");

function run(bin: string, args: string[]): string {
  return execFileSync(join(BIN, bin), args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, LD_LIBRARY_PATH: `${LIB}:${process.env.LD_LIBRARY_PATH ?? ""}` },
  });
}

/** Espera un error con un SQLSTATE concreto; devuelve el código observado. */
async function expectError(fn: () => Promise<unknown>): Promise<string> {
  try {
    await fn();
    return "sin_error";
  } catch (error) {
    const code = (error as { code?: string }).code;
    return code ?? `error:${(error as Error).message}`;
  }
}

async function main(): Promise<void> {
  const dataDir = mkdtempSync(join(tmpdir(), "cli06-pg-"));
  const socketDir = mkdtempSync(join(tmpdir(), "cli06-sock-"));
  const port = await freePort();
  const logFile = join(dataDir, "postgres.log");

  run("initdb", ["-D", dataDir, "-U", "postgres", "--auth=trust", "--encoding=UTF8", "--locale=C"]);
  run("pg_ctl", [
    "-D",
    dataDir,
    "-l",
    logFile,
    "-o",
    `-p ${port} -k ${socketDir} -c listen_addresses=127.0.0.1 -c fsync=off -c full_page_writes=off`,
    "-w",
    "start",
  ]);

  const admin = new pg.Client({ host: "127.0.0.1", port, user: "postgres", database: "postgres" });
  await admin.connect();

  try {
    // 1. Migraciones en orden, dos veces: deben ser idempotentes.
    const files = readdirSync(MIGRATIONS).filter((f) => f.endsWith(".sql")).sort();
    for (const file of files) {
      await admin.query(readFileSync(join(MIGRATIONS, file), "utf8"));
    }
    check(`migraciones aplicadas (${files.length})`, files.length >= 3, files.join(", "));

    let replayError = "";
    try {
      for (const file of files) {
        await admin.query(readFileSync(join(MIGRATIONS, file), "utf8"));
      }
    } catch (error) {
      replayError = (error as Error).message;
    }
    check("migraciones idempotentes (replay sin error)", replayError === "", replayError);

    // 2. Datos base de dos tenants, escritos por el owner.
    await admin.query(
      `insert into tenants (id, display_name) values ($1,'Tenant A'), ($2,'Tenant B')
       on conflict (id) do nothing`,
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
      `insert into cases (tenant_id, id, contact_id, category, priority, state, sla_policy_id,
         sla_policy_version, resolution_contract)
       values ($1,'case_a',$2,'billing','normal','open','sla-1','1','{}'),
              ($3,'case_b',$4,'billing','normal','open','sla-1','1','{}')`,
      [TENANT_A, `ct_${TENANT_A}`, TENANT_B, `ct_${TENANT_B}`],
    );
    await admin.query(
      `insert into outbound_intents (tenant_id, id, operation_key, conversation_ref, contact_ref,
         channel, payload_hash, proposal_ref, state)
       values ($1,'oi_a','op-1','conv','ct','email','h','p','pending'),
              ($2,'oi_b','op-1','conv','ct','email','h','p','pending')`,
      [TENANT_A, TENANT_B],
    );
    check("datos base con la misma operation_key en dos tenants", true);

    // 3. Aislamiento: app_api solo ve el tenant fijado por transacción.
    const scoped = async <T>(tenant: string | null, sql: string, params: unknown[] = []): Promise<T[]> => {
      const client = new pg.Client({ host: "127.0.0.1", port, user: "postgres", database: "postgres" });
      await client.connect();
      try {
        await client.query("begin");
        await client.query("set local role app_api");
        if (tenant !== null) await client.query("select set_config('app.tenant_id', $1, true)", [tenant]);
        const out = await client.query(sql, params);
        await client.query("commit");
        return out.rows as T[];
      } finally {
        await client.end();
      }
    };

    const aCases = await scoped<{ id: string }>(TENANT_A, "select id from cases");
    check(
      "lectura aislada: A solo ve sus casos",
      aCases.length === 1 && aCases[0]?.id === "case_a",
      JSON.stringify(aCases),
    );

    const bCases = await scoped<{ id: string }>(TENANT_B, "select id from cases");
    check(
      "lectura aislada: B solo ve sus casos",
      bCases.length === 1 && bCases[0]?.id === "case_b",
      JSON.stringify(bCases),
    );

    const noTenant = await scoped<{ id: string }>(null, "select id from cases");
    check("fail-closed: sin app.tenant_id no hay filas", noTenant.length === 0, `${noTenant.length} filas`);

    // 4. Escritura cruzada rechazada en la capa SQL.
    const crossInsert = await expectError(() =>
      scoped(TENANT_A, `insert into contacts (tenant_id, id, display_name) values ($1,'x','X')`, [TENANT_B]),
    );
    check("insert con tenant_id ajeno rechazado (RLS)", crossInsert === "42501", crossInsert);

    const crossFk = await expectError(() =>
      scoped(TENANT_A, `insert into cases (tenant_id, id, contact_id, category, priority, state,
          sla_policy_id, sla_policy_version, resolution_contract)
         values ($1,'case_x',$2,'billing','normal','open','sla-1','1','{}')`, [
        TENANT_A,
        `ct_${TENANT_B}`,
      ]),
    );
    check("FK compuesta: caso de A no puede apuntar a contacto de B", crossFk === "23503", crossFk);

    // 5. Unicidad scoped por tenant.
    const dupOperation = await expectError(() =>
      scoped(TENANT_A, `insert into outbound_intents (tenant_id, id, operation_key, conversation_ref,
          contact_ref, channel, payload_hash, proposal_ref, state)
         values ($1,'oi_a2','op-1','conv','ct','email','h','p','pending')`, [TENANT_A]),
    );
    check("idempotencia: operation_key duplicada en el mismo tenant rechazada", dupOperation === "23505", dupOperation);

    // 6. audit_log append-only y sin delete.
    await admin.query(
      `insert into audit_log (tenant_id, id, actor_id, capability, operation_id, correlation_id, outcome, payload_ref)
       values ($1,'al_1','u1','case.read','op','corr','allow','ref')`,
      [TENANT_A],
    );
    const auditUpdate = await scoped<{ id: string }>(
      TENANT_A,
      `update audit_log set outcome='deny' where id='al_1' returning id`,
    );
    check("audit_log append-only: update no afecta filas", auditUpdate.length === 0, `${auditUpdate.length} filas`);

    // DELETE ni siquiera está concedido: el rechazo es de privilegio, no de RLS.
    const auditDelete = await expectError(() =>
      scoped(TENANT_A, `delete from audit_log where id='al_1' returning id`),
    );
    check("audit_log sin delete (42501, no 0 filas)", auditDelete === "42501", auditDelete);

    // 7. El tenant es visible solo para sí mismo (policies de `tenants`).
    const tenants = await scoped<{ id: string }>(TENANT_A, "select id from tenants order by id");
    check(
      "tenants: solo la fila del tenant activo",
      tenants.length === 1 && tenants[0]?.id === TENANT_A,
      JSON.stringify(tenants),
    );

    // 8. Deduplicación de webhooks.
    const receipt = (id: string) =>
      scoped(TENANT_A, `insert into webhook_receipts (tenant_id, id, connection_id, external_event_id, source_hash)
         values ($1,$2,'conn_1','evt_1','h')`, [TENANT_A, id]);
    await receipt("wr_1");
    const dupReceipt = await expectError(() => receipt("wr_2"));
    check("webhook repetido rechazado por índice único", dupReceipt === "23505", dupReceipt);

    // 9. El rol de la app no tiene DELETE en tablas de negocio (borrado = owner o proceso explícito).
    const deleteCase = await expectError(() => scoped(TENANT_A, `delete from cases where id='case_a' returning id`));
    check("app_api sin privilegio DELETE en cases", deleteCase === "42501", deleteCase);

    // 10. PgStore: el tenant lo fija el store y la conexión del pool no lo arrastra.
    await admin.query(
      `do $$ begin
         if not exists (select 1 from pg_roles where rolname = 'app_login') then
           create role app_login login;
         end if;
       end $$`,
    );
    await admin.query("grant app_api to app_login");
    const pool = new pg.Pool({ host: "127.0.0.1", port, user: "app_login", database: "postgres", max: 2 });
    const store = new PgStore(pool);
    try {
      await store.withTenant(TENANT_A, async (tx) => {
        await tx.insertContact({ id: "ct_store", displayName: "Contacto Store" });
        await tx.insertCase({
          id: "case_store",
          contactId: "ct_store",
          category: "billing",
          priority: "normal",
          state: "open",
          slaPolicyId: "sla-1",
          slaPolicyVersion: "1",
          resolutionContract: {},
        });
        await tx.appendAudit({
          id: "al_store",
          actorId: "u1",
          capability: "case.create",
          operationId: "op-store",
          correlationId: "corr-store",
          outcome: "allow",
          payloadRef: "ref-store",
        });
      });
      const own = await store.withTenant(TENANT_A, (tx) => tx.getCase("case_store"));
      check("PgStore: el tenant ve su propio caso", own?.id === "case_store", JSON.stringify(own));

      const foreign = await store.withTenant(TENANT_B, (tx) => tx.getCase("case_store"));
      check("PgStore: otro tenant no ve el caso (sin arrastre de set local)", foreign === null, JSON.stringify(foreign));

      const first = await store.withTenant(TENANT_A, (tx) =>
        tx.claimOutboundIntent({
          id: "oi_store_1",
          operationKey: "op-store-1",
          conversationRef: "conv-store",
          contactRef: "ct_store",
          channel: "email",
          payloadHash: "h-store",
          proposalRef: "p-store",
        }),
      );
      const replay = await store.withTenant(TENANT_A, (tx) =>
        tx.claimOutboundIntent({
          id: "oi_store_2",
          operationKey: "op-store-1",
          conversationRef: "conv-store",
          contactRef: "ct_store",
          channel: "email",
          payloadHash: "h-store",
          proposalRef: "p-store",
        }),
      );
      check(
        "PgStore: claim idempotente (created=true luego created=false)",
        first.created && !replay.created,
        `${first.created}/${replay.created}`,
      );

      const foreignContact = await store.withTenant(TENANT_B, (tx) => tx.getContact("ct_store"));
      check("PgStore: contacto de A invisible en B", foreignContact === null, JSON.stringify(foreignContact));
    } finally {
      await pool.end();
    }
  } finally {
    await admin.end();
    try {
      run("pg_ctl", ["-D", dataDir, "-m", "immediate", "-w", "stop"]);
    } catch {
      /* el proceso ya puede estar parado */
    }
    rmSync(dataDir, { recursive: true, force: true });
    rmSync(socketDir, { recursive: true, force: true });
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} garantías verificadas en PostgreSQL real`);
  if (failed.length > 0) process.exitCode = 1;
}

await main();
