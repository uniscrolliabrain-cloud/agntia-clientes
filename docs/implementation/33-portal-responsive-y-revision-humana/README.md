# CLI-C33 — Portal responsive y revisión humana

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/33-portal-responsive-y-revision-humana.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Construir superficies simples para owner, operador y contacto externo.

## Artefactos previstos
- `apps/portal/`
- `docs/ux-flows.md`
- `tests/browser/portal.test.ts`

## Invariante
La UI nunca convierte loading, accepted o closed en resolución verificada.

## Dependencias y contrato
Dependencias: CLI-C32. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: V02, V05, N01.

## Tareas originales, sin granularizar
- **CLI-C33-T01:** Diseñar navegación inbox/casos/ficha/reportes con rol visible. **Aceptación prevista:** Contacto externo no ve listas/globales internas ni datos de compañeros.
- **CLI-C33-T02:** Construir columna de chat/twin y panel móvil accesible. **Aceptación prevista:** Edición y revisión funcionan con teclado/táctil sin depender de hover.
- **CLI-C33-T03:** Mostrar notas internas separadas, citas, stale y conflictos. **Aceptación prevista:** Vista previa corresponde exactamente al payload que saldrá.
- **CLI-C33-T04:** Implementar aprobación, invalidación, doble click y estados async. **Aceptación prevista:** Resultado incierto ofrece reconciliación y no envío repetido.
- **CLI-C33-T05:** Integrar Supabase login/cambio de tenant/sesión expirada. **Aceptación prevista:** Caché, downloads y realtime se limpian/revalidan al cambiar contexto.
- **CLI-C33-T06:** Implementar ES/EN/FR y fallback AV/texto con accesibilidad. **Aceptación prevista:** Texto, foco/subtítulos/lector y layout móvil se verifican con escenarios reales.
- **CLI-C33-T07:** Probar flujos owner/operador/contacto y red lenta en navegador. **Aceptación prevista:** Evidencia de screenshots/trace solo con datos sintéticos y sin tokens.

## Gates previstos, NO ejecutados
- CLI-C33-G01: Cambiar tenant en pestaña mientras otro panel tiene borrador invalida aprobación/scope.
- CLI-C33-G02: Pantalla pequeña permite leer citas y editar antes de confirmar sin taps ambiguos.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
