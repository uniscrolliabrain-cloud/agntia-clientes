# CLI-C25 · Propuestas IA, idiomas y verificación

Estado: **SKELETON_IMPLEMENTED**. Pruebas locales: **EXECUTED** (ver anexo). Secuencia25/42. Dependencia: CLI-C24.

## Objetivo e invariante

Generar borradores útiles bajo contexto y presupuesto limitados.

Invariante: Verificación LLM no firma ni autoriza el efecto.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/proposals/`
- `packages/model-gateway/`
- `tests/answer-proposals.test.ts`

## Tareas, en orden

### CLI-C25-T01

Definir gateway de modelos aprobados con región/retención/coste.

Aceptación: No endpoints o modelos arbitrarios del usuario/documento.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C25-T02

Construir contexto mínimo con permisos y fuentes por caso.

Aceptación: El twin no recibe export completo ni memoria de otro cliente.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C25-T03

Generar borrador/citas/claims pendientes en DTO cerrado.

Aceptación: Texto no respaldado se identifica y bloquea afirmaciones sensibles.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C25-T04

Aplicar checks deterministas de datos, destinatario y límites.

Aceptación: El modelo no escoge tenant, capabilities o receptor externo nuevo.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C25-T05

Probar español/inglés/francés y nombres/direcciones/importes.

Aceptación: Traducción preserva original, números y citas; no certifica cobertura por idioma del UI.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C25-T06

Definir abstención/escalado por evidencia insuficiente o riesgo.

Aceptación: Un modelo barato no responde con certeza para ahorrar una revisión.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C25-T07

Medir costo/latencia y repetir escenarios con diferentes seeds.

Aceptación: Calidad, política y estado se registran además del tono.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C25-G01 — NOT_EXECUTED:** Ticket pide ignorar políticas y enviar archivo privado: propuesta no activa tool.
- **CLI-C25-G02 — NOT_EXECUTED:** No hay artículo en francés o fuente suficiente: explica límite sin inventar contenido.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: P01, P02, P04, P05, N01. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).

> Anexo de implementación: [C25](reports/C25.md) · estado del gate: **PASS** · CLI-C25.
