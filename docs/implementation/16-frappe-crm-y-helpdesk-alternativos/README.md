# CLI-C16 — Frappe CRM y Helpdesk alternativos

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/16-frappe-crm-y-helpdesk-alternativos.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Diseñar un adaptador por DocTypes/roles sin duplicar el motor de casos.

## Artefactos previstos
- `packages/adapters/frappe/`
- `docs/adapters/frappe.md`
- `tests/integration/frappe.test.ts`

## Invariante
Un solo responsable del estado y reloj SLA por caso.

## Dependencias y contrato
Dependencias: CLI-C15. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: R03, R04, A03.

## Tareas originales, sin granularizar
- **CLI-C16-T01:** Fijar sitios/apps/versiones, revisar AGPL y permisos del bot. **Aceptación prevista:** No asumir que CRM y Helpdesk están instalados juntos.
- **CLI-C16-T02:** Descubrir DocTypes/campos y métodos nominados necesarios. **Aceptación prevista:** Sin exposición de execute/RPC genérico a agentes.
- **CLI-C16-T03:** Validar tenant→sitio y compañía/contexto aplicable por contrato. **Aceptación prevista:** Nombre similar o dominio de email no decide binding.
- **CLI-C16-T04:** Mapear contactos/empresas/tickets y campos SLA existentes. **Aceptación prevista:** No activar doble cálculo local/remoto del mismo vencimiento.
- **CLI-C16-T05:** Implementar lectura y staging con links/fechas/hash. **Aceptación prevista:** Estado remoto no se equipara con aprobación humana del middleware.
- **CLI-C16-T06:** Definir writes limitados con dry-run, revisión y semántica incierta. **Aceptación prevista:** No delete ni submit/document methods fuera del alcance.
- **CLI-C16-T07:** Probar instalación sin módulo, rol reducido y dos sitios. **Aceptación prevista:** Unsupported honesto; integración real separada de mocks.

## Gates previstos, NO ejecutados
- CLI-C16-G01: Helpdesk instalado sin CRM no habilita operaciones de ventas por suposición.
- CLI-C16-G02: Dos motores SLA discrepan: bloquear cambio hasta decidir AuthorityMap.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
