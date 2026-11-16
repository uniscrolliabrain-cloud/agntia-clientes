# C43 — Postgres real, RLS y tenancy
**PLANIFICADO, NO IMPLEMENTADO POR ESTE GPT.** Baseline main 6fa3d796a2f5d3a0ab063db004c1adcdac1db4d6; dependencia CLI-C01..C42. Fuente docs/concept-master/CONCEPT-MASTER.md. src/domain/postgres-rls/ es ruta PROPUESTA; confirmar rutas existentes con git ls-files antes de modificar. No tocar agente ni main.
## Problema y resultado
El Concept Master exige Postgres real, RLS y tenancy, mientras el informe histórico describe un esqueleto y adaptadores fake. No asumir ausencia de código: inspeccionar implementación y registrar diff por requisito.
## Arquitectura objetivo
Entrada API/worker → DTO Zod → JWT verificado → membresía/mandato y ACL por tenant, campo y finalidad → FSM dominio → repositorio transaccional → outbox durable → adaptador con timeout y circuito → receipt/reconciliación → evento sin PII → auditoría y UI.
## Contratos
ExecutionRequestV1(operationId, capability, resourceRef, expectedVersion, idempotencyKey, correlationId, payload, dryRun); principal/tenant server-resolved; ExecutionResultV1 discriminado succeeded/rejected/pending_approval/outcome_unknown/failed; DomainEventV1 con version y evidenceRefs. Compatibilidad additive/minor y breaking/major.
## Datos y migraciones
Entidades tenant-scoped, índices (tenant_id,resource_id), FK compuestas, RLS real, sourceRefs, bitemporalidad cuando aplique, retención, outbox/inbox, expectedVersion y payloadHash de aprobación. Migración expand/backfill/contract, sin destructivas automáticas.
## Wiring
Inspeccionar package.json, src/server.ts, src/contracts/, src/ports/, test/, scripts/, docs/campaigns/ y registrar archivos concretos antes de editar. Conectar DI, rutas, SDK, event registry, worker, UI, env example y CI; pruebas que fallen si capability no registrada.
## Gates
G0 baseline; G1 schema+seguridad; G2 dominio; G3 persistencia/recovery; G4 sandbox; G5 integración real con agente. No confundir mocks con pruebas productivas.
## Riesgos
Tenant cruzado, replay, duplicado, permiso revocado, coste, datos sensibles y provider timeout. Rollback por feature flag + migración reversible + compensación de efecto remoto autorizada.
