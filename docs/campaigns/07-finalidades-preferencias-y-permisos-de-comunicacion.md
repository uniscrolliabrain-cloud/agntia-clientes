# CLI-C07 · Finalidades, preferencias y permisos de comunicación

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**. Secuencia7/42. Dependencia: CLI-C06.

## Objetivo e invariante

Crear ledger de tratamiento y supresión revalidable.

Invariante: Un ticket o consentimiento AV no autoriza marketing ni entrenamiento.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/privacy/processing-basis.ts`
- `packages/privacy/consent.ts`
- `tests/preferences.test.ts`

## Tareas, en orden

### CLI-C07-T01

Definir finalidades y bases de tratamiento con revisión humana.

Aceptación: Soporte, grabación, analítica y promoción tienen decisiones separadas.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C07-T02

Definir ConsentEvent append-only y proyección de estado vigente.

Aceptación: Grant/withdraw, alcance, versión y prueba se reconstruyen temporalmente.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C07-T03

Crear preferencias por canal/sujeto y listas de supresión.

Aceptación: Retirada posterior invalida nuevos envíos aunque la propuesta fuera previa.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C07-T04

Clasificar comunicación operacional frente a comercial mediante policy revisable.

Aceptación: Upsell/renovación promocional no se etiqueta soporte para saltar requisitos.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C07-T05

Vincular identidad de sujeto y evidencia de aceptación/invitación.

Aceptación: No aceptar consentimiento enviado por una persona diferente sin representación verificada.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C07-T06

Aplicar permisos a contexto LLM, documentos y canales antes de lectura/efecto.

Aceptación: Una base declarada no concede todas las capacidades del sistema.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C07-T07

Documentar matrix legal pendiente y pruebas de revocación.

Aceptación: Cambios de texto/fecha legal generan revisión, no certificación automática.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C07-G01 — NOT_EXECUTED:** Retirada antes del dispatch bloquea el mensaje en cola.
- **CLI-C07-G02 — NOT_EXECUTED:** Persona acepta grabación y el modelo intenta incluirla en entrenamiento/campaña: denegado.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: L01, L02, L03. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).
