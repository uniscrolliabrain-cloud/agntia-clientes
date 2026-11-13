# CLI-C22 — Casos y contrato de resolución

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/22-casos-y-contrato-de-resolucion.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Construir FSM con criterio explícito de resultado.

## Artefactos previstos
- `packages/cases/`
- `packages/resolution/`
- `tests/case-state.test.ts`

## Invariante
Responder, cerrar por silencio y resolver con evidencia no son equivalentes.

## Dependencias y contrato
Dependencias: CLI-C21. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: P01, P03, R01, R04.

## Tareas originales, sin granularizar
- **CLI-C22-T01:** Definir estados, transiciones y guards con versiones. **Aceptación prevista:** Transición inválida o expectedVersion obsoleto da conflicto.
- **CLI-C22-T02:** Definir ResolutionContract por tipo de solicitud. **Aceptación prevista:** Resultado deseado, acciones permitidas y estado protegido verificables.
- **CLI-C22-T03:** Crear triage propuesto por modelo con reglas de aceptación. **Aceptación prevista:** Prioridad/categoría incierta no cambia SLA por heurística sin política.
- **CLI-C22-T04:** Implementar asignación y notas internas auditadas. **Aceptación prevista:** assignedBy/assignedTo conservan delegante y ejecutor.
- **CLI-C22-T05:** Crear resolución propuesta con fuentes/receipt/pendientes. **Aceptación prevista:** Promesa de hacer algo no prueba cambio ni resuelve el caso.
- **CLI-C22-T06:** Implementar reapertura, duplicados y cierre por silencio acordado. **Aceptación prevista:** Métricas separan auto_close de verified_resolution.
- **CLI-C22-T07:** Probar decisiones concurrentes humano/twin y reclamos repetidos. **Aceptación prevista:** CAS conserva una transición válida y el intento rechazado.

## Gates previstos, NO ejecutados
- CLI-C22-G01: Agente dice reembolso realizado sin recibo: caso no resuelto y acción fuera de alcance.
- CLI-C22-G02: Respuesta amable sin completar acción falla el contrato de resolución.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
