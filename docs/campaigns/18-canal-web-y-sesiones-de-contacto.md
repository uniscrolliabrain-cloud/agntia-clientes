# CLI-C18 · Canal web y sesiones de contacto

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**. Secuencia18/42. Dependencia: CLI-C17.

## Objetivo e invariante

Atender desde portal/widget sin conceder acceso a datos internos.

Invariante: Ingreso público acotado no crea membership ni identidad verificada del cliente.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `apps/portal/intake/`
- `packages/channels/web/`
- `tests/web-channel.test.ts`

## Tareas, en orden

### CLI-C18-T01

Definir sesión Supabase de portal y flujo opcional anónimo restringido.

Aceptación: Visitante solo puede iniciar/seguir su intake según prueba de servidor.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C18-T02

Provisionar binding formulario/inbox/tenant por configuración.

Aceptación: Campo tenantId del widget no dirige datos a otro cliente.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C18-T03

Implementar rate-limit, antiabuso y límites de texto/adjuntos.

Aceptación: Spam no agota presupuesto de inferencia ni rellena contexto de otros tenants.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C18-T04

Definir vinculación explícita al Contact tras verificación/invitación.

Aceptación: Compartir email no da acceso al historial ya existente.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C18-T05

Persistir mensajes y sesiones con ACK, reconexión y dedup.

Aceptación: Refrescar o reenviar mismo evento no duplica ticket.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C18-T06

Aplicar ACL a Realtime y cierre/revocación de sesión.

Aceptación: Un canal suscrito a A no recibe evento de B ni al cambiar de tenant.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C18-T07

Probar teclado/móvil, pérdida de conexión y contacto sin cuenta.

Aceptación: Hay fallback útil sin revelar información privada.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C18-G01 — NOT_EXECUTED:** Usuario altera tenant en JS o identificador de conversación: no accede a otro hilo.
- **CLI-C18-G02 — NOT_EXECUTED:** Visitante anónimo intenta knowledge privado o export: capacidad denegada.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: S01, S02, A01. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).
