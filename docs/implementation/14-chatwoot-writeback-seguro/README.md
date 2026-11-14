# CLI-C14 — Chatwoot writeback seguro

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/14-chatwoot-writeback-seguro.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Crear mensajes y cambios de caso mediante intents controlados.

## Artefactos previstos
- `packages/adapters/chatwoot/write.ts`
- `packages/reconcile/chatwoot.ts`
- `tests/chatwoot-write.test.ts`

## Invariante
Crear una fila de mensaje no prueba entrega ni autoriza retry.

## Dependencias y contrato
Dependencias: CLI-C13. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: R01, A01.

## Tareas originales, sin granularizar
- **CLI-C14-T01:** Confirmar create/status/receipt disponibles en instalación real. **Aceptación prevista:** Contrato distingue persistencia del mensaje y envío asíncrono.
- **CLI-C14-T02:** Implementar dry-run de respuesta con receptor, visibility y adjuntos. **Aceptación prevista:** Sin publicación, job remoto ni gasto inesperado.
- **CLI-C14-T03:** Vincular aprobación y autoridad única de dispatch. **Aceptación prevista:** Padre y backend no mandan el mismo reply por rutas distintas.
- **CLI-C14-T04:** Persistir intent/outbox antes de HTTP con key/hash/revisión. **Aceptación prevista:** Replay devuelve el intent sin crear otro mensaje lógico.
- **CLI-C14-T05:** Reconciliar timeout por IDs/ref verificables del backend. **Aceptación prevista:** Si no hay búsqueda fiable se bloquea retry y se escala.
- **CLI-C14-T06:** Aplicar límites de create/update permitidos; excluir delete/retry arbitrario. **Aceptación prevista:** Tools no acceden a métodos de administración o pipeline interno.
- **CLI-C14-T07:** Probar crash tras create, doble click y handoff concurrente. **Aceptación prevista:** Un mensaje o estado incierto bloqueado; ninguna duplicación encubierta.

## Gates previstos, NO ejecutados
- CLI-C14-G01: Backend acepta mensaje pero se pierde respuesta: no se llama retry automáticamente.
- CLI-C14-G02: Se aprueba nota interna y luego cambia visibility a pública: hash/revisión invalida.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
