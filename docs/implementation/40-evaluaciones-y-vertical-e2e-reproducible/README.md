# CLI-C40 — Evaluaciones y vertical E2E reproducible

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/40-evaluaciones-y-vertical-e2e-reproducible.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Validar negocios, estado protegido y recuperación con fixtures.

## Artefactos previstos
- `tests/e2e/`
- `tests/evals/`
- `docs/e2e-evidence.md`

## Invariante
Mock y juez de lenguaje no sustituyen contrato de estado ni integración real.

## Dependencias y contrato
Dependencias: CLI-C39. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: P01, P02, P03, P04, P06.

## Tareas originales, sin granularizar
- **CLI-C40-T01:** Crear fixtures propios A/B/P, roles humanos y twins con mandatos. **Aceptación prevista:** Sin datos/cuentas ajenas ni material no comercial copiado.
- **CLI-C40-T02:** Ejecutar casos A–I del plan, reseteando backend y seeds. **Aceptación prevista:** Estado inicial/final, llamadas permitidas/prohibidas y receipts registrados.
- **CLI-C40-T03:** Combinar assertions deterministas con juez lingüístico calibrado. **Aceptación prevista:** Un tono perfecto no compensa fallo de confidencialidad/acción.
- **CLI-C40-T04:** Probar varias seeds/turnos ES/EN/FR y cliente que actúa concurrentemente. **Aceptación prevista:** No trasladar score de benchmark o idioma distinto al producto.
- **CLI-C40-T05:** Inyectar caídas de proveedor/DB/worker y revocaciones. **Aceptación prevista:** Sin doble envío, pérdida de audit o avance de cursor indebido.
- **CLI-C40-T06:** Medir cobertura/latencia/coste y diferenciar fake frente a real. **Aceptación prevista:** Cada conector sin laboratorio queda NOT_VERIFIED/deshabilitado.
- **CLI-C40-T07:** Preparar demo reproducible de portal externo e integrado por contrato. **Aceptación prevista:** Sin tocar padre; host real solo si otro encargo autoriza el wiring.

## Gates previstos, NO ejecutados
- CLI-C40-G01: Respuesta final correcta con acción prohibida intermedia falla la evaluación.
- CLI-C40-G02: E2E parece pasar pero no hay recibo del proveedor: no se acredita entrega.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
