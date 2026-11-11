# CLI-C13 · Chatwoot lectura y bindings

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**. Secuencia13/42. Dependencia: CLI-C12.

## Objetivo e invariante

Leer conversaciones de cuenta/inbox explícitamente autorizado.

Invariante: account_id/inbox_id no se equiparan con tenantId del servicio.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/adapters/chatwoot/read.ts`
- `packages/adapters/chatwoot/mappers.ts`
- `tests/integration/chatwoot-read.test.ts`

## Tareas, en orden

### CLI-C13-T01

Fijar versión/imagen/licencia y cuenta bot de laboratorio.

Aceptación: Reportar si la edición no incluye una capacidad requerida.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C13-T02

Validar binding tenant→account→inbox y permisos del bot.

Aceptación: Cuenta de otro tenant no se prueba con lectura para adivinar correspondencia.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C13-T03

Leer contactos/conversaciones/mensajes con fields y paginación cerrados.

Aceptación: 1000+ mensajes sintéticos sin omisiones/duplicados por criterio definido.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C13-T04

Mapear estados/visibilidad/fechas e IDs opacos.

Aceptación: display_id no se usa solo como identidad global de conversación.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C13-T05

Preservar mensajes internos, borrados y adjuntos como categorías distintas.

Aceptación: Nota privada no se expone a contacto o contexto de respuesta pública.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C13-T06

Crear preview y links con sourceHash y revisión remota.

Aceptación: Cambio remoto genera actualización/conflicto según AuthorityMap.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C13-T07

Ejecutar contrato con credencial sin permiso y dos cuentas de test.

Aceptación: 403/404 sin fuga; mock no sustituye test de instalación real.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C13-G01 — NOT_EXECUTED:** Binding de inboxB con accountA falla antes de listar mensajes.
- **CLI-C13-G02 — NOT_EXECUTED:** Mensaje interno o eliminado no se usa como texto público sin revisión explícita.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: R01, A01. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).
