# CLI-C04 — Twin y trazabilidad nativa

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/04-twin-y-trazabilidad-nativa.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Vincular el ejecutor local al agente canónico y preservar linaje.

## Artefactos previstos
- `packages/domain/twin-binding.ts`
- `docs/native-mapping.md`
- `tests/twin-binding.test.ts`

## Invariante
Persona, rol y runtime conservan identidades distintas; ningún twin se autoautoriza.

## Dependencias y contrato
Dependencias: CLI-C03. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: H01.

## Tareas originales, sin granularizar
- **CLI-C04-T01:** Mapear Actor humano/agente con nombres nativos y campos opcionales. **Aceptación prevista:** id/runtimeId, roleId, personaId y kernelTurnId no se colapsan en un identificador inventado.
- **CLI-C04-T02:** Definir TwinBinding versionado como entidad nueva del servicio. **Aceptación prevista:** Referencias a catálogo/revisión y runtime canónicos tienen emisor y prueba verificables.
- **CLI-C04-T03:** Definir mandato con tenant de origen y tenant objetivo separados. **Aceptación prevista:** La delegación entre empresas no reescribe Actor.tenantId silenciosamente.
- **CLI-C04-T04:** Aplicar lease, expiración, revocación, capacidad y presupuesto a ejecución local. **Aceptación prevista:** Sin binding/mandato válido se puede conservar estado pero no generar nuevos efectos.
- **CLI-C04-T05:** Conservar provenance nativa y extensiones de hash, fuente y mapeador. **Aceptación prevista:** source/actor/updatedAt/confidence no pierden semántica ni se rellenan con hechos inventados.
- **CLI-C04-T06:** Vincular tareas assignedBy/assignedTo, requestId, parentTaskId y artefactos. **Aceptación prevista:** Delegante y ejecutor son recuperables en cada receipt sin exponer prompts completos.
- **CLI-C04-T07:** Probar cambio de revisión canónica, recuperación y separación de memorias. **Aceptación prevista:** Un twin no recibe recuerdos/contexto de otro cliente por usar la misma persona.

## Gates previstos, NO ejecutados
- CLI-C04-G01: Binding válido de otro tenant o revisión obsoleta bloquea una propuesta de efecto.
- CLI-C04-G02: Caduca mandato durante conversación Anam: no se mantiene autorización residual.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
