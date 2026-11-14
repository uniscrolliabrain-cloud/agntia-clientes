# CLI-C21 · Inbox, webhooks y evidencia adjunta

Estado: **SKELETON_IMPLEMENTED**. Pruebas locales: **EXECUTED** (ver anexo). Secuencia21/42. Dependencia: CLI-C20.

## Objetivo e invariante

Convertir entrada no confiable en hechos trazables y sanitizados.

Invariante: Contenido entrante nunca altera identidad, policy o catálogo de tools.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/inbox/`
- `packages/attachments/`
- `tests/inbox-attachments.test.ts`

## Tareas, en orden

### CLI-C21-T01

Validar firma, timestamp, replay y tamaño antes de procesar webhook.

Aceptación: Fallo de verificación no dispara retrieval ni inferencia pagada.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C21-T02

Resolver conexión/tenant desde registro y dedup persistente.

Aceptación: ExternalEventId solo es único dentro de su contexto documentado.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C21-T03

Normalizar source/occurred/receivedAt, visibilidad y hash.

Aceptación: Orden temporal remoto no suplanta secuencia local ni pierde zona.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C21-T04

Descargar adjuntos backend con egress controlado y límites.

Aceptación: No redirect a metadata, ruta local o URL firmada de otro tenant.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C21-T05

Aplicar MIME real, antivirus/cuarentena y sanitización.

Aceptación: Archivo no escaneado/corrupto no se envía al modelo como confiable.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C21-T06

Vincular original/documentRef y política de retención por objeto.

Aceptación: Hash verificable y recuperación autorizada; no duplicación binaria innecesaria.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C21-T07

Probar adjuntos adversariales, notas internas y eventos reordenados.

Aceptación: No se ejecutan instrucciones ni se publica contenido privado.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C21-G01 — NOT_EXECUTED:** PDF con instrucciones de exportar clientes se queda como dato, no tool call.
- **CLI-C21-G02 — NOT_EXECUTED:** MIME falso/zip enorme/ruta traversal queda bloqueado sin dejar archivo accesible.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: A01, A03, P05. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).

> Anexo de implementación: [C21](reports/C21.md) · estado del gate: **PASS** · CLI-C21.
