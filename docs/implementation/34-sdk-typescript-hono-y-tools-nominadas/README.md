# CLI-C34 — SDK TypeScript, Hono y tools nominadas

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/34-sdk-typescript-hono-y-tools-nominadas.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Exponer capacidades internas tipadas sin proxy universal.

## Artefactos previstos
- `packages/sdk/`
- `packages/hono/`
- `packages/agent-tools/`

## Invariante
Todas las interfaces usan el mismo PEP y scopes; ninguna tool genérica aumenta autonomía.

## Dependencias y contrato
Dependencias: CLI-C33. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: H01, S01, P05.

## Tareas originales, sin granularizar
- **CLI-C34-T01:** Crear cliente servidor con DTOs, timeout y errores discriminados. **Aceptación prevista:** No unknown general o respuestas sensibles sin validación runtime.
- **CLI-C34-T02:** Implementar configuración privada y bloqueo de URL/path injection. **Aceptación prevista:** BaseURL aprobada, rutas nominadas y sin credenciales en navegador.
- **CLI-C34-T03:** Crear proxy Hono allowlist exacta método/ruta y tamaño. **Aceptación prevista:** No prefijo que habilite automáticamente nuevos endpoints sensibles.
- **CLI-C34-T04:** Definir tools de lectura/propuesta con input mínimo. **Aceptación prevista:** Actor, tenant, capabilities y destinatario autorizado se resuelven fuera del modelo.
- **CLI-C34-T05:** Crear adaptador MCP opcional con mismo contrato/PEP. **Aceptación prevista:** Instalar MCP no añade admin/send/refund/export_all.
- **CLI-C34-T06:** Publicar tipos y schema fixtures compatibles con nomenclatura padre. **Aceptación prevista:** schemaVersion propio no se confunde con tipos nativos.
- **CLI-C34-T07:** Ejecutar node tests/build y contratos extremo API↔SDK. **Aceptación prevista:** No declarar npm instalable si solo existe diseño o no pasó build.

## Gates previstos, NO ejecutados
- CLI-C34-G01: Tool llama /provider/method o cambia origin mediante URL absoluta: rechazado.
- CLI-C34-G02: Agent solicita approve su propio proposal:403 sin fallback a humano.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
