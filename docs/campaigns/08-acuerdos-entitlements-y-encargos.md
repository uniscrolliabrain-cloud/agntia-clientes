# CLI-C08 · Acuerdos, entitlements y encargos

Estado: **SKELETON_IMPLEMENTED**. Pruebas locales: **EXECUTED** (ver anexo). Secuencia8/42. Dependencia: CLI-C07.

## Objetivo e invariante

Materializar la frontera comercial y de responsabilidad del SaaS.

Invariante: Contrato comercial, aprobación editorial y permiso de datos son hechos diferentes.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/service-agreements/`
- `packages/work-orders/`
- `tests/entitlements.test.ts`

## Tareas, en orden

### CLI-C08-T01

Definir acuerdos con operador, tenant, servicios, SLA, horario y responsables.

Aceptación: No se promete atención humana24/7 sin cobertura real.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C08-T02

Definir entitlements y límites de volumen/canal/AV por plan.

Aceptación: Plan barato mantiene seguridad; una función no contratada devuelve estado explícito.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C08-T03

Definir WorkOrder y aceptación de entregable con fuentes y alcance.

Aceptación: Se distingue quien pide, ejecuta, revisa y acepta.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C08-T04

Asignar un único responsable por envío/actualización compartida con otro servicio.

Aceptación: Dos rutas de entrada generan el mismo intent o conflicto, nunca doble dispatch.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C08-T05

Implementar alta de tenant/miembros solo por provisioning autorizado.

Aceptación: Contactos importados no se convierten en usuarios ni reciben invitación automática.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C08-T06

Definir suspensión, salida, exportación y conservación revisadas.

Aceptación: Impago no desencadena borrado/efectos sensibles decididos por modelo.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C08-T07

Probar cliente externo con portal y binding canónico backend.

Aceptación: Misma policy que integrado sin requerir UI AgntiaPro al cliente.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C08-G01 — NOT_EXECUTED:** Cliente externo compra servicio y trata de acceder a otro tenant con su entitlement.
- **CLI-C08-G02 — NOT_EXECUTED:** Cambio de plan con job pendiente revalida alcance/coste y conserva receipt.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: H01, V05, V06. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).

> Anexo de implementación: [C08](reports/C08.md) · estado del gate: **PASS** · CLI-C08.
