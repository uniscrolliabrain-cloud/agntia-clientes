# CLI-C20 — WhatsApp oficial bajo capacidad confirmada

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/20-whatsapp-oficial-bajo-capacidad-confirmada.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Conectar conversaciones cumpliendo permisos y condiciones vigentes.

## Artefactos previstos
- `packages/channels/whatsapp/`
- `docs/whatsapp-capabilities.md`
- `tests/whatsapp.test.ts`

## Invariante
No usar versión heredada o regla de ventana recordada sin revalidación actual.

## Dependencias y contrato
Dependencias: CLI-C19. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: H01, A05.

## Tareas originales, sin granularizar
- **CLI-C20-T01:** Revalidar documentación Meta bloqueada por429 y fijar versión de despliegue. **Aceptación prevista:** Si sigue inaccesible/ambigua, canal NOT_VERIFIED y envío deshabilitado.
- **CLI-C20-T02:** Validar tenant→WABA/número/credencial e identidad por canal. **Aceptación prevista:** Número de otro tenant no se selecciona por payload del agente.
- **CLI-C20-T03:** Implementar webhook firmado, replay y bindings de ingreso. **Aceptación prevista:** Challenge no demuestra permiso de mensajes; firma y scope se comprueban.
- **CLI-C20-T04:** Descubrir tipos permitidos, plantillas, ventanas y costes por contexto. **Aceptación prevista:** No hardcodear soporte universal o gratuidad.
- **CLI-C20-T05:** Crear preview/intent y verificar opt-in/supresión/política de destinatario. **Aceptación prevista:** Aprobación de texto libre no autoriza template/categoría diferente.
- **CLI-C20-T06:** Normalizar receipts y resultado incierto del cliente padre/proveedor. **Aceptación prevista:** Sin dedup remoto probado no se hace retry automático tras timeout.
- **CLI-C20-T07:** Probar sandbox autorizado, 429, revocación y mensaje fuera de capacidad. **Aceptación prevista:** Respuesta unsupported clara, sin alternativa de scraping o cuenta personal.

## Gates previstos, NO ejecutados
- CLI-C20-G01: Plantilla/ventana no válida bloquea envío aunque el modelo asegure que se puede.
- CLI-C20-G02: Evento de phone_numberB con conexiónA no se importa al tenantA.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
