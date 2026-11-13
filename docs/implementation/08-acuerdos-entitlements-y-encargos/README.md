# CLI-C08 — Acuerdos, entitlements y encargos

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/08-acuerdos-entitlements-y-encargos.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Materializar la frontera comercial y de responsabilidad del SaaS.

## Artefactos previstos
- `packages/service-agreements/`
- `packages/work-orders/`
- `tests/entitlements.test.ts`

## Invariante
Contrato comercial, aprobación editorial y permiso de datos son hechos diferentes.

## Dependencias y contrato
Dependencias: CLI-C07. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: H01, V05, V06.

## Tareas originales, sin granularizar
- **CLI-C08-T01:** Definir acuerdos con operador, tenant, servicios, SLA, horario y responsables. **Aceptación prevista:** No se promete atención humana24/7 sin cobertura real.
- **CLI-C08-T02:** Definir entitlements y límites de volumen/canal/AV por plan. **Aceptación prevista:** Plan barato mantiene seguridad; una función no contratada devuelve estado explícito.
- **CLI-C08-T03:** Definir WorkOrder y aceptación de entregable con fuentes y alcance. **Aceptación prevista:** Se distingue quien pide, ejecuta, revisa y acepta.
- **CLI-C08-T04:** Asignar un único responsable por envío/actualización compartida con otro servicio. **Aceptación prevista:** Dos rutas de entrada generan el mismo intent o conflicto, nunca doble dispatch.
- **CLI-C08-T05:** Implementar alta de tenant/miembros solo por provisioning autorizado. **Aceptación prevista:** Contactos importados no se convierten en usuarios ni reciben invitación automática.
- **CLI-C08-T06:** Definir suspensión, salida, exportación y conservación revisadas. **Aceptación prevista:** Impago no desencadena borrado/efectos sensibles decididos por modelo.
- **CLI-C08-T07:** Probar cliente externo con portal y binding canónico backend. **Aceptación prevista:** Misma policy que integrado sin requerir UI AgntiaPro al cliente.

## Gates previstos, NO ejecutados
- CLI-C08-G01: Cliente externo compra servicio y trata de acceder a otro tenant con su entitlement.
- CLI-C08-G02: Cambio de plan con job pendiente revalida alcance/coste y conserva receipt.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
