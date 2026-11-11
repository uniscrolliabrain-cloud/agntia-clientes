# CLI-C14 · Chatwoot writeback seguro

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**. Secuencia14/42. Dependencia: CLI-C13.

## Objetivo e invariante

Crear mensajes y cambios de caso mediante intents controlados.

Invariante: Crear una fila de mensaje no prueba entrega ni autoriza retry.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/adapters/chatwoot/write.ts`
- `packages/reconcile/chatwoot.ts`
- `tests/chatwoot-write.test.ts`

## Tareas, en orden

### CLI-C14-T01

Confirmar create/status/receipt disponibles en instalación real.

Aceptación: Contrato distingue persistencia del mensaje y envío asíncrono.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C14-T02

Implementar dry-run de respuesta con receptor, visibility y adjuntos.

Aceptación: Sin publicación, job remoto ni gasto inesperado.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C14-T03

Vincular aprobación y autoridad única de dispatch.

Aceptación: Padre y backend no mandan el mismo reply por rutas distintas.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C14-T04

Persistir intent/outbox antes de HTTP con key/hash/revisión.

Aceptación: Replay devuelve el intent sin crear otro mensaje lógico.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C14-T05

Reconciliar timeout por IDs/ref verificables del backend.

Aceptación: Si no hay búsqueda fiable se bloquea retry y se escala.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C14-T06

Aplicar límites de create/update permitidos; excluir delete/retry arbitrario.

Aceptación: Tools no acceden a métodos de administración o pipeline interno.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C14-T07

Probar crash tras create, doble click y handoff concurrente.

Aceptación: Un mensaje o estado incierto bloqueado; ninguna duplicación encubierta.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C14-G01 — NOT_EXECUTED:** Backend acepta mensaje pero se pierde respuesta: no se llama retry automáticamente.
- **CLI-C14-G02 — NOT_EXECUTED:** Se aprueba nota interna y luego cambia visibility a pública: hash/revisión invalida.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: R01, A01. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).
