# CLI-C11 · Directorio y resolución de identidad

Estado: **SKELETON_IMPLEMENTED**. Pruebas locales: **EXECUTED** (ver anexo). Secuencia11/42. Dependencia: CLI-C10.

## Objetivo e invariante

Construir ficha de relación sin fusiones ni privilegios heurísticos.

Invariante: Coincidencia de nombre, email o teléfono no prueba identidad/autorización.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/customers/`
- `packages/identity-links/`
- `tests/customer-identity.test.ts`

## Tareas, en orden

### CLI-C11-T01

Implementar organizaciones, contactos y relaciones temporales.

Aceptación: Una persona puede representar dos empresas con ámbitos distintos.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C11-T02

Normalizar direcciones por canal sin destruir original/procedencia.

Aceptación: Unicode, mayúsculas y teléfonos no se convierten en coincidencias autoritativas.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C11-T03

Crear verificación de ChannelIdentity con prueba por contexto.

Aceptación: Mensaje entrante no vincula automáticamente a usuario de portal.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C11-T04

Definir propuesta de duplicado y plan de merge con revisión.

Aceptación: Preview muestra datos/casos/consentimientos afectados y no hace writes.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C11-T05

Implementar merge autorizado con alias, versión y trazabilidad.

Aceptación: Recuperar origen de cada dato; no mezclar historial de tenants.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C11-T06

Agregar field ACL, preferencias y visibilidad del timeline.

Aceptación: Notas internas y datos sensibles no pasan a representante externo.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C11-T07

Probar actualizaciones concurrentes y reconstrucción de ficha.

Aceptación: Conflictos no se resuelven por último escritor silencioso.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C11-G01 — NOT_EXECUTED:** Dos homónimos y buzón compartido generan propuesta de revisión, no merge automático.
- **CLI-C11-G02 — NOT_EXECUTED:** Merge de A con B o de contacto sin permiso se bloquea antes de mutar.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: H01, P04, P06. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).

> Anexo de implementación: [C11](reports/C11.md) · estado del gate: **BLOCKED** · CLI-C11.
