# CLI-C35 — Bridge del padre y eventos interoperables

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/35-bridge-del-padre-y-eventos-interoperables.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Preparar integración verificable sin editar agente.

## Artefactos previstos
- `packages/host-bridge/`
- `docs/host-patch-proposal.md`
- `tests/host-contract.test.ts`

## Invariante
No aplicar wiring, cambios de enums o claims en agente sin otra autorización.

## Dependencias y contrato
Dependencias: CLI-C34. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: H01.

## Tareas originales, sin granularizar
- **CLI-C35-T01:** Definir puerto de principal, delegación, approvals, tareas y receipt. **Aceptación prevista:** Cada dependencia host tiene schema y estado verificado/pendiente.
- **CLI-C35-T02:** Mapear SystemEvent nativo schemaVersion1.0/emittedAt/owner/source. **Aceptación prevista:** No enviar evento clientes.* como enum nativo inventado.
- **CLI-C35-T03:** Proyectar ticket/conversation hechos solo cuando confirmados. **Aceptación prevista:** Mensaje accepted no emite ticket.resolved.
- **CLI-C35-T04:** Implementar outbox/consumer inbox/ACK y dedup por domainEventId. **Aceptación prevista:** Replay de integración no crea segunda tarea o mensaje.
- **CLI-C35-T05:** Vincular requestId/correlationId/causationId y tareas/evidencia. **Aceptación prevista:** No borrar origen ni igualar IDs distintos por comodidad.
- **CLI-C35-T06:** Documentar patch propuesto de wiring y diff de contratos. **Aceptación prevista:** Solo archivo documental en este repo; ninguna escritura al padre.
- **CLI-C35-T07:** Probar host fake fiel al contrato y registrar gate real pendiente. **Aceptación prevista:** Simulación no se presenta como integración instalada.

## Gates previstos, NO ejecutados
- CLI-C35-G01: Evento con source.kind no permitido o schemaVersion numérico falla contrato.
- CLI-C35-G02: Host sin approval adapter no permite que middleware invente una aprobación.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
