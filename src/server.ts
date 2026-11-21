import { createServer } from "node:http";
import pg from "pg";
import { buildContext, seedDurableCases } from "./app/context.ts";
import { createApp } from "./app/http.ts";
import { loadConfig } from "./config.ts";
import { systemClock } from "./lib/time.ts";
import { PgCaseRepository, PgStore } from "./storage/pg.ts";
import type { CaseRepository } from "./storage/cases.ts";

/**
 * Arranque del esqueleto (CLI-C41).
 *
 * - Sin `DATABASE_URL` los casos viven en memoria del proceso: sirve para
 *   desarrollo y tests, pero un reinicio los pierde (y `healthz` lo dice).
 * - Con `DATABASE_URL` los casos y su auditoría van a PostgreSQL con RLS. Si la
 *   conexión falla se aborta el arranque: no se degrada en silencio a memoria.
 * - Sin Supabase configurado, `/healthz` responde y toda ruta `/v1` falla
 *   cerrada con 401.
 */
const config = loadConfig();

async function buildDurableCases(): Promise<{ repo: PgCaseRepository; pool: pg.Pool } | null> {
  if (!config.databaseUrl) return null;
  const pool = new pg.Pool({ connectionString: config.databaseUrl, max: 10 });
  const repo = new PgCaseRepository(new PgStore(pool));
  try {
    await repo.ping();
    return { repo, pool };
  } catch {
    // Sin mensaje del driver: puede contener host, usuario o credenciales.
    console.error("DATABASE_URL configurada pero la base de datos no responde: arranque abortado");
    await pool.end().catch(() => undefined);
    return null;
  }
}

async function main(): Promise<void> {
  const durable = await buildDurableCases();
  if (config.databaseUrl && !durable) {
    process.exitCode = 1;
    return;
  }

  const caseRepo: CaseRepository | undefined = durable?.repo;
  // Reloj real: una instancia viva no puede validar JWT (iat/exp), SLA ni
  // auditoría contra el instante congelado de las fixtures.
  const ctx = buildContext({
    config,
    clock: systemClock,
    ...(caseRepo ? { caseRepository: caseRepo } : {}),
  });

  if (caseRepo) {
    try {
      const seeded = await seedDurableCases(ctx);
      console.log(
        seeded.seeded
          ? `semilla durable: ${seeded.cases} casos de fixture escritos`
          : `semilla durable omitida: ${seeded.cases} casos ya presentes`,
      );
    } catch {
      console.error("no se pudo sembrar el repositorio durable: arranque abortado");
      await caseRepo.close().catch(() => undefined);
      process.exitCode = 1;
      return;
    }
  }

  const app = createApp(ctx);

  const server = createServer(async (req, res) => {
    const url = `http://${req.headers.host ?? `localhost:${config.port}`}${req.url ?? "/"}`;
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) headers.set(key, value.join(","));
      else if (value !== undefined) headers.set(key, value);
    }
    const body = req.method === "GET" || req.method === "HEAD" ? undefined : await readBody(req);
    const request = new Request(url, {
      method: req.method ?? "GET",
      headers,
      ...(body ? { body } : {}),
    });
    const response = await app.fetch(request);
    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    res.end(Buffer.from(await response.arrayBuffer()));
  });

  const shutdown = (signal: string): void => {
    console.log(`cerrando por ${signal}`);
    const done = (): void => {
      void (caseRepo ? caseRepo.close() : Promise.resolve()).finally(() => process.exit(0));
    };
    server.close(done);
    // Un cliente que no suelta la conexión no debe impedir el reinicio.
    setTimeout(done, 5_000).unref();
  };
  process.once("SIGTERM", () => shutdown("SIGTERM"));
  process.once("SIGINT", () => shutdown("SIGINT"));

  server.listen(config.port, "0.0.0.0", () => {
    // Sin secretos ni URL de conexión en el log de arranque.
    console.log(`agntia-clientes escuchando en :${config.port} (${config.env})`);
    console.log(
      `estado: HOST_BRIDGE_NOT_VERIFIED · proveedores NOT_CONFIGURED · casos ${
        caseRepo ? "postgres" : "in_memory"
      }`,
    );
  });
}

async function readBody(req: NodeJS.ReadableStream): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk as Buffer));
  return Buffer.concat(chunks).toString("utf8");
}

await main();
