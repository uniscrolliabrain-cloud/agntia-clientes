import { mkdir, writeFile } from "node:fs/promises";
import { runE2E } from "./e2e.ts";

/** Runner de evals (CLI-C40): escribe evidencia sanitizada en artifacts/. */
const result = await runE2E();
await mkdir("artifacts", { recursive: true });
const passed = result.scenarios.filter((s) => s.status === "PASS").length;
const failed = result.scenarios.filter((s) => s.status === "FAIL").length;
const blocked = result.scenarios.filter((s) => s.status === "BLOCKED").length;

const payload = {
  ...result,
  summary: { total: result.scenarios.length, passed, failed, blocked },
  limitations: [
    "Proveedores reales no conectados: gates de API NOT_VERIFIED",
    "Postgres/RLS no ejecutado: aislamiento probado en repositorio en memoria",
    "Anam sin sesión real: emisión de token simulada en desarrollo",
    "Sin datos de clientes reales ni credenciales en la evidencia",
  ],
};
await writeFile("artifacts/e2e-report.json", JSON.stringify(payload, null, 2), "utf8");
console.log(JSON.stringify(payload.summary, null, 2));
for (const scenario of result.scenarios) {
  console.log(`${scenario.status.padEnd(5)} ${scenario.id} · ${scenario.name}`);
  for (const assertion of scenario.assertions.filter((a) => !a.ok)) {
    console.log(`      FAIL ${assertion.name}: ${assertion.detail}`);
  }
}
process.exit(failed > 0 ? 1 : 0);
