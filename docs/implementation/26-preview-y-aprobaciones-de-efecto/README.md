# CLI-C26 — Preview y aprobaciones de efecto

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/26-preview-y-aprobaciones-de-efecto.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Vincular autorización humana al payload exacto y vigente.

## Artefactos previstos
- `packages/approvals/`
- `packages/outbound/preview.ts`
- `tests/approval-binding.test.ts`

## Invariante
El actor proponente no puede fabricar aprobación o ampliar el alcance aprobado.

## Dependencias y contrato
Dependencias: CLI-C25. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: H01, P01, V02.

## Tareas originales, sin granularizar
- **CLI-C26-T01:** Implementar preview puro con texto, destinatario, canal y adjuntos. **Aceptación prevista:** No crea upload/mensaje/job remoto ni gasta writes.
- **CLI-C26-T02:** Canonicalizar propuesta y calcular hashes de payload/datos/policy. **Aceptación prevista:** Orden de JSON no altera hash semántico definido; cambios materiales sí.
- **CLI-C26-T03:** Integrar approval adapter local verificado y contrato futuro del padre. **Aceptación prevista:** Sin servicio de aprobación válido se deniega escritura sensible.
- **CLI-C26-T04:** Validar reviewer humano, tenant, separación de funciones y caducidad. **Aceptación prevista:** Agent no aprueba sus propios registros por elegir nombre de humano.
- **CLI-C26-T05:** Implementar commit con expectedVersion/idempotencyKey y revalidación final. **Aceptación prevista:** Cambios de receptor, KB, adjuntos o policy invalidan la aprobación.
- **CLI-C26-T06:** Definir mandato futuro de FAQ automático sin habilitarlo por defecto. **Aceptación prevista:** Cada excepción de revisión requiere alcance, prueba y política aprobada.
- **CLI-C26-T07:** Probar doble click, aprobación cruzada, revocación y voz. **Aceptación prevista:** Un sí por Anam es propuesta; UI autenticada confirma el piloto.

## Gates previstos, NO ejecutados
- CLI-C26-G01: Approval de A se usa en mensaje B con hash igual: tenant/capacidad bloquean.
- CLI-C26-G02: Editar una palabra o adjunto tras approval provoca409/revisión, no envío actualizado.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
