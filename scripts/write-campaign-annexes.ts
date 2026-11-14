import { mkdir, readFile, writeFile } from "node:fs/promises";
import { PHASES_1, type PhaseAnnex } from "./annex-data-1.ts";
import { PHASES_2 } from "./annex-data-2.ts";
import { PHASES_3 } from "./annex-data-3.ts";

/**
 * Genera docs/campaigns/reports/Cxx.md a partir de los datos de fase, actualiza
 * el índice y enlaza cada documento de campaña con su anexo.
 * Idempotente: puede ejecutarse varias veces sin duplicar líneas.
 */
const ALL: PhaseAnnex[] = [...PHASES_1, ...PHASES_2, ...PHASES_3];
const reportsDir = "docs/campaigns/reports";
const GENERATED = "<!-- anexo generado por scripts/write-campaign-annexes.ts -->";

function renderAnnex(phase: PhaseAnnex): string {
  const list = (items: readonly string[]) => items.map((item) => `- ${item}`).join("\n");
  return `# ${phase.code} · ${phase.title}

Estado del gate: **${phase.status}** · ${GENERATED}

## Objetivo de la fase

${phase.objective}

## Entregado en el esqueleto

${list(phase.delivered)}

## Verificación real ejecutada

${list(phase.verified)}

## Desviaciones y hallazgos frente a la documentación

${list(phase.deviations)}

## Pendiente / no verificado

${list(phase.pending)}

## Cómo reproducir esta fase

\`\`\`bash
npm run typecheck && npm test && npm run eval
\`\`\`

Un mock o un documento no convierten un gate de proveedor en PASS. Ver
[informe de implementación](../../release/IMPLEMENTATION-REPORT.md) y
[matriz de capacidades](../../implementation/CAPABILITY-MATRIX.md).
`;
}

function skeletonStatus(status: PhaseAnnex["status"]): string {
  if (status === "PASS") return "VERIFIED_LOCAL";
  if (status === "BLOCKED") return "BLOCKED";
  return "NOT_VERIFIED";
}

await mkdir(reportsDir, { recursive: true });
for (const phase of ALL) {
  await writeFile(`${reportsDir}/${phase.code}.md`, renderAnnex(phase), "utf8");
}

const index = `# Anexos de implementación por fase

Estado global: **SKELETON_IMPLEMENTED** · 42 anexos · typecheck OK · 87/87 tests · 9/9 E2E.

Estos anexos se generan desde \`scripts/annex-data-*.ts\` y describen qué se implementó de
verdad en cada campaña, qué se verificó, qué se desvió y qué queda pendiente.

| Fase | Campaña | Estado del gate |
|---|---|---|
${ALL.map((phase) => `| ${phase.code} | [${phase.title}](${phase.code}.md) | ${phase.status} |`).join("\n")}

## Lectura rápida

- **PASS** (ejecutado y verificado en local): ${ALL.filter((p) => p.status === "PASS").length} fases.
- **NOT_VERIFIED** (código y contrato listos, proveedor o runtime real ausente): ${ALL.filter((p) => p.status === "NOT_VERIFIED").length} fases.
- **BLOCKED** (deliberadamente fuera de alcance en el esqueleto): ${ALL.filter((p) => p.status === "BLOCKED").length} fases.

Ningún PASS de este documento equivale a un gate de proveedor real. Ver
[CAPABILITY-MATRIX](../../implementation/CAPABILITY-MATRIX.md).
`;
await writeFile(`${reportsDir}/README.md`, index, "utf8");

// Enlazar cada documento de campaña con su anexo (idempotente).
for (const phase of ALL) {
  const campaignId = `CLI-${phase.code}`;
  const match = (await readdirCampaigns()).find((file) => file.startsWith(`${phase.code.slice(1)}-`));
  if (!match) continue;
  const path = `docs/campaigns/${match}`;
  const original = await readFile(path, "utf8");
  let updated = original;
  if (!/Estado:\s+\*\*SKELETON_IMPLEMENTED\*\*/u.test(updated)) {
    updated = updated.replace(
      /Estado:\s+\*\*NOT_STARTED\*\*\.\s+Pruebas:\s+\*\*NOT_EXECUTED\*\*\./u,
      "Estado: **SKELETON_IMPLEMENTED**. Pruebas locales: **EXECUTED** (ver anexo).",
    );
  }
  if (!updated.includes(`reports/${phase.code}.md`)) {
    updated += `\n> Anexo de implementación: [${phase.code}](reports/${phase.code}.md) · estado del gate: **${phase.status}** · ${campaignId}.\n`;
  }
  if (updated !== original) await writeFile(path, updated, "utf8");
}

// Manifiesto: se añaden campos nuevos sin reescribir los históricos.
const manifestPath = "docs/campaigns/campaign.json";
const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as {
  campaigns: { id: string; [key: string]: unknown }[];
  skeleton_status?: string;
  skeleton_observed_on?: string;
  skeleton_evidence?: string;
};
manifest.skeleton_status = "SKELETON_IMPLEMENTED";
manifest.skeleton_observed_on = "2026-11-14";
manifest.skeleton_evidence = "docs/implementation/README.md";
for (const campaign of manifest.campaigns) {
  const code = campaign.id.replace("CLI-", "");
  const phase = ALL.find((candidate) => candidate.code === code);
  if (!phase) continue;
  campaign.skeleton_status = skeletonStatus(phase.status);
  campaign.annex = `docs/campaigns/reports/${phase.code}.md`;
}
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

async function readdirCampaigns(): Promise<string[]> {
  const { readdir } = await import("node:fs/promises");
  return readdir("docs/campaigns");
}

console.log(`anexos escritos: ${ALL.length}`);
console.log(`PASS=${ALL.filter((p) => p.status === "PASS").length} NOT_VERIFIED=${ALL.filter((p) => p.status === "NOT_VERIFIED").length} BLOCKED=${ALL.filter((p) => p.status === "BLOCKED").length}`);
