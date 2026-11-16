# C46 — Grafo relacional bitemporal, identidad y derechos
**PLANIFICADO, NO IMPLEMENTADO POR ESTE GPT.** Baseline main 6fa3d796a2f5d3a0ab063db004c1adcdac1db4d6; dependencia C43. Fuente docs/concept-master/CONCEPT-MASTER.md. src/domain/relationship-graph/ es ruta PROPUESTA; confirmar rutas existentes con git ls-files antes de modificar. No tocar agente ni main.
## W01 — contratos y análisis diferencial
**PS-C46-W01-P01:** leer Concept Master, docs/campaigns, package.json y src/ real; inventariar entidades/rutas/tests y clasificar reutilizar/reforzar/legacy. Entregable: matriz CLI→ruta→brecha→test.
**PS-C46-W01-P02:** CREAR PROPUESTO src/domain/relationship-graph/contracts.ts y test/relationship-graph-contract.test.ts; Zod schemas, fixtures válidos e inválidos, versión y errores tipados. Rechazar tenant/actor falsificados y approval ajena. Gate: unit tests y negative tests.
## W02 — core y stores
**PS-C46-W02-P01:** CREAR PROPUESTO src/domain/relationship-graph/service.ts, src/domain/relationship-graph/repository.ts, test/relationship-graph-domain.test.ts; FSM determinista, validación de transición, idempotencyKey, optimistic locking, evidencias y autorización. Test concurrencia y revocación.
**PS-C46-W02-P02:** CREAR PROPUESTO migraciones versionadas según ruta real, índices y RLS con dos roles reales; FK tenant-scoped, outbox e inbox; pruebas crash/restore. Sin DB, gate NOT_VERIFIED.
## W03 — adaptadores y wiring
**PS-C46-W03-P01:** CREAR PROPUESTO src/domain/relationship-graph/adapter.ts y test/relationship-graph-adapter.test.ts; timeout, retry acotado, DLQ, circuit breaker, outcome_unknown y reconciliación. No reintentar efecto remoto si ACK incierto.
**PS-C46-W03-P02:** MODIFICAR SOLO tras localizar rutas reales: route registry, DI, exports, env example, package/lockfile si nueva dependencia, CI, worker, SDK y UI. Añadir test registro y correlación/causación. Gate: E2E con fixture.
## W04 — certificación y entrega
**PS-C46-W04-P01:** ejecutar npm ci, npm run typecheck, npm test, npm run eval según disponibilidad; negativos tenantA/B, actor sin permiso, payload injection, duplicado, crash, rollback y presupuesto. Registrar comando/exit code y artefactos.
**PS-C46-W04-P02:** producir reportes por wave, SHA inicial/final, evidencia, gaps y handoff; no merge ni deploy. Gate G4 solo con sandbox real y G5 solo con SHA cruzados y aprobación.
## Criterios medibles
Ninguna fuga A/B, ningún doble efecto bajo duplicados, rechazo de aprobaciones desfasadas, evidencia verificable de outcome y error explícito ante proveedor caído. Medir p95, costes y rate limits, sin inventar umbrales cumplidos.
