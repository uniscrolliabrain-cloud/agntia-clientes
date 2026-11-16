# Baseline verificable
Repositorio: https://github.com/uniscrolliabrain-cloud/agntia-clientes
main: `6fa3d796a2f5d3a0ab063db004c1adcdac1db4d6`.
Ramas visibles: main; docs/factory-prep-v1-20261113; docs/roadmap-integracion-agente-20261115; docs/ultragranular-complete-program-20261114; freebuff/e328a674df54fe15e5536cde.
Comparación con main: factory-prep 0 ahead/69 behind; roadmap 1 ahead/4 behind (añade `docs/roadmap-integracion-agente-2026-11/ROADMAP.md`); ultragranular 0 ahead/73 behind; freebuff 0 ahead/5 behind. PRs #1–#5 detectadas.
Stack OBSERVADO `package.json`: Node >=22.6, Hono ^4.9.10, Zod ^4.1.12, TypeScript ^5.9.3, npm. Scripts `npm run typecheck`, `npm test`, `npm run eval`, `npm run reports`, `npm run verify`.
DOCUMENTADO NO VERIFICADO: `docs/release/IMPLEMENTATION-REPORT.md` declara 106 tests y 9 E2E sintéticos; 33 PASS locales, 8 NOT_VERIFIED, 1 BLOCKED. README conserva 87 tests; discrepancia documental P2. El informe conserva frases históricas contradichas por commits posteriores (CI y C11/C12/C31): reconciliar por fecha y SHA, no sobrescribir historia.
BLOQUEADO: no hubo checkout ejecutable ni pruebas locales en esta sesión; GitHub permite lectura/escritura, no inspección de worktrees no publicados. No se verificaron Postgres/RLS, proveedor real, navegador, ni bridge padre.
