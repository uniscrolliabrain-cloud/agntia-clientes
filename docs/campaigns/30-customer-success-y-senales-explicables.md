# CLI-C30 · Customer success y señales explicables

Estado: **SKELETON_IMPLEMENTED**. Pruebas locales: **EXECUTED** (ver anexo). Secuencia30/42. Dependencia: CLI-C29.

## Objetivo e invariante

Construir observaciones de relación sin scoring opaco o datos inventados.

Invariante: Missing no es cero; un score es una ayuda explicable, no una decisión significativa autónoma.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/success/`
- `packages/health/`
- `tests/health-observations.test.ts`

## Tareas, en orden

### CLI-C30-T01

Definir fuentes aprobadas de uso, soporte, objetivos y relación.

Aceptación: Sin fuente de facturación no se inventan ARR, deuda o renovación.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C30-T02

Crear metric definitions, ventanas, cobertura y freshness.

Aceptación: Diferenciar un dato ausente, atrasado, inválido y cero real.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C30-T03

Calcular score versionado con componentes y reasonCodes.

Aceptación: Cada contribución se puede explicar y reproducir.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C30-T04

Definir success plan y riesgos propuestos con responsable.

Aceptación: No bloquear servicio o discriminar cliente por score del modelo.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C30-T05

Crear cohortes agregadas con mínimos de privacidad.

Aceptación: No fugas entre tenants por benchmarking compartido.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C30-T06

Generar briefing/QBR con fuentes y advertencias.

Aceptación: No se llama churn confirmado a una señal o sentimiento textual estimado.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C30-T07

Probar datos parciales, cambios de definición y extremos.

Aceptación: Histórico conserva su versión y denominador; se muestra incertidumbre.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C30-G01 — NOT_EXECUTED:** Faltan eventos de uso y el score no interpreta ausencia como abandono probado.
- **CLI-C30-G02 — NOT_EXECUTED:** Reclamación legal o tono molesto no activa cancelación ni penalización automática.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: V05, V06, P04. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).

> Anexo de implementación: [C30](reports/C30.md) · estado del gate: **PASS** · CLI-C30.
