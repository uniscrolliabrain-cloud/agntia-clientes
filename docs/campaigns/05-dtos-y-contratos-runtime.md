# CLI-C05 · DTOs y contratos runtime

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**. Secuencia5/42. Dependencia: CLI-C04.

## Objetivo e invariante

Establecer frontera tipada antes de conectar proveedores.

Invariante: DTO del servicio y tipo nativo del padre se versionan y mapean explícitamente.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/contracts/`
- `docs/openapi-design.md`
- `tests/contracts.test.ts`

## Tareas, en orden

### CLI-C05-T01

Definir Money, refs, IDs opacos, fechas y límites de tamaño.

Aceptación: Round-trip rechaza floats monetarios ambiguos, NaN, fechas inválidas y campos desconocidos.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C05-T02

Definir Contact, Organization, relaciones y ChannelIdentity por cardinalidad.

Aceptación: Email compartido no viola unicidad global inexistente.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C05-T03

Definir Case, Message, ResolutionContract, Proposal y ApprovalBinding.

Aceptación: Versión/destinatario/canal/visibilidad forman parte del alcance autorizado.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C05-T04

Definir Envelope y OperationResult con estados discriminados.

Aceptación: Resultado incierto no se serializa como éxito confirmado o retryable de escritura.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C05-T05

Definir ExternalLink, Conflict, Job, EvidenceRef y CapabilityReport.

Aceptación: IDs remotos string y mapperVersion/sourceHash se conservan.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C05-T06

Generar JSON Schema y contrato público con secretos excluidos.

Aceptación: Snapshots de serialización no contienen credenciales ni payload remoto crudo.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C05-T07

Validar contratos Python/backend externos a TS cuando haya adaptador.

Aceptación: Fixtures contractuales de proveedor difieren del schema nativo y el mapeo se prueba.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C05-G01 — NOT_EXECUTED:** Payload con context.allowed_company_ids/model/method/tenant forzado se rechaza.
- **CLI-C05-G02 — NOT_EXECUTED:** Envelope mezcla schemaVersion numérico con SystemEvent nativo string1.0: mapping obligatorio.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: H01, A01, A02, A03. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).
