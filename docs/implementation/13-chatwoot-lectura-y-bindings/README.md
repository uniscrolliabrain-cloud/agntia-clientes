# CLI-C13 — Chatwoot lectura y bindings

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/13-chatwoot-lectura-y-bindings.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Leer conversaciones de cuenta/inbox explícitamente autorizado.

## Artefactos previstos
- `packages/adapters/chatwoot/read.ts`
- `packages/adapters/chatwoot/mappers.ts`
- `tests/integration/chatwoot-read.test.ts`

## Invariante
account_id/inbox_id no se equiparan con tenantId del servicio.

## Dependencias y contrato
Dependencias: CLI-C12. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: R01, A01.

## Tareas originales, sin granularizar
- **CLI-C13-T01:** Fijar versión/imagen/licencia y cuenta bot de laboratorio. **Aceptación prevista:** Reportar si la edición no incluye una capacidad requerida.
- **CLI-C13-T02:** Validar binding tenant→account→inbox y permisos del bot. **Aceptación prevista:** Cuenta de otro tenant no se prueba con lectura para adivinar correspondencia.
- **CLI-C13-T03:** Leer contactos/conversaciones/mensajes con fields y paginación cerrados. **Aceptación prevista:** 1000+ mensajes sintéticos sin omisiones/duplicados por criterio definido.
- **CLI-C13-T04:** Mapear estados/visibilidad/fechas e IDs opacos. **Aceptación prevista:** display_id no se usa solo como identidad global de conversación.
- **CLI-C13-T05:** Preservar mensajes internos, borrados y adjuntos como categorías distintas. **Aceptación prevista:** Nota privada no se expone a contacto o contexto de respuesta pública.
- **CLI-C13-T06:** Crear preview y links con sourceHash y revisión remota. **Aceptación prevista:** Cambio remoto genera actualización/conflicto según AuthorityMap.
- **CLI-C13-T07:** Ejecutar contrato con credencial sin permiso y dos cuentas de test. **Aceptación prevista:** 403/404 sin fuga; mock no sustituye test de instalación real.

## Gates previstos, NO ejecutados
- CLI-C13-G01: Binding de inboxB con accountA falla antes de listar mensajes.
- CLI-C13-G02: Mensaje interno o eliminado no se usa como texto público sin revisión explícita.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
