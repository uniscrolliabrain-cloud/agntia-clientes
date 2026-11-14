# CLI-C11 — Directorio y resolución de identidad

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/11-directorio-y-resolucion-de-identidad.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Construir ficha de relación sin fusiones ni privilegios heurísticos.

## Artefactos previstos
- `packages/customers/`
- `packages/identity-links/`
- `tests/customer-identity.test.ts`

## Invariante
Coincidencia de nombre, email o teléfono no prueba identidad/autorización.

## Dependencias y contrato
Dependencias: CLI-C10. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: H01, P04, P06.

## Tareas originales, sin granularizar
- **CLI-C11-T01:** Implementar organizaciones, contactos y relaciones temporales. **Aceptación prevista:** Una persona puede representar dos empresas con ámbitos distintos.
- **CLI-C11-T02:** Normalizar direcciones por canal sin destruir original/procedencia. **Aceptación prevista:** Unicode, mayúsculas y teléfonos no se convierten en coincidencias autoritativas.
- **CLI-C11-T03:** Crear verificación de ChannelIdentity con prueba por contexto. **Aceptación prevista:** Mensaje entrante no vincula automáticamente a usuario de portal.
- **CLI-C11-T04:** Definir propuesta de duplicado y plan de merge con revisión. **Aceptación prevista:** Preview muestra datos/casos/consentimientos afectados y no hace writes.
- **CLI-C11-T05:** Implementar merge autorizado con alias, versión y trazabilidad. **Aceptación prevista:** Recuperar origen de cada dato; no mezclar historial de tenants.
- **CLI-C11-T06:** Agregar field ACL, preferencias y visibilidad del timeline. **Aceptación prevista:** Notas internas y datos sensibles no pasan a representante externo.
- **CLI-C11-T07:** Probar actualizaciones concurrentes y reconstrucción de ficha. **Aceptación prevista:** Conflictos no se resuelven por último escritor silencioso.

## Gates previstos, NO ejecutados
- CLI-C11-G01: Dos homónimos y buzón compartido generan propuesta de revisión, no merge automático.
- CLI-C11-G02: Merge de A con B o de contacto sin permiso se bloquea antes de mutar.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
