# CLI-C26 · Preview y aprobaciones de efecto

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**. Secuencia26/42. Dependencia: CLI-C25.

## Objetivo e invariante

Vincular autorización humana al payload exacto y vigente.

Invariante: El actor proponente no puede fabricar aprobación o ampliar el alcance aprobado.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/approvals/`
- `packages/outbound/preview.ts`
- `tests/approval-binding.test.ts`

## Tareas, en orden

### CLI-C26-T01

Implementar preview puro con texto, destinatario, canal y adjuntos.

Aceptación: No crea upload/mensaje/job remoto ni gasta writes.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C26-T02

Canonicalizar propuesta y calcular hashes de payload/datos/policy.

Aceptación: Orden de JSON no altera hash semántico definido; cambios materiales sí.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C26-T03

Integrar approval adapter local verificado y contrato futuro del padre.

Aceptación: Sin servicio de aprobación válido se deniega escritura sensible.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C26-T04

Validar reviewer humano, tenant, separación de funciones y caducidad.

Aceptación: Agent no aprueba sus propios registros por elegir nombre de humano.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C26-T05

Implementar commit con expectedVersion/idempotencyKey y revalidación final.

Aceptación: Cambios de receptor, KB, adjuntos o policy invalidan la aprobación.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C26-T06

Definir mandato futuro de FAQ automático sin habilitarlo por defecto.

Aceptación: Cada excepción de revisión requiere alcance, prueba y política aprobada.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C26-T07

Probar doble click, aprobación cruzada, revocación y voz.

Aceptación: Un sí por Anam es propuesta; UI autenticada confirma el piloto.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C26-G01 — NOT_EXECUTED:** Approval de A se usa en mensaje B con hash igual: tenant/capacidad bloquean.
- **CLI-C26-G02 — NOT_EXECUTED:** Editar una palabra o adjunto tras approval provoca409/revisión, no envío actualizado.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: H01, P01, V02. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).
