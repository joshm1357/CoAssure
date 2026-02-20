-- CoAssure Production Database Schema
-- Run against Supabase PostgreSQL

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- =============================================================================
-- ORGANISATIONS
-- =============================================================================
create table organisations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  abn text,
  logo_url text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'enterprise')),
  stripe_customer_id text,
  stripe_subscription_id text,
  settings jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- USER PROFILES (extends Supabase auth.users)
-- =============================================================================
create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  role text not null default 'worker' check (role in ('worker', 'supervisor', 'admin')),
  account_type text not null default 'personal' check (account_type in ('personal', 'contractor', 'organisation')),
  org_id uuid references organisations(id) on delete set null,
  worker_id uuid, -- will reference workers table
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- WORKERS (safety profile — separate from auth)
-- =============================================================================
create table workers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete set null,
  org_id uuid references organisations(id) on delete set null,
  name text not null,
  trade text,
  years_experience integer not null default 0,
  years_with_company integer not null default 0,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add foreign key from user_profiles to workers
alter table user_profiles add constraint fk_worker foreign key (worker_id) references workers(id) on delete set null;

-- =============================================================================
-- SITES & PROJECTS
-- =============================================================================
create table sites (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organisations(id) on delete cascade,
  name text not null,
  address text,
  lat double precision,
  lng double precision,
  phase text, -- e.g. 'construction', 'commissioning', 'maintenance'
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id) on delete cascade,
  name text not null,
  description text,
  start_date date,
  end_date date,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- ORG MEMBERSHIPS
-- =============================================================================
create table org_memberships (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organisations(id) on delete cascade,
  user_id uuid not null references user_profiles(id) on delete cascade,
  role text not null default 'worker' check (role in ('worker', 'supervisor', 'admin')),
  invited_by uuid references user_profiles(id),
  invited_at timestamptz not null default now(),
  joined_at timestamptz,
  status text not null default 'pending' check (status in ('pending', 'active', 'revoked')),
  unique (org_id, user_id)
);

-- =============================================================================
-- TRAINING RECORDS
-- =============================================================================
create table training_records (
  id uuid primary key default uuid_generate_v4(),
  worker_id uuid not null references workers(id) on delete cascade,
  cert_type text not null,
  cert_name text not null,
  issued_date date,
  expiry_date date,
  issuer text,
  status text not null default 'current' check (status in ('current', 'expiring', 'expired')),
  created_at timestamptz not null default now()
);

