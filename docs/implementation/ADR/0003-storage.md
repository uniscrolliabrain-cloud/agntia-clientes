# ADR 0003 · Persistencia: repositorio en memoria + migraciones SQL

- **Estado**: aceptado con limitación declarada.

## Contexto

No hay Postgres, Docker ni Supabase provisionado en el entorno. El diseño exige RLS, FKs
compuestas e idempotencia durable.

## Decisión

- Implementar `TenantTable` en memoria con las garantías **observables** del diseño: scoping por
  tenant, unicidad compuesta, CAS por versión, errores de violación.
- Entregar migraciones reales (`src/storage/migrations/`) con tablas tenant-scoped, FK compuestas,
  índices únicos de dedup e idempotencia, RLS por `app.tenant_id` y roles `app_api`/`app_worker`.
- No simular que RLS se ha ejecutado: el gate queda `NOT_VERIFIED`.

## Consecuencias

- Los tests demuestran la lógica de aislamiento, no el comportamiento de Postgres.
- Cambiar a Postgres requiere: adaptador `PgStore` que implemente las mismas operaciones,
  `set local app.tenant_id` por transacción y ejecutar `0001→0003` en un entorno real.
- `audit_log` es append-only (sin política de update/delete).
