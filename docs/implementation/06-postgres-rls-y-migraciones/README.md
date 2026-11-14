# CLI-C06 — Postgres, RLS y migraciones

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/06-postgres-rls-y-migraciones.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Persistir entidades, relaciones, auditoría y colas sin fuga ni pérdida.

## Artefactos previstos
- `packages/storage/`
- `migrations/`
- `tests/integration/storage.test.ts`

## Invariante
Toda relación y operación persistida conserva scope; un rol privilegiado no elude policy.

## Dependencias y contrato
Dependencias: CLI-C05. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: S01, S02, H01.

## Tareas originales, sin granularizar
- **CLI-C06-T01:** Diseñar tablas tenant-scoped y FKs compuestas para contactos/casos/artefactos. **Aceptación prevista:** FK de un caso A a contacto B falla también por SQL directo autorizado de prueba.
- **CLI-C06-T02:** Implementar migraciones versionadas con transacción y backup previo. **Aceptación prevista:** Fresh/upgrade y fallo parcial mantienen datos/auditoría preexistentes.
- **CLI-C06-T03:** Configurar RLS USING/WITH CHECK y roles reales de API/workers. **Aceptación prevista:** Probar owner/BYPASSRLS/service_role sin asumir aislamiento automático.
- **CLI-C06-T04:** Implementar índices compuestos de links, webhook dedup e idempotency. **Aceptación prevista:** Replay concurrente no genera dos filas lógicas del mismo efecto.
- **CLI-C06-T05:** Persistir audit append-only con payload separado y retención definida. **Aceptación prevista:** Mutaciones/denegaciones tienen correlación; datos personales pueden gestionarse sin falsificar historia.
- **CLI-C06-T06:** Probar concurrencia CAS, bloqueos, leases y transacciones outbox. **Aceptación prevista:** Crash revierte estado/outbox juntos y no deja intención parcial invisible.
- **CLI-C06-T07:** Probar backup/restore, permisos y configuración de conexión por entorno. **Aceptación prevista:** Restauración sintética verificable; no claves ni DSN en evidencias.

## Gates previstos, NO ejecutados
- CLI-C06-G01: INSERT/UPDATE/DELETE intentan referencia cross-tenant por distintos roles de DB.
- CLI-C06-G02: Caída en migración o commit: restaurar y comparar hashes/conteos antes de avanzar.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