-- =============================================================================
-- FORM TEMPLATES
-- =============================================================================
create table form_templates (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organisations(id) on delete cascade, -- null = system/standard template
  form_type text not null, -- 'take5', 'jsa', 'swms', 'site_diary', 'custom'
  name text not null,
  description text,
  schema_json jsonb not null, -- structured form definition
  version integer not null default 1,
  is_standard boolean not null default false, -- true = available to all users
  is_active boolean not null default true,
  created_by uuid references user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- FORM SUBMISSIONS
-- =============================================================================
create table form_submissions (
  id uuid primary key default uuid_generate_v4(),
  template_id uuid not null references form_templates(id) on delete restrict,
  session_id uuid, -- linked to a session if filled via conversation
  worker_id uuid not null references workers(id) on delete cascade,
  site_id uuid references sites(id),
  data_json jsonb not null default '{}', -- completed form data
  status text not null default 'draft' check (status in ('draft', 'completed', 'signed', 'reviewed')),
  signed_at timestamptz,
  reviewed_by uuid references user_profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- SESSIONS
-- =============================================================================
create table sessions (
  id uuid primary key default uuid_generate_v4(),
  worker_id uuid not null references workers(id) on delete cascade,
  site_id uuid references sites(id),
  session_type text not null check (session_type in ('pre-start', 'toolbox-talk', 'form-assist', 'report', 'reflection')),
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  location_lat double precision,
  location_lng double precision,
  location_address text,
  weather_temp real,
  weather_conditions text,
  weather_wind_speed real,
  weather_wind_dir text,
  task_description text,
  hazards_identified text,
  controls_confirmed text,
  ai_prompts text,
  transcript text,
  summary text,
  duration_seconds integer,
  form_template_id uuid references form_templates(id), -- for form-assist sessions
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- =============================================================================
-- SESSION ATTENDEES (for toolbox talks)
-- =============================================================================
create table session_attendees (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references sessions(id) on delete cascade,
  worker_id uuid references workers(id),
  name text not null, -- name even if not a registered user
  signed_at timestamptz not null default now()
);

-- =============================================================================
-- MESSAGES
-- =============================================================================
create table messages (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- REPORTS
-- =============================================================================
create table reports (
  id uuid primary key default uuid_generate_v4(),
  worker_id uuid not null references workers(id) on delete cascade,
  session_id uuid references sessions(id),
  site_id uuid references sites(id),
  report_type text not null check (report_type in ('near-miss', 'hazard', 'good-catch', 'observation')),
  severity text check (severity in ('low', 'medium', 'high', 'critical')),
  description text not null,
  contributing_factors text,
  actions_taken text,
  recommended_actions text,
  location_lat double precision,
  location_lng double precision,
  location_address text,
  photo_url text,
  is_anonymous boolean not null default false,
  status text not null default 'open' check (status in ('open', 'reviewed', 'actioned', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- AUDIT LOG (immutable — no updates or deletes)
-- =============================================================================
create table audit_log (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organisations(id),
  user_id uuid references user_profiles(id),
  action text not null, -- 'create', 'update', 'delete', 'sign', 'export', 'login', 'logout'
  entity_type text not null, -- 'session', 'report', 'form_submission', 'worker', etc.
  entity_id uuid,
  metadata jsonb default '{}',
  ip_address inet,
  created_at timestamptz not null default now()
);

-- Prevent updates and deletes on audit_log
create or replace function prevent_audit_modification()
returns trigger as $$
begin
  raise exception 'Audit log records cannot be modified or deleted';
end;
$$ language plpgsql;

create trigger no_audit_update before update on audit_log
  for each row execute function prevent_audit_modification();

create trigger no_audit_delete before delete on audit_log
  for each row execute function prevent_audit_modification();

-- =============================================================================
-- INVITATIONS
-- =============================================================================
create table invitations (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organisations(id) on delete cascade,
  email text not null,
  role text not null default 'worker' check (role in ('worker', 'supervisor', 'admin')),
  invited_by uuid not null references user_profiles(id),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

-- =============================================================================
-- INDEXES
-- =============================================================================
create index idx_workers_org on workers(org_id);
create index idx_workers_user on workers(user_id);
create index idx_training_worker on training_records(worker_id);
create index idx_sessions_worker on sessions(worker_id);
create index idx_sessions_site on sessions(site_id);
create index idx_sessions_created on sessions(created_at desc);
create index idx_messages_session on messages(session_id);
create index idx_reports_worker on reports(worker_id);
create index idx_reports_site on reports(site_id);
create index idx_reports_created on reports(created_at desc);
create index idx_form_templates_org on form_templates(org_id);
create index idx_form_templates_standard on form_templates(is_standard) where is_standard = true;
create index idx_form_submissions_template on form_submissions(template_id);
create index idx_form_submissions_worker on form_submissions(worker_id);
create index idx_audit_log_org on audit_log(org_id);
create index idx_audit_log_entity on audit_log(entity_type, entity_id);
create index idx_audit_log_created on audit_log(created_at desc);
create index idx_org_memberships_org on org_memberships(org_id);
create index idx_org_memberships_user on org_memberships(user_id);
create index idx_invitations_email on invitations(email);
create index idx_session_attendees_session on session_attendees(session_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table workers enable row level security;
alter table training_records enable row level security;
alter table sessions enable row level security;
alter table messages enable row level security;
alter table reports enable row level security;
alter table form_templates enable row level security;
alter table form_submissions enable row level security;
alter table organisations enable row level security;
alter table org_memberships enable row level security;
alter table audit_log enable row level security;
alter table sites enable row level security;
alter table projects enable row level security;

-- Workers: see own data, or org data if admin/supervisor
create policy "Workers see own" on workers for select using (
  user_id = auth.uid()
  or org_id in (
    select org_id from org_memberships
    where user_id = auth.uid() and status = 'active'
  )
);

create policy "Workers update own" on workers for update using (user_id = auth.uid());
create policy "Workers insert own" on workers for insert with check (user_id = auth.uid());

-- Sessions: see own or org
create policy "Sessions see own" on sessions for select using (
  worker_id in (select id from workers where user_id = auth.uid())
  or worker_id in (
    select w.id from workers w
    join org_memberships om on w.org_id = om.org_id
    where om.user_id = auth.uid() and om.status = 'active'
    and om.role in ('supervisor', 'admin')
  )
);

create policy "Sessions insert own" on sessions for insert with check (
  worker_id in (select id from workers where user_id = auth.uid())
);

-- Reports: see own or org
create policy "Reports see own" on reports for select using (
  worker_id in (select id from workers where user_id = auth.uid())
  or worker_id in (
    select w.id from workers w
    join org_memberships om on w.org_id = om.org_id
    where om.user_id = auth.uid() and om.status = 'active'
    and om.role in ('supervisor', 'admin')
  )
);

create policy "Reports insert own" on reports for insert with check (
  worker_id in (select id from workers where user_id = auth.uid())
);

-- Form templates: see standard templates or own org templates
create policy "Form templates see" on form_templates for select using (
  is_standard = true
  or org_id in (
    select org_id from org_memberships
    where user_id = auth.uid() and status = 'active'
  )
);

-- Org admins can create/update templates
create policy "Form templates manage" on form_templates for insert with check (
  org_id in (
    select org_id from org_memberships
    where user_id = auth.uid() and status = 'active' and role = 'admin'
  )
);

create policy "Form templates update" on form_templates for update using (
  org_id in (
    select org_id from org_memberships
    where user_id = auth.uid() and status = 'active' and role = 'admin'
  )
);

-- Messages: see own sessions
create policy "Messages see own" on messages for select using (
  session_id in (
    select id from sessions
    where worker_id in (select id from workers where user_id = auth.uid())
  )
);

create policy "Messages insert own" on messages for insert with check (
  session_id in (
    select id from sessions
    where worker_id in (select id from workers where user_id = auth.uid())
  )
);

-- Audit log: org admins only
create policy "Audit log org admin" on audit_log for select using (
  org_id in (
    select org_id from org_memberships
    where user_id = auth.uid() and status = 'active' and role = 'admin'
  )
);
