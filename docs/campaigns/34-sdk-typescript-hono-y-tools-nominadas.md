# CLI-C34 · SDK TypeScript, Hono y tools nominadas

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**. Secuencia34/42. Dependencia: CLI-C33.

## Objetivo e invariante

Exponer capacidades internas tipadas sin proxy universal.

Invariante: Todas las interfaces usan el mismo PEP y scopes; ninguna tool genérica aumenta autonomía.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/sdk/`
- `packages/hono/`
- `packages/agent-tools/`

## Tareas, en orden

### CLI-C34-T01

Crear cliente servidor con DTOs, timeout y errores discriminados.

Aceptación: No unknown general o respuestas sensibles sin validación runtime.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C34-T02

Implementar configuración privada y bloqueo de URL/path injection.

Aceptación: BaseURL aprobada, rutas nominadas y sin credenciales en navegador.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C34-T03

Crear proxy Hono allowlist exacta método/ruta y tamaño.

Aceptación: No prefijo que habilite automáticamente nuevos endpoints sensibles.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C34-T04

Definir tools de lectura/propuesta con input mínimo.

Aceptación: Actor, tenant, capabilities y destinatario autorizado se resuelven fuera del modelo.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C34-T05

Crear adaptador MCP opcional con mismo contrato/PEP.

Aceptación: Instalar MCP no añade admin/send/refund/export_all.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C34-T06

Publicar tipos y schema fixtures compatibles con nomenclatura padre.

Aceptación: schemaVersion propio no se confunde con tipos nativos.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C34-T07

Ejecutar node tests/build y contratos extremo API↔SDK.

Aceptación: No declarar npm instalable si solo existe diseño o no pasó build.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C34-G01 — NOT_EXECUTED:** Tool llama /provider/method o cambia origin mediante URL absoluta: rechazado.
- **CLI-C34-G02 — NOT_EXECUTED:** Agent solicita approve su propio proposal:403 sin fallback a humano.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: H01, S01, P05. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).
