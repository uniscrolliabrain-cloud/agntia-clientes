# CLI-C23 — SLA, calendario y routing determinista

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/23-sla-calendario-y-routing-determinista.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Calcular plazos y asignación a partir de política versionada.

## Artefactos previstos
- `packages/sla/`
- `packages/routing/`
- `tests/sla-routing.test.ts`

## Invariante
El LLM no inventa fechas de vencimiento ni cobertura humana.

## Dependencias y contrato
Dependencias: CLI-C22. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: R04, V01, V05.

## Tareas originales, sin granularizar
- **CLI-C23-T01:** Definir calendario de empresa IANA, horario/fiestas y tzdataVersion. **Aceptación prevista:** Cambios DST y fechas no laborables tienen resultados reproducibles.
- **CLI-C23-T02:** Definir FRT sustantivo/resolución, prioridades y políticas de pausa. **Aceptación prevista:** Acuse automático no cumple FRT sustantivo sin regla explícita.
- **CLI-C23-T03:** Calcular dueAt desde eventos y policyVersion. **Aceptación prevista:** Recalcular no altera histórico sin nueva revisión.
- **CLI-C23-T04:** Implementar routing por capacidad, carga y contrato. **Aceptación prevista:** Nombre de agente o emoción inferida del cliente no concede prioridad/permiso.
- **CLI-C23-T05:** Crear timers/jobs con dedup, lease y revalidación. **Aceptación prevista:** Recordatorio/escalado se ejecuta una vez lógicamente o queda reconciliable.
- **CLI-C23-T06:** Integrar escalado humano y señales al runtime padre. **Aceptación prevista:** No aparece otro scheduler empresarial ni actividad ficticia.
- **CLI-C23-T07:** Probar pausas, reapertura, cambio de contrato y cobertura ausente. **Aceptación prevista:** Reporte muestra motivo del vencimiento y responsable real.

## Gates previstos, NO ejecutados
- CLI-C23-G01: Reapertura tras horario de invierno/verano conserva cálculo y versión documentados.
- CLI-C23-G02: No hay humano de guardia: UI no promete atención inmediata ni cierra por SLA.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
