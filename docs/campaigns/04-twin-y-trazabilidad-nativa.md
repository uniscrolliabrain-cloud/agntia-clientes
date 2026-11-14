# CLI-C04 · Twin y trazabilidad nativa

Estado: **SKELETON_IMPLEMENTED**. Pruebas locales: **EXECUTED** (ver anexo). Secuencia4/42. Dependencia: CLI-C03.

## Objetivo e invariante

Vincular el ejecutor local al agente canónico y preservar linaje.

Invariante: Persona, rol y runtime conservan identidades distintas; ningún twin se autoautoriza.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/domain/twin-binding.ts`
- `docs/native-mapping.md`
- `tests/twin-binding.test.ts`

## Tareas, en orden

### CLI-C04-T01

Mapear Actor humano/agente con nombres nativos y campos opcionales.

Aceptación: id/runtimeId, roleId, personaId y kernelTurnId no se colapsan en un identificador inventado.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C04-T02

Definir TwinBinding versionado como entidad nueva del servicio.

Aceptación: Referencias a catálogo/revisión y runtime canónicos tienen emisor y prueba verificables.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C04-T03

Definir mandato con tenant de origen y tenant objetivo separados.

Aceptación: La delegación entre empresas no reescribe Actor.tenantId silenciosamente.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C04-T04

Aplicar lease, expiración, revocación, capacidad y presupuesto a ejecución local.

Aceptación: Sin binding/mandato válido se puede conservar estado pero no generar nuevos efectos.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C04-T05

Conservar provenance nativa y extensiones de hash, fuente y mapeador.

Aceptación: source/actor/updatedAt/confidence no pierden semántica ni se rellenan con hechos inventados.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C04-T06

Vincular tareas assignedBy/assignedTo, requestId, parentTaskId y artefactos.

Aceptación: Delegante y ejecutor son recuperables en cada receipt sin exponer prompts completos.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C04-T07

Probar cambio de revisión canónica, recuperación y separación de memorias.

Aceptación: Un twin no recibe recuerdos/contexto de otro cliente por usar la misma persona.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C04-G01 — NOT_EXECUTED:** Binding válido de otro tenant o revisión obsoleta bloquea una propuesta de efecto.
- **CLI-C04-G02 — NOT_EXECUTED:** Caduca mandato durante conversación Anam: no se mantiene autorización residual.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: H01. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).

> Anexo de implementación: [C04](reports/C04.md) · estado del gate: **PASS** · CLI-C04.
