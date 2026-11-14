-- CLI-C06 · Esquema inicial tenant-scoped.
-- NO EJECUTADO en este entorno (sin Postgres): ver docs/campaigns/reports/C06.md.
-- Convención: todo lleva tenant_id y las FK son compuestas (tenant_id, id) para
-- que una referencia cruzada falle también por SQL directo.

create table if not exists tenants (
  id text primary key,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists memberships (
  tenant_id text not null references tenants(id),
  user_id text not null,
  role_id text not null,
  suspended boolean not null default false,
  capabilities text[] not null default '{}',
  created_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);

create table if not exists customer_organizations (
  tenant_id text not null references tenants(id),
  id text not null,
  legal_name text not null,
  display_name text not null,
  verified_identifiers text[] not null default '{}',
  source text not null,
  revision integer not null default 0,
  primary key (tenant_id, id),
  unique (tenant_id, id)
);

create table if not exists contacts (
  tenant_id text not null references tenants(id),
  id text not null,
  display_name text not null,
  preferred_locale text not null default 'es',
  access_refs text[] not null default '{}',
  primary key (tenant_id, id),
  unique (tenant_id, id)
);
-- Sin unicidad global de email/teléfono: la identidad es por canal y contexto.
create table if not exists contacts_index (
  tenant_id text not null,
  contact_id text not null,
  constraint contacts_index_fk foreign key (tenant_id, contact_id)
    references contacts (tenant_id, id) on delete cascade
);

create table if not exists channel_identities (
  tenant_id text not null references tenants(id),
  id text not null,
  contact_id text not null,
  provider text not null,
  connection_id text not null,
  remote_contact_id text not null,
  normalized_address_ref text not null,
  verification_state text not null check (verification_state in ('unverified','pending','verified','revoked')),
  verified_at timestamptz,
  primary key (tenant_id, id),
  foreign key (tenant_id, contact_id) references contacts (tenant_id, id),
  unique (tenant_id, connection_id, provider, remote_contact_id)
);

create table if not exists external_links (
  tenant_id text not null references tenants(id),
  id text not null,
  provider text not null,
  connection_id text not null,
  model text not null,
  external_id text not null,
  local_kind text not null,
  local_id text not null,
  remote_version text,
  write_date timestamptz,
  source_hash text not null,
  mapper_version text not null,
  last_seen_at timestamptz not null,
  primary key (tenant_id, id),
  unique (tenant_id, connection_id, model, external_id, local_kind)
);

create table if not exists cases (
  tenant_id text not null references tenants(id),
  id text not null,
  organization_id text,
  contact_id text not null,
  category text not null,
  priority text not null check (priority in ('low','normal','high','urgent')),
  state text not null,
  assigned_to text,
  assigned_by text,
  version integer not null default 0,
  sla_policy_id text not null,
  sla_policy_version text not null,
  resolution_contract jsonb not null,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (tenant_id, id),
  foreign key (tenant_id, contact_id) references contacts (tenant_id, id)
);

create table if not exists messages (
  tenant_id text not null references tenants(id),
  id text not null,
  channel text not null,
  connection_id text not null,
  remote_id text,
  conversation_ref text not null,
  case_ref text,
  direction text not null check (direction in ('inbound','outbound')),
  visibility text not null check (visibility in ('public','internal')),
  content_ref text not null,
  attachment_refs text[] not null default '{}',
  occurred_at timestamptz not null,
  received_at timestamptz not null,
  source_hash text not null,
  delivery_state text not null,
  primary key (tenant_id, id),
  foreign key (tenant_id, case_ref) references cases (tenant_id, id)
);

create table if not exists knowledge_versions (
  tenant_id text not null references tenants(id),
  id text not null,
  article_id text not null,
  version integer not null,
  acl text[] not null default '{}',
  locale text not null,
  effective_from timestamptz not null,
  effective_to timestamptz,
  status text not null check (status in ('draft','reviewed','published','retired')),
  source_refs text[] not null default '{}',
  source_hash text not null,
  reviewer_ref text,
  title text not null,
  body text not null,
  primary key (tenant_id, id),
  unique (tenant_id, article_id, version)
);

create table if not exists answer_proposals (
  tenant_id text not null references tenants(id),
  id text not null,
  case_ref text not null,
  content_revision integer not null,
  locale text not null,
  body text not null,
  citations jsonb not null,
  unsupported_claims text[] not null default '{}',
  model_config_ref text not null,
  policy_ref text not null,
  confidence numeric,
  created_at timestamptz not null default now(),
  primary key (tenant_id, id),
  foreign key (tenant_id, case_ref) references cases (tenant_id, id)
);

create table if not exists approval_bindings (
  tenant_id text not null references tenants(id),
  id text not null,
  proposal_hash text not null,
  recipient_hash text not null,
  channel_hash text not null,
  attachments_hash text not null,
  actor_id text not null,
  expected_version integer not null,
  policy_version text not null,
  expires_at timestamptz not null,
  revocation_version integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (tenant_id, id)
);

create table if not exists outbound_intents (
  tenant_id text not null references tenants(id),
  id text not null,
  operation_key text not null,
  conversation_ref text not null,
  contact_ref text not null,
  channel text not null,
  payload_hash text not null,
  proposal_ref text not null,
  approval_ref text,
  state text not null,
  lease_fence integer not null default 0,
  remote_refs text[] not null default '{}',
  reconciliation_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (tenant_id, id),
  -- La clave de idempotencia es por tenant: el mismo hash en otro tenant es otro intent.
  unique (tenant_id, operation_key)
);

create table if not exists webhook_receipts (
  tenant_id text not null references tenants(id),
  id text not null,
  connection_id text not null,
  external_event_id text not null,
  received_at timestamptz not null default now(),
  source_hash text not null,
  primary key (tenant_id, id),
  unique (tenant_id, connection_id, external_event_id)
);

create table if not exists jobs (
  tenant_id text not null references tenants(id),
  id text not null,
  kind text not null,
  state text not null,
  attempts integer not null default 0,
  lease_fence integer not null default 0,
  lease_expires_at timestamptz,
  last_error text,
  payload_ref text not null,
  primary key (tenant_id, id)
);

create table if not exists audit_log (
  tenant_id text not null references tenants(id),
  id text not null,
  actor_id text not null,
  capability text not null,
  operation_id text not null,
  correlation_id text not null,
  outcome text not null,
  payload_ref text not null,
  occurred_at timestamptz not null default now(),
  primary key (tenant_id, id)
);

create table if not exists budget_reservations (
  tenant_id text not null references tenants(id),
  id text not null,
  operation_key text not null,
  amount numeric(18,6) not null,
  currency text not null,
  state text not null check (state in ('reserved','consumed','released')),
  created_at timestamptz not null default now(),
  primary key (tenant_id, id),
  unique (tenant_id, operation_key)
);
