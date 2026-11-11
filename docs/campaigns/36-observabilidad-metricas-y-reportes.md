# CLI-C36 · Observabilidad, métricas y reportes

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**. Secuencia36/42. Dependencia: CLI-C35.

## Objetivo e invariante

Producir números reproducibles y evidencia de trabajo real.

Invariante: Un dashboard no completa datos ausentes ni atribuye trabajo ficticio.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/observability/`
- `packages/reporting/`
- `docs/metrics-catalog.md`

## Tareas, en orden

### CLI-C36-T01

Definir logs/traces por operationId y correlación sin payload sensible.

Aceptación: Centinelas JWT/token/PII no aparecen en log/export.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C36-T02

Instrumentar intents, lag, errores, handoffs y estado de integración.

Aceptación: Se distingue failure, blocked y outcome_unknown.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C36-T03

Definir FRT, resolución/reapertura, SLA y CSAT/NPS con ventanas.

Aceptación: Acuse automático y cierre por silencio no inflan métricas de éxito.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C36-T04

Crear snapshots de reportes tenant-scoped con fuentes/hash.

Aceptación: Mismo snapshot reproduce cifras aunque cambie el dato actual.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C36-T05

Construir dashboard/infografías y explicación de gaps.

Aceptación: Denominadores, definiciones, cobertura y frescura visibles.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C36-T06

Generar briefing diario/QBR a partir de hechos y tareas reales.

Aceptación: Laia/supervisor solo informa acciones con evidence/receipt.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C36-T07

Probar carga sintética, p50/p95 y consistencia por idioma/canal.

Aceptación: Medidas con configuración/volumen, sin objetivos alcanzados inventados.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C36-G01 — NOT_EXECUTED:** Cero encuestas no produce CSAT0 ni100; aparece sin datos.
- **CLI-C36-G02 — NOT_EXECUTED:** ReporteA no incluye agregados identificables, enlaces o casos deB.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: P01, V01, V03, V06. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).
