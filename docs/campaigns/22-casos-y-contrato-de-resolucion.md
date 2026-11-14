# CLI-C22 · Casos y contrato de resolución

Estado: **SKELETON_IMPLEMENTED**. Pruebas locales: **EXECUTED** (ver anexo). Secuencia22/42. Dependencia: CLI-C21.

## Objetivo e invariante

Construir FSM con criterio explícito de resultado.

Invariante: Responder, cerrar por silencio y resolver con evidencia no son equivalentes.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/cases/`
- `packages/resolution/`
- `tests/case-state.test.ts`

## Tareas, en orden

### CLI-C22-T01

Definir estados, transiciones y guards con versiones.

Aceptación: Transición inválida o expectedVersion obsoleto da conflicto.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C22-T02

Definir ResolutionContract por tipo de solicitud.

Aceptación: Resultado deseado, acciones permitidas y estado protegido verificables.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C22-T03

Crear triage propuesto por modelo con reglas de aceptación.

Aceptación: Prioridad/categoría incierta no cambia SLA por heurística sin política.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C22-T04

Implementar asignación y notas internas auditadas.

Aceptación: assignedBy/assignedTo conservan delegante y ejecutor.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C22-T05

Crear resolución propuesta con fuentes/receipt/pendientes.

Aceptación: Promesa de hacer algo no prueba cambio ni resuelve el caso.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C22-T06

Implementar reapertura, duplicados y cierre por silencio acordado.

Aceptación: Métricas separan auto_close de verified_resolution.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C22-T07

Probar decisiones concurrentes humano/twin y reclamos repetidos.

Aceptación: CAS conserva una transición válida y el intento rechazado.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C22-G01 — NOT_EXECUTED:** Agente dice reembolso realizado sin recibo: caso no resuelto y acción fuera de alcance.
- **CLI-C22-G02 — NOT_EXECUTED:** Respuesta amable sin completar acción falla el contrato de resolución.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: P01, P03, R01, R04. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).

> Anexo de implementación: [C22](reports/C22.md) · estado del gate: **PASS** · CLI-C22.
