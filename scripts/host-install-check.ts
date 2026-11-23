/**
 * CLI-C41 · Instalación en un repo host (antesala de `/agente`).
 *
 * Este arnés no toca `/agente` (no está montado en este entorno). Comprueba la
 * parte que sí se puede probar aquí y que suele romper una instalación:
 *
 *   1. `npm pack` produce un artefacto con el runtime y las migraciones, y sin
 *      secretos, tests ni artefactos locales;
 *   2. ese tarball se instala en un proyecto vacío con dependencias de
 *      producción (incluido `pg`, que el servidor importa en runtime);
 *   3. el servidor arranca **desde `node_modules`** y responde `/healthz` con
 *      los stores en memoria y `/v1` cerrado con 401;
 *   4. el subpath `agntia-clientes/bridge` exporta `HttpHost` y falla cerrado;
 *   5. SIGTERM cierra el proceso con código 0.
 *
 * Uso: npm run install:check
 */
import { execFileSync, spawn, type ChildProcess } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";

const FIXTURE_SECRET = "fixture-hmac-secret-not-a-real-credential";
const ISSUER = "https://fixture.supabase.co/auth/v1";

type Result = { name: string; ok: boolean; detail?: string };
const results: Result[] = [];
const check = (name: string, ok: boolean, detail?: string): void => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

const sleep = (ms: number): Promise<void> => new Promise((done) => setTimeout(done, ms));

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

async function main(): Promise<void> {
  const workDir = mkdtempSync(join(tmpdir(), "agntia-install-"));
  const packDir = join(workDir, "pack");
  const hostDir = join(workDir, "host");
  mkdirSync(packDir, { recursive: true });
  mkdirSync(hostDir, { recursive: true });
  let child: ChildProcess | null = null;

  try {
    const packed = execFileSync("npm", ["pack", "--pack-destination", packDir, "--silent"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    })
      .trim()
      .split("\n")
      .filter(Boolean)
      .at(-1) as string;
    const tarball = join(packDir, packed);
    check("npm pack produce un tarball", existsSync(tarball), packed);

    const listing = execFileSync("tar", ["-tzf", tarball], { encoding: "utf8" }).split("\n");
    const has = (suffix: string): boolean => listing.some((row) => row.endsWith(suffix));
    check(
      "el artefacto incluye JS compilado, puente y migraciones",
      has("package/dist/src/server.js") &&
        has("package/dist/src/bridge/http-host.js") &&
        has("package/dist/src/storage/migrations/0005_aggregate_documents.sql"),
    );
    check(
      "el artefacto no incluye secretos, tests ni artefactos locales",
      !listing.some((row) => row.includes("node_modules/") || row.includes("artifacts/") || row.startsWith("package/test/")) &&
        !has(".env"),
    );

    writeFileSync(
      join(hostDir, "package.json"),
      JSON.stringify({ name: "host-install-check", private: true, type: "module" }, null, 2),
    );
    try {
      execFileSync(
        "npm",
        ["install", tarball, "--no-audit", "--no-fund", "--ignore-scripts", "--loglevel=error"],
        { cwd: hostDir, stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" },
      );
    } catch (error) {
      const stderr = error instanceof Error && "stderr" in error ? String((error as { stderr: unknown }).stderr) : "";
      check("el paquete se instala en un proyecto host limpio", false, stderr.slice(-800));
      throw new Error("instalación abortada: el registro npm no está disponible o el paquete no resuelve");
    }
    const installedPkg = join(hostDir, "node_modules/agntia-clientes/package.json");
    check("el paquete queda instalado en node_modules", existsSync(installedPkg));
    const installed = JSON.parse(readFileSync(installedPkg, "utf8")) as {
      dependencies?: Record<string, string>;
    };
    check(
      "las dependencias de runtime incluyen pg, hono y zod",
      Boolean(installed.dependencies?.pg && installed.dependencies?.hono && installed.dependencies?.zod),
      JSON.stringify(installed.dependencies),
    );

    const migrations = readdirSync(
      join(hostDir, "node_modules/agntia-clientes/dist/src/storage/migrations"),
    ).filter((f) => f.endsWith(".sql"));
    check("las cinco migraciones viajan con el paquete", migrations.length === 5, `${migrations.length}`);

    const bridgeProbe = execFileSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        `const { HttpHost } = await import("agntia-clientes/bridge");
         const host = new HttpHost({ baseUrl: null, serviceToken: null });
         let code = "";
         try { await host.verifyPrincipal("sub_x"); } catch (error) { code = error.code; }
         console.log(JSON.stringify({ instantiable: typeof HttpHost === "function", code }));`,
      ],
      { cwd: hostDir, encoding: "utf8" },
    );
    const bridge = JSON.parse(bridgeProbe.trim()) as { instantiable: boolean; code: string };
    check(
      "el subpath bridge exporta HttpHost y falla cerrado",
      bridge.instantiable && bridge.code === "not_configured",
      bridgeProbe.trim(),
    );

    const port = await freePort();
    let output = "";
    child = spawn(process.execPath, ["node_modules/agntia-clientes/dist/src/server.js"], {
      cwd: hostDir,
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        PORT: String(port),
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

    let health: { status: number; body: Record<string, unknown> } | null = null;
    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline) {
      if (child.exitCode !== null) throw new Error(`el servidor instalado terminó con ${child.exitCode}:\n${output.slice(-1200)}`);
      try {
        const response = await fetch(`http://127.0.0.1:${port}/healthz`);
        if (response.ok) {
          health = { status: response.status, body: (await response.json()) as Record<string, unknown> };
          break;
        }
      } catch {
        /* todavía no escucha */
      }
      await sleep(150);
    }
    check(
      "el servidor instalado arranca desde node_modules",
      health?.status === 200 &&
        health.body.case_store === "memory" &&
        health.body.proposal_store === "memory" &&
        health.body.host_bridge === "not_configured",
      JSON.stringify(health?.body),
    );

    const anonymous = await fetch(`http://127.0.0.1:${port}/v1/clientes/me`);
    check("el servidor instalado falla cerrado sin JWT", anonymous.status === 401, `${anonymous.status}`);
    await anonymous.arrayBuffer();

    const exited = new Promise<number | null>((done) => child?.once("exit", (code) => done(code)));
    child.kill("SIGTERM");
    const code = await Promise.race([exited, sleep(8_000).then(() => "timeout" as const)]);
    check("SIGTERM cierra el proceso con código 0", code === 0, `${String(code)}`);
    child = null;
  } finally {
    if (child && child.exitCode === null) child.kill("SIGKILL");
    rmSync(workDir, { recursive: true, force: true });
  }

  const failed = results.filter((row) => !row.ok);
  console.log(`\n${results.length - failed.length}/${results.length} garantías de instalación verificadas`);
  console.log("el repo /agente no está montado aquí: instalar allí sigue requiriendo su checkout y autorización");
  if (failed.length > 0) process.exitCode = 1;
}

await main();
