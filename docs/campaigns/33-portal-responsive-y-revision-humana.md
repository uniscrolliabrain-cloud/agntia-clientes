# CLI-C33 · Portal responsive y revisión humana

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**. Secuencia33/42. Dependencia: CLI-C32.

## Objetivo e invariante

Construir superficies simples para owner, operador y contacto externo.

Invariante: La UI nunca convierte loading, accepted o closed en resolución verificada.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `apps/portal/`
- `docs/ux-flows.md`
- `tests/browser/portal.test.ts`

## Tareas, en orden

### CLI-C33-T01

Diseñar navegación inbox/casos/ficha/reportes con rol visible.

Aceptación: Contacto externo no ve listas/globales internas ni datos de compañeros.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C33-T02

Construir columna de chat/twin y panel móvil accesible.

Aceptación: Edición y revisión funcionan con teclado/táctil sin depender de hover.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C33-T03

Mostrar notas internas separadas, citas, stale y conflictos.

Aceptación: Vista previa corresponde exactamente al payload que saldrá.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C33-T04

Implementar aprobación, invalidación, doble click y estados async.

Aceptación: Resultado incierto ofrece reconciliación y no envío repetido.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C33-T05

Integrar Supabase login/cambio de tenant/sesión expirada.

Aceptación: Caché, downloads y realtime se limpian/revalidan al cambiar contexto.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C33-T06

Implementar ES/EN/FR y fallback AV/texto con accesibilidad.

Aceptación: Texto, foco/subtítulos/lector y layout móvil se verifican con escenarios reales.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C33-T07

Probar flujos owner/operador/contacto y red lenta en navegador.

Aceptación: Evidencia de screenshots/trace solo con datos sintéticos y sin tokens.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C33-G01 — NOT_EXECUTED:** Cambiar tenant en pestaña mientras otro panel tiene borrador invalida aprobación/scope.
- **CLI-C33-G02 — NOT_EXECUTED:** Pantalla pequeña permite leer citas y editar antes de confirmar sin taps ambiguos.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: V02, V05, N01. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).
