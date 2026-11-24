-- Local-dev stand-in for Supabase Auth so the same migrations + RLS policies
-- run against plain Docker Postgres. On real Supabase this file is skipped —
-- auth schema, auth.users and auth.uid() already exist there.
create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  created_at timestamptz not null default now()
);

-- Reads the current user id from a per-transaction GUC the API sets:
--   set local "app.user_id" = '<uuid>';
create or replace function auth.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('app.user_id', true), '')::uuid
$$;
