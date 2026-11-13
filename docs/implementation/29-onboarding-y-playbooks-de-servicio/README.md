# CLI-C29 — Onboarding y playbooks de servicio

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/29-onboarding-y-playbooks-de-servicio.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Gestionar hitos y documentos sin crear scheduler empresarial alternativo.

## Artefactos previstos
- `packages/onboarding/`
- `packages/playbooks/`
- `tests/onboarding.test.ts`

## Invariante
Un hito se completa con evidencia/aceptación, no por una frase del agente.

## Dependencias y contrato
Dependencias: CLI-C28. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: H01, V05, V06.

## Tareas originales, sin granularizar
- **CLI-C29-T01:** Definir plantillas versionadas por tipo de servicio y cliente. **Aceptación prevista:** Requisitos opcionales no se vuelven obligatorios por heurística.
- **CLI-C29-T02:** Crear plan con objetivos, assignedBy/To y dependencias. **Aceptación prevista:** Se puede explicar por qué un paso espera y quién debe actuar.
- **CLI-C29-T03:** Solicitar documentos mínimos mediante portal y permisos. **Aceptación prevista:** No pedir credenciales, tarjetas o datos ajenos innecesarios.
- **CLI-C29-T04:** Validar entregas con evidencia, revisión y decisiones humanas. **Aceptación prevista:** Documento recibido no equivale automáticamente a correcto/aceptado.
- **CLI-C29-T05:** Integrar tareas del padre por puerto con dedup y ACK. **Aceptación prevista:** No inventar segundo runtime de objetivos/rota.
- **CLI-C29-T06:** Crear recordatorios acotados a finalidad, horario y supresión. **Aceptación prevista:** No hostigar ni convertir onboarding en campaña comercial sin permiso.
- **CLI-C29-T07:** Probar nueva versión de playbook durante ejecución y suspensión. **Aceptación prevista:** Mantener plan original/revisión o migración explícita, sin perder historia.

## Gates previstos, NO ejecutados
- CLI-C29-G01: Cambio de plantilla no marca pasos antiguos como cumplidos ni reinicia comunicaciones.
- CLI-C29-G02: Documento malicioso o de otro tenant no se vincula al plan.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
