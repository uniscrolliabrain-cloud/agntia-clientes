# CLI-C42 · Aceptación, informe y entrega a otra IA

Estado: **SKELETON_IMPLEMENTED**. Pruebas locales: **EXECUTED** (ver anexo). Secuencia42/42. Dependencia: CLI-C41.

## Objetivo e invariante

Cerrar con pruebas reales, límites honestos y decisiones pendientes.

Invariante: No llamar terminado a lo no implementado/probado ni ocultar gates bloqueados.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `docs/release/final-report.md`
- `docs/release/acceptance.md`
- `docs/release/handoff-next.md`

## Tareas, en orden

### CLI-C42-T01

Consolidar42 campañas y estados PASS/BLOCKED/NOT_VERIFIED con SHAs.

Aceptación: Cada PASS tiene evidencia ejecutada; cada ausencia tiene causa y responsable.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C42-T02

Inventariar tests ejecutados/pasados/fallidos/skipped por suite y entorno.

Aceptación: Logs sanitizados, versión y duración; no sumar escenarios planeados como tests.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C42-T03

Publicar matriz de capacidades reales por versión/edición/tenant.

Aceptación: Conector pendiente permanece deshabilitado aunque exista su código.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C42-T04

Revisar E2E, seguridad y todos los STOP conditions.

Aceptación: Cero fugas, duplicados, secretos y approvals fabricadas en gates críticos.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C42-T05

Entregar manuales, costes medidos e hipótesis y backup/rollback.

Aceptación: Founder puede evaluar piloto sin leer todo el historial.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C42-T06

Documentar patch propuesto para padre y aprobaciones futuras necesarias.

Aceptación: Ningún cambio aplicado a agente por esta campaña.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C42-T07

Entregar demo sintética, límites y siguiente backlog ordenado.

Aceptación: No producción automática, promesas de paridad mundial ni legal universal.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C42-G01 — NOT_EXECUTED:** Un gate real falla y se intenta declarar release completa: aceptación bloqueada.
- **CLI-C42-G02 — NOT_EXECUTED:** Owner puede reproducir piloto y rastrear cada efecto a actor, fuente, aprobación y receipt.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: H01, P01. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).

> Anexo de implementación: [C42](reports/C42.md) · estado del gate: **PASS** · CLI-C42.
