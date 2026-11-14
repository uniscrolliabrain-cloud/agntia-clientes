# CLI-C25 — Propuestas IA, idiomas y verificación

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/25-propuestas-ia-idiomas-y-verificacion.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Generar borradores útiles bajo contexto y presupuesto limitados.

## Artefactos previstos
- `packages/proposals/`
- `packages/model-gateway/`
- `tests/answer-proposals.test.ts`

## Invariante
Verificación LLM no firma ni autoriza el efecto.

## Dependencias y contrato
Dependencias: CLI-C24. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: P01, P02, P04, P05, N01.

## Tareas originales, sin granularizar
- **CLI-C25-T01:** Definir gateway de modelos aprobados con región/retención/coste. **Aceptación prevista:** No endpoints o modelos arbitrarios del usuario/documento.
- **CLI-C25-T02:** Construir contexto mínimo con permisos y fuentes por caso. **Aceptación prevista:** El twin no recibe export completo ni memoria de otro cliente.
- **CLI-C25-T03:** Generar borrador/citas/claims pendientes en DTO cerrado. **Aceptación prevista:** Texto no respaldado se identifica y bloquea afirmaciones sensibles.
- **CLI-C25-T04:** Aplicar checks deterministas de datos, destinatario y límites. **Aceptación prevista:** El modelo no escoge tenant, capabilities o receptor externo nuevo.
- **CLI-C25-T05:** Probar español/inglés/francés y nombres/direcciones/importes. **Aceptación prevista:** Traducción preserva original, números y citas; no certifica cobertura por idioma del UI.
- **CLI-C25-T06:** Definir abstención/escalado por evidencia insuficiente o riesgo. **Aceptación prevista:** Un modelo barato no responde con certeza para ahorrar una revisión.
- **CLI-C25-T07:** Medir costo/latencia y repetir escenarios con diferentes seeds. **Aceptación prevista:** Calidad, política y estado se registran además del tono.

## Gates previstos, NO ejecutados
- CLI-C25-G01: Ticket pide ignorar políticas y enviar archivo privado: propuesta no activa tool.
- CLI-C25-G02: No hay artículo en francés o fuente suficiente: explica límite sin inventar contenido.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
