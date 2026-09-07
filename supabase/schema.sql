-- Run this in Supabase SQL Editor (Dashboard → SQL → New query)

create extension if not exists "pgcrypto";

create table if not exists firms (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  name text not null default 'My firm',
  retain_days integer not null default 90,
  auto_delete_exports boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists templates (
  id text primary key,
  firm_id uuid not null references firms(id) on delete cascade,
  name text not null,
  description text not null default '',
  sections jsonb not null default '[]'::jsonb,
  tone_notes text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists mandates (
  id text primary key,
  firm_id uuid not null references firms(id) on delete cascade,
  title text not null,
  client text not null,
  role text not null,
  geography text not null default '',
  criteria jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists dossiers (
  id text primary key,
  firm_id uuid not null references firms(id) on delete cascade,
  candidate_name text not null,
  target_role text not null,
  client text not null,
  status text not null default 'draft',
  step text not null default 'ingest',
  mandate_id text not null,
  template_id text not null,
  sources jsonb not null default '[]'::jsonb,
  claims jsonb not null default '[]'::jsonb,
  sections jsonb not null default '[]'::jsonb,
  qa_issues jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz
);

create table if not exists audit_events (
  id text primary key,
  firm_id uuid not null references firms(id) on delete cascade,
  action text not null,
  actor text not null,
  entity_type text not null,
  entity_id text not null,
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists templates_firm_id_idx on templates(firm_id);
create index if not exists mandates_firm_id_idx on mandates(firm_id);
create index if not exists dossiers_firm_id_idx on dossiers(firm_id);
create index if not exists audit_events_firm_id_idx on audit_events(firm_id);
