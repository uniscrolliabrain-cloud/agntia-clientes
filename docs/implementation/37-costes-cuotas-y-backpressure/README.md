# CLI-C37 — Costes, cuotas y backpressure

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/37-costes-cuotas-y-backpressure.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Aplicar presupuesto transaccional sin degradar aislamiento.

## Artefactos previstos
- `packages/budget/`
- `packages/quotas/`
- `tests/budget-concurrency.test.ts`

## Invariante
Las bolsas Lite/L/XL son hipótesis hasta medir tarifas/volumen; nunca gasto implícito.

## Dependencias y contrato
Dependencias: CLI-C36. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: H01, N01, A07.

## Tareas originales, sin granularizar
- **CLI-C37-T01:** Verificar precios/versiones de proveedores elegidos sin contratar. **Aceptación prevista:** Cotización/moneda/IVA/minimos documentados; unknown bloquea gasto no aprobado.
- **CLI-C37-T02:** Definir reservas por tenant/operación/modelo/canal y reconciliación. **Aceptación prevista:** Concurrentes no gastan dos veces el mismo saldo.
- **CLI-C37-T03:** Instrumentar tokens, retrieval, minutosAV, egress y costes fijos. **Aceptación prevista:** Coste por éxito estricto y por caso abierto, no solo por token.
- **CLI-C37-T04:** Aplicar rate-limit separado de budget y prioridad de colas. **Aceptación prevista:** Ruido de un cliente no paraliza tenants restantes.
- **CLI-C37-T05:** Crear modelo de routing barato/escalado con región/retención/política. **Aceptación prevista:** Fallback no traslada datos a proveedor no aprobado.
- **CLI-C37-T06:** Aplicar límites de Anam/canales y fallback texto o bloqueo. **Aceptación prevista:** Plan insuficiente no activa cargo o suscripción automática.
- **CLI-C37-T07:** Probar agotamiento, factura tardía y ajuste de reserva. **Aceptación prevista:** Receipts/coste observado reconciliables y aviso de desviación real.

## Gates previstos, NO ejecutados
- CLI-C37-G01: Dos workers reservan el último saldo simultáneamente: uno queda bloqueado.
- CLI-C37-G02: Precio/plan mínimo supera bolsa30: función optativa se deshabilita o propone cambio.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
