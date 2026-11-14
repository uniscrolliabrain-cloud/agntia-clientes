# CLI-C36 — Observabilidad, métricas y reportes

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/36-observabilidad-metricas-y-reportes.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Producir números reproducibles y evidencia de trabajo real.

## Artefactos previstos
- `packages/observability/`
- `packages/reporting/`
- `docs/metrics-catalog.md`

## Invariante
Un dashboard no completa datos ausentes ni atribuye trabajo ficticio.

## Dependencias y contrato
Dependencias: CLI-C35. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: P01, V01, V03, V06.

## Tareas originales, sin granularizar
- **CLI-C36-T01:** Definir logs/traces por operationId y correlación sin payload sensible. **Aceptación prevista:** Centinelas JWT/token/PII no aparecen en log/export.
- **CLI-C36-T02:** Instrumentar intents, lag, errores, handoffs y estado de integración. **Aceptación prevista:** Se distingue failure, blocked y outcome_unknown.
- **CLI-C36-T03:** Definir FRT, resolución/reapertura, SLA y CSAT/NPS con ventanas. **Aceptación prevista:** Acuse automático y cierre por silencio no inflan métricas de éxito.
- **CLI-C36-T04:** Crear snapshots de reportes tenant-scoped con fuentes/hash. **Aceptación prevista:** Mismo snapshot reproduce cifras aunque cambie el dato actual.
- **CLI-C36-T05:** Construir dashboard/infografías y explicación de gaps. **Aceptación prevista:** Denominadores, definiciones, cobertura y frescura visibles.
- **CLI-C36-T06:** Generar briefing diario/QBR a partir de hechos y tareas reales. **Aceptación prevista:** Laia/supervisor solo informa acciones con evidence/receipt.
- **CLI-C36-T07:** Probar carga sintética, p50/p95 y consistencia por idioma/canal. **Aceptación prevista:** Medidas con configuración/volumen, sin objetivos alcanzados inventados.

## Gates previstos, NO ejecutados
- CLI-C36-G01: Cero encuestas no produce CSAT0 ni100; aparece sin datos.
- CLI-C36-G02: ReporteA no incluye agregados identificables, enlaces o casos deB.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
