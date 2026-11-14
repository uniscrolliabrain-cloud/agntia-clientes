# CLI-C05 — DTOs y contratos runtime

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/05-dtos-y-contratos-runtime.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Establecer frontera tipada antes de conectar proveedores.

## Artefactos previstos
- `packages/contracts/`
- `docs/openapi-design.md`
- `tests/contracts.test.ts`

## Invariante
DTO del servicio y tipo nativo del padre se versionan y mapean explícitamente.

## Dependencias y contrato
Dependencias: CLI-C04. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: H01, A01, A02, A03.

## Tareas originales, sin granularizar
- **CLI-C05-T01:** Definir Money, refs, IDs opacos, fechas y límites de tamaño. **Aceptación prevista:** Round-trip rechaza floats monetarios ambiguos, NaN, fechas inválidas y campos desconocidos.
- **CLI-C05-T02:** Definir Contact, Organization, relaciones y ChannelIdentity por cardinalidad. **Aceptación prevista:** Email compartido no viola unicidad global inexistente.
- **CLI-C05-T03:** Definir Case, Message, ResolutionContract, Proposal y ApprovalBinding. **Aceptación prevista:** Versión/destinatario/canal/visibilidad forman parte del alcance autorizado.
- **CLI-C05-T04:** Definir Envelope y OperationResult con estados discriminados. **Aceptación prevista:** Resultado incierto no se serializa como éxito confirmado o retryable de escritura.
- **CLI-C05-T05:** Definir ExternalLink, Conflict, Job, EvidenceRef y CapabilityReport. **Aceptación prevista:** IDs remotos string y mapperVersion/sourceHash se conservan.
- **CLI-C05-T06:** Generar JSON Schema y contrato público con secretos excluidos. **Aceptación prevista:** Snapshots de serialización no contienen credenciales ni payload remoto crudo.
- **CLI-C05-T07:** Validar contratos Python/backend externos a TS cuando haya adaptador. **Aceptación prevista:** Fixtures contractuales de proveedor difieren del schema nativo y el mapeo se prueba.

## Gates previstos, NO ejecutados
- CLI-C05-G01: Payload con context.allowed_company_ids/model/method/tenant forzado se rechaza.
- CLI-C05-G02: Envelope mezcla schemaVersion numérico con SystemEvent nativo string1.0: mapping obligatorio.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
