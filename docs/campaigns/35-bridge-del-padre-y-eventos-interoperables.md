# CLI-C35 · Bridge del padre y eventos interoperables

Estado: **SKELETON_IMPLEMENTED**. Pruebas locales: **EXECUTED** (ver anexo). Secuencia35/42. Dependencia: CLI-C34.

## Objetivo e invariante

Preparar integración verificable sin editar agente.

Invariante: No aplicar wiring, cambios de enums o claims en agente sin otra autorización.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/host-bridge/`
- `docs/host-patch-proposal.md`
- `tests/host-contract.test.ts`

## Tareas, en orden

### CLI-C35-T01

Definir puerto de principal, delegación, approvals, tareas y receipt.

Aceptación: Cada dependencia host tiene schema y estado verificado/pendiente.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C35-T02

Mapear SystemEvent nativo schemaVersion1.0/emittedAt/owner/source.

Aceptación: No enviar evento clientes.* como enum nativo inventado.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C35-T03

Proyectar ticket/conversation hechos solo cuando confirmados.

Aceptación: Mensaje accepted no emite ticket.resolved.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C35-T04

Implementar outbox/consumer inbox/ACK y dedup por domainEventId.

Aceptación: Replay de integración no crea segunda tarea o mensaje.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C35-T05

Vincular requestId/correlationId/causationId y tareas/evidencia.

Aceptación: No borrar origen ni igualar IDs distintos por comodidad.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C35-T06

Documentar patch propuesto de wiring y diff de contratos.

Aceptación: Solo archivo documental en este repo; ninguna escritura al padre.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C35-T07

Probar host fake fiel al contrato y registrar gate real pendiente.

Aceptación: Simulación no se presenta como integración instalada.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C35-G01 — NOT_EXECUTED:** Evento con source.kind no permitido o schemaVersion numérico falla contrato.
- **CLI-C35-G02 — NOT_EXECUTED:** Host sin approval adapter no permite que middleware invente una aprobación.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: H01. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).

> Anexo de implementación: [C35](reports/C35.md) · estado del gate: **NOT_VERIFIED** · CLI-C35.
