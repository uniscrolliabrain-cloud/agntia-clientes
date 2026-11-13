# CLI-C15 — CRM Twenty opcional

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/15-crm-twenty-opcional.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Adaptar personas/empresas según esquema del workspace.

## Artefactos previstos
- `packages/adapters/twenty/`
- `docs/adapters/twenty.md`
- `tests/integration/twenty.test.ts`

## Invariante
No hay un schema Twenty universal ni permiso para Metadata API del agente.

## Dependencias y contrato
Dependencias: CLI-C14. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: R02, A02.

## Tareas originales, sin granularizar
- **CLI-C15-T01:** Revisar licencia completa por módulo y fijar versión usada. **Aceptación prevista:** Archivos Enterprise/paquetes MIT/AGPL no se clasifican por una sola etiqueta.
- **CLI-C15-T02:** Descubrir schema REST/GraphQL del workspace y role scoped API key. **Aceptación prevista:** Campo custom se mapea solo si está confirmado y permitido.
- **CLI-C15-T03:** Validar workspace binding y seleccionar objetos/campos nominados. **Aceptación prevista:** No query GraphQL o metadata mutation libre del modelo.
- **CLI-C15-T04:** Implementar lectura/paginación de personas/empresas y relaciones. **Aceptación prevista:** IDs/sourceHash/local link mantienen cardinalidad sin dedup por nombre.
- **CLI-C15-T05:** Proponer create/update con diff y expectedRemoteVersion verificable. **Aceptación prevista:** Campo sensible y cambio remoto exigen revisión o conflicto.
- **CLI-C15-T06:** Implementar commit autorizado solo para alcance comprobado. **Aceptación prevista:** Timeout incierto se reconcilia o bloquea, sin upsert que multiplique contactos.
- **CLI-C15-T07:** Probar esquema distinto, revocación y conflicto de fuente. **Aceptación prevista:** Adaptador reporta unsupported ante campo requerido ausente.

## Gates previstos, NO ejecutados
- CLI-C15-G01: Workspace con campo distinto no recibe escritura al campo aproximado por LLM.
- CLI-C15-G02: CredencialB intercambiada en conexiónA falla el binding y no filtra datos.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
