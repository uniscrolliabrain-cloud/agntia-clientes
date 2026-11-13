# CLI-C21 — Inbox, webhooks y evidencia adjunta

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/21-inbox-webhooks-y-evidencia-adjunta.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Convertir entrada no confiable en hechos trazables y sanitizados.

## Artefactos previstos
- `packages/inbox/`
- `packages/attachments/`
- `tests/inbox-attachments.test.ts`

## Invariante
Contenido entrante nunca altera identidad, policy o catálogo de tools.

## Dependencias y contrato
Dependencias: CLI-C20. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: A01, A03, P05.

## Tareas originales, sin granularizar
- **CLI-C21-T01:** Validar firma, timestamp, replay y tamaño antes de procesar webhook. **Aceptación prevista:** Fallo de verificación no dispara retrieval ni inferencia pagada.
- **CLI-C21-T02:** Resolver conexión/tenant desde registro y dedup persistente. **Aceptación prevista:** ExternalEventId solo es único dentro de su contexto documentado.
- **CLI-C21-T03:** Normalizar source/occurred/receivedAt, visibilidad y hash. **Aceptación prevista:** Orden temporal remoto no suplanta secuencia local ni pierde zona.
- **CLI-C21-T04:** Descargar adjuntos backend con egress controlado y límites. **Aceptación prevista:** No redirect a metadata, ruta local o URL firmada de otro tenant.
- **CLI-C21-T05:** Aplicar MIME real, antivirus/cuarentena y sanitización. **Aceptación prevista:** Archivo no escaneado/corrupto no se envía al modelo como confiable.
- **CLI-C21-T06:** Vincular original/documentRef y política de retención por objeto. **Aceptación prevista:** Hash verificable y recuperación autorizada; no duplicación binaria innecesaria.
- **CLI-C21-T07:** Probar adjuntos adversariales, notas internas y eventos reordenados. **Aceptación prevista:** No se ejecutan instrucciones ni se publica contenido privado.

## Gates previstos, NO ejecutados
- CLI-C21-G01: PDF con instrucciones de exportar clientes se queda como dato, no tool call.
- CLI-C21-G02: MIME falso/zip enorme/ruta traversal queda bloqueado sin dejar archivo accesible.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
