# CLI-C31 · Renovaciones, reclamaciones y propuestas comerciales

Estado: **SKELETON_IMPLEMENTED**. Pruebas locales: **EXECUTED** (ver anexo). Secuencia31/42. Dependencia: CLI-C30.

## Objetivo e invariante

Dar seguimiento profesional sin ejecutar dinero o derechos fuera de alcance.

Invariante: Proponer renovación/reembolso no equivale a contratar/pagar/aceptar responsabilidad.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/customer-followup/`
- `docs/sensitive-actions.md`
- `tests/followup.test.ts`

## Tareas, en orden

### CLI-C31-T01

Importar fechas/condiciones desde fuente contractual verificada.

Aceptación: No deducir vencimiento ni renovación por fecha de creación de contacto.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C31-T02

Crear timeline de recordatorios y responsables.

Aceptación: Finalidad, horario y preferencias se revisan antes de comunicar.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C31-T03

Preparar propuestas de renovación y cambio con diff/evidencia.

Aceptación: No altera precio, contrato o compromiso sin puerto/humano autorizado.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C31-T04

Clasificar reclamaciones sin admitir responsabilidad jurídica automáticamente.

Aceptación: Preservar texto/fuentes y escalar a humano/legal cuando corresponda.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C31-T05

Crear propuesta de compensación/reembolso con límites informativos.

Aceptación: No expone tool de pagos ni promete que ya se ejecutó.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C31-T06

Coordinar venta/finanzas/seguros mediante handoff mínimo.

Aceptación: No duplicar registro/efecto ni entregar datos sin contrato.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C31-T07

Probar plazo dudoso, representación insuficiente y solicitud adversarial.

Aceptación: Bloqueo explicado y tarea real con responsable.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C31-G01 — NOT_EXECUTED:** Cliente por WhatsApp pide refund y cambiar cuenta bancaria: solo propuesta/escalado.
- **CLI-C31-G02 — NOT_EXECUTED:** Consentimiento de soporte no habilita secuencia promocional de renovación.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: L01, L03, V05, V06. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).

> Anexo de implementación: [C31](reports/C31.md) · estado del gate: **BLOCKED** · CLI-C31.
