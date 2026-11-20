-- CLI-C06 · RLS y roles.
-- El tenant efectivo lo fija el servidor por transacción (`set local app.tenant_id`).
-- Verificado con PostgreSQL real: `npm run db:verify`.

-- Idempotente: un replay de migraciones no debe romper el despliegue.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'app_api') then
    create role app_api nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'app_worker') then
    create role app_worker nologin;
  end if;
end $$;

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
    execute format('drop policy if exists %I_tenant_read on %I', t, t);
    execute format('drop policy if exists %I_tenant_write on %I', t, t);
    execute format('drop policy if exists %I_tenant_update on %I', t, t);
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

-- audit_log es append-only: sin política de update/delete y sin privilegio de
-- DELETE para los roles de la app (el intento falla con 42501, no con "0 filas").
drop policy if exists audit_log_tenant_update on audit_log;

-- El tenant solo puede leer su propia fila; las altas las hace el owner.
drop policy if exists tenants_self_read on tenants;
create policy tenants_self_read on tenants
  for select using (id = current_setting('app.tenant_id', true));

-- service_role/BYPASSRLS no se consideran aislamiento: el API siempre fija el tenant
-- por transacción y valida membresía en el PEP (ver src/auth/principal.ts).
