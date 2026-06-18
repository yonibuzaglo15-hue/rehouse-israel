-- Supabase migration for production property storage
-- Run in Supabase SQL editor when SUPABASE_URL is configured

create table if not exists catalog_properties (
  id text primary key,
  external_id text unique,
  published boolean not null default true,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists catalog_properties_published_idx
  on catalog_properties (published);

create index if not exists catalog_properties_updated_at_idx
  on catalog_properties (updated_at desc);

create index if not exists catalog_properties_data_gin_idx
  on catalog_properties using gin (data);
