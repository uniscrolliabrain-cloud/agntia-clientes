# CLI-C29 · Onboarding y playbooks de servicio

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**. Secuencia29/42. Dependencia: CLI-C28.

## Objetivo e invariante

Gestionar hitos y documentos sin crear scheduler empresarial alternativo.

Invariante: Un hito se completa con evidencia/aceptación, no por una frase del agente.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/onboarding/`
- `packages/playbooks/`
- `tests/onboarding.test.ts`

## Tareas, en orden

### CLI-C29-T01

Definir plantillas versionadas por tipo de servicio y cliente.

Aceptación: Requisitos opcionales no se vuelven obligatorios por heurística.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C29-T02

Crear plan con objetivos, assignedBy/To y dependencias.

Aceptación: Se puede explicar por qué un paso espera y quién debe actuar.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C29-T03

Solicitar documentos mínimos mediante portal y permisos.

Aceptación: No pedir credenciales, tarjetas o datos ajenos innecesarios.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C29-T04

Validar entregas con evidencia, revisión y decisiones humanas.

Aceptación: Documento recibido no equivale automáticamente a correcto/aceptado.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C29-T05

Integrar tareas del padre por puerto con dedup y ACK.

Aceptación: No inventar segundo runtime de objetivos/rota.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C29-T06

Crear recordatorios acotados a finalidad, horario y supresión.

Aceptación: No hostigar ni convertir onboarding en campaña comercial sin permiso.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C29-T07

Probar nueva versión de playbook durante ejecución y suspensión.

Aceptación: Mantener plan original/revisión o migración explícita, sin perder historia.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C29-G01 — NOT_EXECUTED:** Cambio de plantilla no marca pasos antiguos como cumplidos ni reinicia comunicaciones.
- **CLI-C29-G02 — NOT_EXECUTED:** Documento malicioso o de otro tenant no se vincula al plan.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: H01, V05, V06. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).
