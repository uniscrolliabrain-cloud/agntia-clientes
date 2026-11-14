# CLI-C38 — Derechos, retención y salida del servicio

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/38-derechos-retencion-y-salida-del-servicio.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Hacer operable la privacidad en datos, índices, memorias y backups.

## Artefactos previstos
- `packages/privacy/requests/`
- `docs/retention-matrix.md`
- `tests/privacy-lifecycle.test.ts`

## Invariante
No se borra/exporta por una instrucción de chat sin identidad, alcance y revisión.

## Dependencias y contrato
Dependencias: CLI-C37. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: L01, L02, L03, S02.

## Tareas originales, sin granularizar
- **CLI-C38-T01:** Definir matriz por objeto, finalidad, retención y custodio original. **Aceptación prevista:** Original, snapshot, resumen, embedding y log tienen política explícita.
- **CLI-C38-T02:** Implementar solicitud de acceso/rectificación/supresión con representación. **Aceptación prevista:** Contacto no exporta datos de terceros por pertenecer a la organización.
- **CLI-C38-T03:** Crear preview y aprobación de export con minimización. **Aceptación prevista:** Enlaces caducables, ACL, integridad y trazabilidad de descarga.
- **CLI-C38-T04:** Crear plan de supresión/restricción con bloqueos legales revisados. **Aceptación prevista:** No eliminar evidencia necesaria ni conservar PII ilimitada por append-only.
- **CLI-C38-T05:** Propagar cambios a índices, cachés, memoria twin y proveedores autorizados. **Aceptación prevista:** ACK o pendiente explícito por cada almacén.
- **CLI-C38-T06:** Definir expiración de backups y prevención de resurrección tras restore. **Aceptación prevista:** Restaurar un backup antiguo reaplica supresiones/restricciones aprobadas.
- **CLI-C38-T07:** Probar salida de tenant, revocación de secretos y recuperación controlada. **Aceptación prevista:** No se reactivan envíos históricos o mandatos vencidos.

## Gates previstos, NO ejecutados
- CLI-C38-G01: Usuario solicita export all desde Anam: queda petición limitada para revisión humana.
- CLI-C38-G02: Restore de backup previo a borrado no reexpone datos retirados.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
