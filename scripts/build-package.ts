/**
 * CLI-C41 · Build del paquete instalable.
 *
 * Node no ejecuta TypeScript dentro de `node_modules`
 * (`ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`), así que el repo se compila a
 * JS ESM y el paquete publica `dist/`. Las migraciones `.sql` no las emite tsc:
 * se copian al mismo árbol para que el host aplique exactamente las del repo.
 *
 * Uso: npm run build (lo invoca `prepack`, y por tanto `npm pack`).
 */
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
const tsc = resolve(root, "node_modules/typescript/bin/tsc");

if (!existsSync(tsc)) {
  console.error("falta typescript instalado: ejecutar npm ci antes del build");
  process.exit(1);
}

rmSync(dist, { recursive: true, force: true });
execFileSync(process.execPath, [tsc, "-p", resolve(root, "tsconfig.build.json")], {
  cwd: root,
  stdio: "inherit",
});
cpSync(resolve(root, "src/storage/migrations"), resolve(dist, "src/storage/migrations"), {
  recursive: true,
});
console.log("build: dist/src + migraciones");
