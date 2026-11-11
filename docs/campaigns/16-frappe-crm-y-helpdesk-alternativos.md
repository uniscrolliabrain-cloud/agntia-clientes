# CLI-C16 · Frappe CRM y Helpdesk alternativos

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**. Secuencia16/42. Dependencia: CLI-C15.

## Objetivo e invariante

Diseñar un adaptador por DocTypes/roles sin duplicar el motor de casos.

Invariante: Un solo responsable del estado y reloj SLA por caso.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/adapters/frappe/`
- `docs/adapters/frappe.md`
- `tests/integration/frappe.test.ts`

## Tareas, en orden

### CLI-C16-T01

Fijar sitios/apps/versiones, revisar AGPL y permisos del bot.

Aceptación: No asumir que CRM y Helpdesk están instalados juntos.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C16-T02

Descubrir DocTypes/campos y métodos nominados necesarios.

Aceptación: Sin exposición de execute/RPC genérico a agentes.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C16-T03

Validar tenant→sitio y compañía/contexto aplicable por contrato.

Aceptación: Nombre similar o dominio de email no decide binding.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C16-T04

Mapear contactos/empresas/tickets y campos SLA existentes.

Aceptación: No activar doble cálculo local/remoto del mismo vencimiento.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C16-T05

Implementar lectura y staging con links/fechas/hash.

Aceptación: Estado remoto no se equipara con aprobación humana del middleware.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C16-T06

Definir writes limitados con dry-run, revisión y semántica incierta.

Aceptación: No delete ni submit/document methods fuera del alcance.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C16-T07

Probar instalación sin módulo, rol reducido y dos sitios.

Aceptación: Unsupported honesto; integración real separada de mocks.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C16-G01 — NOT_EXECUTED:** Helpdesk instalado sin CRM no habilita operaciones de ventas por suposición.
- **CLI-C16-G02 — NOT_EXECUTED:** Dos motores SLA discrepan: bloquear cambio hasta decidir AuthorityMap.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: R03, R04, A03. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).
