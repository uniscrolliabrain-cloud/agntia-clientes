# CLI-C28 — Handoff humano y coordinación

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/28-handoff-humano-y-coordinacion.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Pausar autonomía y transferir contexto mínimo con aceptación real.

## Artefactos previstos
- `packages/handoffs/`
- `docs/handoff-protocol.md`
- `tests/handoffs.test.ts`

## Invariante
Emitir un evento no acredita recepción ni trabajo realizado.

## Dependencias y contrato
Dependencias: CLI-C27. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: H01, V02, V07.

## Tareas originales, sin granularizar
- **CLI-C28-T01:** Definir motivos de escalado por identidad, riesgo, incertidumbre y petición de humano. **Aceptación prevista:** Cliente puede pedir humano sin que el modelo lo disuada para mejorar métricas.
- **CLI-C28-T02:** Crear paquete mínimo con fuentes, acción pendiente y permisos. **Aceptación prevista:** Receptor no obtiene export de todo el tenant.
- **CLI-C28-T03:** Implementar offered/acknowledged/working/completed/returned. **Aceptación prevista:** Cada transición tiene responsable y evidencia, no nombre decorativo.
- **CLI-C28-T04:** Pausar mensajes autónomos al tomar control humano. **Aceptación prevista:** Job ya en cola revalida antes de enviar.
- **CLI-C28-T05:** Crear timeout de aceptación y fallback operacional declarado. **Aceptación prevista:** No afirmar que un humano está trabajando sin ACK real.
- **CLI-C28-T06:** Coordinar derivación a ventas/legal/redes mediante contrato de datos. **Aceptación prevista:** Servicios solapados no ejecutan dos veces el mismo efecto.
- **CLI-C28-T07:** Probar devolución al twin, receptor sin permiso y handoff duplicado. **Aceptación prevista:** Contexto/presupuesto/mandato se revalidan al retomar.

## Gates previstos, NO ejecutados
- CLI-C28-G01: Humano toma caso mientras twin termina borrador: no hay envío autónomo tardío.
- CLI-C28-G02: Handoff al repo hermano sin ACL/contrato válido queda pendiente y minimizado.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
