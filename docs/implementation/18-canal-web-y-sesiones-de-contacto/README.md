# CLI-C18 — Canal web y sesiones de contacto

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/18-canal-web-y-sesiones-de-contacto.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Atender desde portal/widget sin conceder acceso a datos internos.

## Artefactos previstos
- `apps/portal/intake/`
- `packages/channels/web/`
- `tests/web-channel.test.ts`

## Invariante
Ingreso público acotado no crea membership ni identidad verificada del cliente.

## Dependencias y contrato
Dependencias: CLI-C17. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: S01, S02, A01.

## Tareas originales, sin granularizar
- **CLI-C18-T01:** Definir sesión Supabase de portal y flujo opcional anónimo restringido. **Aceptación prevista:** Visitante solo puede iniciar/seguir su intake según prueba de servidor.
- **CLI-C18-T02:** Provisionar binding formulario/inbox/tenant por configuración. **Aceptación prevista:** Campo tenantId del widget no dirige datos a otro cliente.
- **CLI-C18-T03:** Implementar rate-limit, antiabuso y límites de texto/adjuntos. **Aceptación prevista:** Spam no agota presupuesto de inferencia ni rellena contexto de otros tenants.
- **CLI-C18-T04:** Definir vinculación explícita al Contact tras verificación/invitación. **Aceptación prevista:** Compartir email no da acceso al historial ya existente.
- **CLI-C18-T05:** Persistir mensajes y sesiones con ACK, reconexión y dedup. **Aceptación prevista:** Refrescar o reenviar mismo evento no duplica ticket.
- **CLI-C18-T06:** Aplicar ACL a Realtime y cierre/revocación de sesión. **Aceptación prevista:** Un canal suscrito a A no recibe evento de B ni al cambiar de tenant.
- **CLI-C18-T07:** Probar teclado/móvil, pérdida de conexión y contacto sin cuenta. **Aceptación prevista:** Hay fallback útil sin revelar información privada.

## Gates previstos, NO ejecutados
- CLI-C18-G01: Usuario altera tenant en JS o identificador de conversación: no accede a otro hilo.
- CLI-C18-G02: Visitante anónimo intenta knowledge privado o export: capacidad denegada.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
