# CLI-C17 — Zammad y portabilidad de helpdesk

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/17-zammad-y-portabilidad-de-helpdesk.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Permitir alternativa operativa con API y permisos probados.

## Artefactos previstos
- `packages/adapters/zammad/`
- `docs/adapters/zammad.md`
- `tests/integration/zammad.test.ts`

## Invariante
Grupos de helpdesk no demuestran aislamiento tenant fuerte sin pruebas.

## Dependencias y contrato
Dependencias: CLI-C16. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: R05, A04.

## Tareas originales, sin granularizar
- **CLI-C17-T01:** Fijar versión/licencia y laboratorio con permisos mínimos. **Aceptación prevista:** Instalación/roles/grupos documentados, sin respaldo de superusuario.
- **CLI-C17-T02:** Validar capacidad de aislamiento del despliegue elegido. **Aceptación prevista:** Si grupos no bastan, exigir instancia separada o deshabilitar modo compartido.
- **CLI-C17-T03:** Descubrir lectura de usuarios/tickets/artículos y ACL reales. **Aceptación prevista:** No usar export/search global con token administrativo.
- **CLI-C17-T04:** Mapear cliente, artículo interno/público y estados. **Aceptación prevista:** Visibilidad y autor no se pierden al normalizar.
- **CLI-C17-T05:** Implementar sync y conflictos con ExternalLinks. **Aceptación prevista:** Cambio/borrado remoto conserva historia y frescura.
- **CLI-C17-T06:** Proponer writes de caso/artículo con aprobación e incertidumbre. **Aceptación prevista:** Sin borrar historial ni reenviar conversación al migrar.
- **CLI-C17-T07:** Probar export/import de salida entre backend fake y Zammad. **Aceptación prevista:** Totales/links reconciliados; replay no provoca mensajes.

## Gates previstos, NO ejecutados
- CLI-C17-G01: Token limitado intenta buscar tickets de grupo/instancia ajena y queda bloqueado.
- CLI-C17-G02: Migración de helpdesk conserva mensajes como histórico, no como envíos nuevos.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
