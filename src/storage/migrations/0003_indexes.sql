-- CLI-C06 · Índices de deduplicación e idempotencia.
-- NO EJECUTADO en este entorno (sin Postgres).

create index if not exists cases_tenant_state_due
  on cases (tenant_id, state, due_at);

create index if not exists messages_tenant_conversation_time
  on messages (tenant_id, conversation_ref, occurred_at);

create index if not exists outbound_intents_tenant_state
  on outbound_intents (tenant_id, state, updated_at);

create index if not exists jobs_tenant_state_lease
  on jobs (tenant_id, state, lease_expires_at);

create index if not exists audit_log_tenant_time
  on audit_log (tenant_id, occurred_at desc);

-- Un webhook repetido no entra dos veces; el índice único vive en 0001.
-- Un replay de operación con otro payload devuelve 409 desde el PEP, no desde SQL.
create index if not exists budget_reservations_tenant_state
  on budget_reservations (tenant_id, state);

-- Ruta de migración: aditiva y compatible. Un cambio destructivo exige plan manual.
