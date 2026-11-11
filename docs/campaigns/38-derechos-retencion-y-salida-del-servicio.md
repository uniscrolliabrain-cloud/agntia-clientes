# CLI-C38 · Derechos, retención y salida del servicio

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**. Secuencia38/42. Dependencia: CLI-C37.

## Objetivo e invariante

Hacer operable la privacidad en datos, índices, memorias y backups.

Invariante: No se borra/exporta por una instrucción de chat sin identidad, alcance y revisión.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/privacy/requests/`
- `docs/retention-matrix.md`
- `tests/privacy-lifecycle.test.ts`

## Tareas, en orden

### CLI-C38-T01

Definir matriz por objeto, finalidad, retención y custodio original.

Aceptación: Original, snapshot, resumen, embedding y log tienen política explícita.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C38-T02

Implementar solicitud de acceso/rectificación/supresión con representación.

Aceptación: Contacto no exporta datos de terceros por pertenecer a la organización.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C38-T03

Crear preview y aprobación de export con minimización.

Aceptación: Enlaces caducables, ACL, integridad y trazabilidad de descarga.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C38-T04

Crear plan de supresión/restricción con bloqueos legales revisados.

Aceptación: No eliminar evidencia necesaria ni conservar PII ilimitada por append-only.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C38-T05

Propagar cambios a índices, cachés, memoria twin y proveedores autorizados.

Aceptación: ACK o pendiente explícito por cada almacén.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C38-T06

Definir expiración de backups y prevención de resurrección tras restore.

Aceptación: Restaurar un backup antiguo reaplica supresiones/restricciones aprobadas.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C38-T07

Probar salida de tenant, revocación de secretos y recuperación controlada.

Aceptación: No se reactivan envíos históricos o mandatos vencidos.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C38-G01 — NOT_EXECUTED:** Usuario solicita export all desde Anam: queda petición limitada para revisión humana.
- **CLI-C38-G02 — NOT_EXECUTED:** Restore de backup previo a borrado no reexpone datos retirados.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: L01, L02, L03, S02. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).
