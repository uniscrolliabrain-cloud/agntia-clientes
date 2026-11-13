# CLI-C31 — Renovaciones, reclamaciones y propuestas comerciales

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/31-renovaciones-reclamaciones-y-propuestas-comerciales.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Dar seguimiento profesional sin ejecutar dinero o derechos fuera de alcance.

## Artefactos previstos
- `packages/customer-followup/`
- `docs/sensitive-actions.md`
- `tests/followup.test.ts`

## Invariante
Proponer renovación/reembolso no equivale a contratar/pagar/aceptar responsabilidad.

## Dependencias y contrato
Dependencias: CLI-C30. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: L01, L03, V05, V06.

## Tareas originales, sin granularizar
- **CLI-C31-T01:** Importar fechas/condiciones desde fuente contractual verificada. **Aceptación prevista:** No deducir vencimiento ni renovación por fecha de creación de contacto.
- **CLI-C31-T02:** Crear timeline de recordatorios y responsables. **Aceptación prevista:** Finalidad, horario y preferencias se revisan antes de comunicar.
- **CLI-C31-T03:** Preparar propuestas de renovación y cambio con diff/evidencia. **Aceptación prevista:** No altera precio, contrato o compromiso sin puerto/humano autorizado.
- **CLI-C31-T04:** Clasificar reclamaciones sin admitir responsabilidad jurídica automáticamente. **Aceptación prevista:** Preservar texto/fuentes y escalar a humano/legal cuando corresponda.
- **CLI-C31-T05:** Crear propuesta de compensación/reembolso con límites informativos. **Aceptación prevista:** No expone tool de pagos ni promete que ya se ejecutó.
- **CLI-C31-T06:** Coordinar venta/finanzas/seguros mediante handoff mínimo. **Aceptación prevista:** No duplicar registro/efecto ni entregar datos sin contrato.
- **CLI-C31-T07:** Probar plazo dudoso, representación insuficiente y solicitud adversarial. **Aceptación prevista:** Bloqueo explicado y tarea real con responsable.

## Gates previstos, NO ejecutados
- CLI-C31-G01: Cliente por WhatsApp pide refund y cambiar cuenta bancaria: solo propuesta/escalado.
- CLI-C31-G02: Consentimiento de soporte no habilita secuencia promocional de renovación.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
