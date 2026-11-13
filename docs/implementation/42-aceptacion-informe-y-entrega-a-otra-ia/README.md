# CLI-C42 — Aceptación, informe y entrega a otra IA

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/42-aceptacion-informe-y-entrega-a-otra-ia.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Cerrar con pruebas reales, límites honestos y decisiones pendientes.

## Artefactos previstos
- `docs/release/final-report.md`
- `docs/release/acceptance.md`
- `docs/release/handoff-next.md`

## Invariante
No llamar terminado a lo no implementado/probado ni ocultar gates bloqueados.

## Dependencias y contrato
Dependencias: CLI-C41. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: H01, P01.

## Tareas originales, sin granularizar
- **CLI-C42-T01:** Consolidar42 campañas y estados PASS/BLOCKED/NOT_VERIFIED con SHAs. **Aceptación prevista:** Cada PASS tiene evidencia ejecutada; cada ausencia tiene causa y responsable.
- **CLI-C42-T02:** Inventariar tests ejecutados/pasados/fallidos/skipped por suite y entorno. **Aceptación prevista:** Logs sanitizados, versión y duración; no sumar escenarios planeados como tests.
- **CLI-C42-T03:** Publicar matriz de capacidades reales por versión/edición/tenant. **Aceptación prevista:** Conector pendiente permanece deshabilitado aunque exista su código.
- **CLI-C42-T04:** Revisar E2E, seguridad y todos los STOP conditions. **Aceptación prevista:** Cero fugas, duplicados, secretos y approvals fabricadas en gates críticos.
- **CLI-C42-T05:** Entregar manuales, costes medidos e hipótesis y backup/rollback. **Aceptación prevista:** Founder puede evaluar piloto sin leer todo el historial.
- **CLI-C42-T06:** Documentar patch propuesto para padre y aprobaciones futuras necesarias. **Aceptación prevista:** Ningún cambio aplicado a agente por esta campaña.
- **CLI-C42-T07:** Entregar demo sintética, límites y siguiente backlog ordenado. **Aceptación prevista:** No producción automática, promesas de paridad mundial ni legal universal.

## Gates previstos, NO ejecutados
- CLI-C42-G01: Un gate real falla y se intenta declarar release completa: aceptación bloqueada.
- CLI-C42-G02: Owner puede reproducir piloto y rastrear cada efecto a actor, fuente, aprobación y receipt.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
