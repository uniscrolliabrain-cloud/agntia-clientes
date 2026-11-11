# CLI-C20 · WhatsApp oficial bajo capacidad confirmada

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**. Secuencia20/42. Dependencia: CLI-C19.

## Objetivo e invariante

Conectar conversaciones cumpliendo permisos y condiciones vigentes.

Invariante: No usar versión heredada o regla de ventana recordada sin revalidación actual.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/channels/whatsapp/`
- `docs/whatsapp-capabilities.md`
- `tests/whatsapp.test.ts`

## Tareas, en orden

### CLI-C20-T01

Revalidar documentación Meta bloqueada por429 y fijar versión de despliegue.

Aceptación: Si sigue inaccesible/ambigua, canal NOT_VERIFIED y envío deshabilitado.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C20-T02

Validar tenant→WABA/número/credencial e identidad por canal.

Aceptación: Número de otro tenant no se selecciona por payload del agente.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C20-T03

Implementar webhook firmado, replay y bindings de ingreso.

Aceptación: Challenge no demuestra permiso de mensajes; firma y scope se comprueban.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C20-T04

Descubrir tipos permitidos, plantillas, ventanas y costes por contexto.

Aceptación: No hardcodear soporte universal o gratuidad.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C20-T05

Crear preview/intent y verificar opt-in/supresión/política de destinatario.

Aceptación: Aprobación de texto libre no autoriza template/categoría diferente.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C20-T06

Normalizar receipts y resultado incierto del cliente padre/proveedor.

Aceptación: Sin dedup remoto probado no se hace retry automático tras timeout.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C20-T07

Probar sandbox autorizado, 429, revocación y mensaje fuera de capacidad.

Aceptación: Respuesta unsupported clara, sin alternativa de scraping o cuenta personal.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C20-G01 — NOT_EXECUTED:** Plantilla/ventana no válida bloquea envío aunque el modelo asegure que se puede.
- **CLI-C20-G02 — NOT_EXECUTED:** Evento de phone_numberB con conexiónA no se importa al tenantA.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: H01, A05. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).
