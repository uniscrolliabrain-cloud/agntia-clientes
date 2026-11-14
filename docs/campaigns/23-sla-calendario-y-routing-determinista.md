# CLI-C23 · SLA, calendario y routing determinista

Estado: **SKELETON_IMPLEMENTED**. Pruebas locales: **EXECUTED** (ver anexo). Secuencia23/42. Dependencia: CLI-C22.

## Objetivo e invariante

Calcular plazos y asignación a partir de política versionada.

Invariante: El LLM no inventa fechas de vencimiento ni cobertura humana.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/sla/`
- `packages/routing/`
- `tests/sla-routing.test.ts`

## Tareas, en orden

### CLI-C23-T01

Definir calendario de empresa IANA, horario/fiestas y tzdataVersion.

Aceptación: Cambios DST y fechas no laborables tienen resultados reproducibles.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C23-T02

Definir FRT sustantivo/resolución, prioridades y políticas de pausa.

Aceptación: Acuse automático no cumple FRT sustantivo sin regla explícita.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C23-T03

Calcular dueAt desde eventos y policyVersion.

Aceptación: Recalcular no altera histórico sin nueva revisión.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C23-T04

Implementar routing por capacidad, carga y contrato.

Aceptación: Nombre de agente o emoción inferida del cliente no concede prioridad/permiso.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C23-T05

Crear timers/jobs con dedup, lease y revalidación.

Aceptación: Recordatorio/escalado se ejecuta una vez lógicamente o queda reconciliable.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C23-T06

Integrar escalado humano y señales al runtime padre.

Aceptación: No aparece otro scheduler empresarial ni actividad ficticia.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C23-T07

Probar pausas, reapertura, cambio de contrato y cobertura ausente.

Aceptación: Reporte muestra motivo del vencimiento y responsable real.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C23-G01 — NOT_EXECUTED:** Reapertura tras horario de invierno/verano conserva cálculo y versión documentados.
- **CLI-C23-G02 — NOT_EXECUTED:** No hay humano de guardia: UI no promete atención inmediata ni cierra por SLA.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: R04, V01, V05. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).

> Anexo de implementación: [C23](reports/C23.md) · estado del gate: **PASS** · CLI-C23.
