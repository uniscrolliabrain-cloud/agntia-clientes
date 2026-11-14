-- CLI-C06 · RLS y roles.
-- El tenant efectivo lo fija el servidor por transacción (`set local app.tenant_id`).
-- NO EJECUTADO en este entorno (sin Postgres).

create role app_api nologin;
create role app_worker nologin;

grant select, insert, update on all tables in schema public to app_api;
grant select, insert, update on all tables in schema public to app_worker;

alter table tenants enable row level security;
alter table memberships enable row level security;
alter table customer_organizations enable row level security;
alter table contacts enable row level security;
alter table channel_identities enable row level security;
alter table external_links enable row level security;
alter table cases enable row level security;
alter table messages enable row level security;
alter table knowledge_versions enable row level security;
alter table answer_proposals enable row level security;
alter table approval_bindings enable row level security;
alter table outbound_intents enable row level security;
alter table webhook_receipts enable row level security;
alter table jobs enable row level security;
alter table audit_log enable row level security;
alter table budget_reservations enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'memberships','customer_organizations','contacts','channel_identities','external_links',
    'cases','messages','knowledge_versions','answer_proposals','approval_bindings',
    'outbound_intents','webhook_receipts','jobs','audit_log','budget_reservations'
  ]
  loop
    execute format(
      'create policy %I_tenant_read on %I for select using (tenant_id = current_setting(''app.tenant_id'', true))',
      t, t);
    execute format(
      'create policy %I_tenant_write on %I for insert with check (tenant_id = current_setting(''app.tenant_id'', true))',
      t, t);
    execute format(
      'create policy %I_tenant_update on %I for update using (tenant_id = current_setting(''app.tenant_id'', true)) with check (tenant_id = current_setting(''app.tenant_id'', true))',
      t, t);
  end loop;
end $$;

-- audit_log es append-only: sin política de update/delete.
drop policy if exists audit_log_tenant_update on audit_log;

-- service_role/BYPASSRLS no se consideran aislamiento: el API siempre fija el tenant
-- por transacción y valida membresía en el PEP (ver src/auth/principal.ts).
