# CLI-C30 — Customer success y señales explicables

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/30-customer-success-y-senales-explicables.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Construir observaciones de relación sin scoring opaco o datos inventados.

## Artefactos previstos
- `packages/success/`
- `packages/health/`
- `tests/health-observations.test.ts`

## Invariante
Missing no es cero; un score es una ayuda explicable, no una decisión significativa autónoma.

## Dependencias y contrato
Dependencias: CLI-C29. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: V05, V06, P04.

## Tareas originales, sin granularizar
- **CLI-C30-T01:** Definir fuentes aprobadas de uso, soporte, objetivos y relación. **Aceptación prevista:** Sin fuente de facturación no se inventan ARR, deuda o renovación.
- **CLI-C30-T02:** Crear metric definitions, ventanas, cobertura y freshness. **Aceptación prevista:** Diferenciar un dato ausente, atrasado, inválido y cero real.
- **CLI-C30-T03:** Calcular score versionado con componentes y reasonCodes. **Aceptación prevista:** Cada contribución se puede explicar y reproducir.
- **CLI-C30-T04:** Definir success plan y riesgos propuestos con responsable. **Aceptación prevista:** No bloquear servicio o discriminar cliente por score del modelo.
- **CLI-C30-T05:** Crear cohortes agregadas con mínimos de privacidad. **Aceptación prevista:** No fugas entre tenants por benchmarking compartido.
- **CLI-C30-T06:** Generar briefing/QBR con fuentes y advertencias. **Aceptación prevista:** No se llama churn confirmado a una señal o sentimiento textual estimado.
- **CLI-C30-T07:** Probar datos parciales, cambios de definición y extremos. **Aceptación prevista:** Histórico conserva su versión y denominador; se muestra incertidumbre.

## Gates previstos, NO ejecutados
- CLI-C30-G01: Faltan eventos de uso y el score no interpreta ausencia como abandono probado.
- CLI-C30-G02: Reclamación legal o tono molesto no activa cancelación ni penalización automática.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
