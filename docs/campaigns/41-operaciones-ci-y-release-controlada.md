# CLI-C41 · Operaciones, CI y release controlada

Estado: **SKELETON_IMPLEMENTED**. Pruebas locales: **EXECUTED** (ver anexo). Secuencia41/42. Dependencia: CLI-C40.

## Objetivo e invariante

Preparar despliegue reversible y recuperación probada.

Invariante: No desplegar producción ni comprar servicios sin aprobación específica del owner.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `docs/operations/`
- `.github/workflows/ci.yml`
- `infra/`

## Tareas, en orden

### CLI-C41-T01

Definir CI lint/typecheck/unit/contract/security/browser e integración por entorno.

Aceptación: No jobs verdes que omiten pruebas críticas sin declarar skip.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C41-T02

Fijar dependencias/imágenes/digests y secrets externos en staging.

Aceptación: No latest móvil o credenciales reales en ejemplos/evidencias.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C41-T03

Crear runbooks outage, rotación, DLQ, reconciliación e incidente.

Aceptación: Cada uno tiene señal, responsable, pasos y verificación de salida.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C41-T04

Probar backup/restore y feature flags por conector/tenant.

Aceptación: Rollback detiene nuevos efectos sin borrar links/audit/receipts.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C41-T05

Definir release de policy/KB/modelos con eval y rollout canario.

Aceptación: Cambio de prompt no va directo a todos los clientes.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C41-T06

Medir capacidad/alertas y coste con carga sintética declarada.

Aceptación: SLA comercial no se inventa a partir de un benchmark local.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C41-T07

Preparar paquete instalable y guía de staging/producción revisable.

Aceptación: Build/instalación probados; artefactos, límites y gates pendientes visibles.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C41-G01 — NOT_EXECUTED:** Apagar proveedor a mitad de dispatch mantiene intent reconciliable tras rollback.
- **CLI-C41-G02 — NOT_EXECUTED:** Restore completo preserva aislamiento, supresiones y estado de mensajes sin reenvío.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: S01, S02, H01, V03. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).

> Anexo de implementación: [C41](reports/C41.md) · estado del gate: **NOT_VERIFIED** · CLI-C41.
