-- CLI-C06 · Agregados durables para las vertical slices.
--
-- Mismo patrón que `cases.document`: el DTO completo es la fuente de verdad y
-- las columnas proyectadas existen para índices, idempotencia y CAS. Así una
-- propuesta, una aprobación, un intent o un plan conservan todos sus campos
-- aunque el esquema crezca, sin reconstruirlos por partes.
--
-- Idempotente: se puede aplicar sobre una base ya migrada.

alter table answer_proposals
  add column if not exists document jsonb not null default '{}'::jsonb;

alter table approval_bindings
  add column if not exists document jsonb not null default '{}'::jsonb;

alter table outbound_intents
  add column if not exists document jsonb not null default '{}'::jsonb;

-- Planes de onboarding (CLI-C29). No existían en 0001; el estado de cada paso
-- viaja en `document` y `version` sirve para el compare-and-swap.
create table if not exists onboarding_plans (
  tenant_id text not null references tenants(id),
  id text not null,
  organization_ref text not null,
  playbook_id text not null,
  playbook_version integer not null,
  version integer not null default 0,
  state text not null default 'active',
  document jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (tenant_id, id)
);

create index if not exists onboarding_plans_tenant_org
  on onboarding_plans (tenant_id, organization_ref);

-- La tabla nueva entra en el mismo modelo de RLS que las de 0002: el tenant lo
-- fija la transacción y sin él no se ve ninguna fila.
grant select, insert, update on onboarding_plans to app_api;
grant select, insert, update on onboarding_plans to app_worker;

alter table onboarding_plans enable row level security;

drop policy if exists onboarding_plans_tenant_read on onboarding_plans;
drop policy if exists onboarding_plans_tenant_write on onboarding_plans;
drop policy if exists onboarding_plans_tenant_update on onboarding_plans;

create policy onboarding_plans_tenant_read on onboarding_plans
  for select using (tenant_id = current_setting('app.tenant_id', true));
create policy onboarding_plans_tenant_write on onboarding_plans
  for insert with check (tenant_id = current_setting('app.tenant_id', true));
create policy onboarding_plans_tenant_update on onboarding_plans
  for update using (tenant_id = current_setting('app.tenant_id', true))
  with check (tenant_id = current_setting('app.tenant_id', true));
