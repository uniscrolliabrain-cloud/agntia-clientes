# CLI-C10 · Discovery y capacidades verificadas

Estado: **SKELETON_IMPLEMENTED**. Pruebas locales: **EXECUTED** (ver anexo). Secuencia10/42. Dependencia: CLI-C09.

## Objetivo e invariante

Habilitar cada operación solo según despliegue y permisos comprobados.

Invariante: Documented no equivale a supported_runtime; unknown permanece deshabilitado.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/integrations/discovery/`
- `docs/capability-matrix.md`
- `tests/discovery.test.ts`

## Tareas, en orden

### CLI-C10-T01

Definir estado documented/verified/unsupported/forbidden/unknown por operación.

Aceptación: Una página de marketing no habilita una escritura.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C10-T02

Consultar versión/esquema/edición/ACL con credencial de mínimo privilegio.

Aceptación: Guardar timestamp y evidencia mínima sin enumerar datos de otro tenant.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C10-T03

Validar binding tenant a cuenta/workspace/sitio de proveedor.

Aceptación: No mapear por nombre visible ni primer resultado.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C10-T04

Comprobar campos requeridos y semántica de paginación/errores.

Aceptación: Un200 con HTML o campos ausentes no se declara healthy.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C10-T05

Persistir report versionado y caché con caducidad/invalidation.

Aceptación: Cambio de módulo/rol/schema obliga nueva verificación.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C10-T06

Separar probes de lectura de operaciones con efecto/coste.

Aceptación: Discovery no crea tickets o manda mensajes para probarse sin autorización.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C10-T07

Publicar health con causas sanitizadas y plan de recuperación.

Aceptación: Sin account/module/permiso aparece unsupported o forbidden, no falso éxito.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C10-G01 — NOT_EXECUTED:** Retirar permiso de mensajes mantiene lectura pero deshabilita envío.
- **CLI-C10-G02 — NOT_EXECUTED:** Cambiar schema de workspace invalida mapper/report previo antes de importar.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: A01, A02, A03, A04, A06. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).

> Anexo de implementación: [C10](reports/C10.md) · estado del gate: **PASS** · CLI-C10.
