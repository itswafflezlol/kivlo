-- Kivlo initial schema. See docs/ARCHITECTURE.md "Data".
create extension if not exists pgcrypto;

-- ---------- profiles / credits ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text,
  plan text not null default 'free' check (plan in ('free','pro','creator','agency')),
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly','yearly')),
  credits_used int not null default 0 check (credits_used >= 0),
  cycle_resets_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid,
  kind text not null check (kind in ('reserve','charge','refund','reset')),
  amount int not null,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists credit_ledger_user_idx on public.credit_ledger (user_id, created_at desc);
create index if not exists credit_ledger_project_idx on public.credit_ledger (project_id);

-- ---------- projects / clips ----------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source_url text not null,
  platform text check (platform in ('youtube','twitch')),
  source_id text,
  title text,
  channel text,
  duration_sec int check (duration_sec is null or duration_sec >= 0),
  thumbnail_url text,
  status text not null default 'processing' check (status in ('processing','ready','failed')),
  stage text not null default 'probe',
  progress int not null default 0 check (progress between 0 and 100),
  error text,
  rights_confirmed_at timestamptz,
  idempotency_key text,
  source_file_key text,
  source_delete_after timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);
create index if not exists projects_user_idx on public.projects (user_id, created_at desc);

create table if not exists public.clips (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default '',
  start_sec numeric not null check (start_sec >= 0),
  end_sec numeric not null,
  score int check (score between 0 and 100),
  reason text not null default '',
  status text not null default 'pending' check (status in ('pending','ready','rendering','rendered','failed')),
  words jsonb not null default '[]',
  settings jsonb not null default '{}',
  file_key text,
  thumb_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_sec > start_sec)
);
create index if not exists clips_project_idx on public.clips (project_id);
create index if not exists clips_user_idx on public.clips (user_id, created_at desc);
alter table public.credit_ledger
  add constraint credit_ledger_project_fk foreign key (project_id) references public.projects(id) on delete set null;

-- ---------- presets ----------
create table if not exists public.presets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('captions','layouts','looks','hooks','export','posting')),
  settings jsonb not null default '{}',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists presets_owner_idx on public.presets (owner_id, kind);

-- ---------- scheduled posts ----------
create table if not exists public.scheduled_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  clip_id uuid not null references public.clips(id) on delete cascade,
  platform text not null check (platform in ('tiktok','shorts','reels','x')),
  time timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled','reminder_due','posted','failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists scheduled_posts_user_time_idx on public.scheduled_posts (user_id, time);

-- ---------- jobs ----------
create table if not exists public.jobs (
  id bigint generated always as identity primary key,
  type text not null check (type in ('import','render')),
  payload jsonb not null default '{}',
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued','running','done','failed','dead')),
  attempts int not null default 0,
  max_attempts int not null default 3,
  run_after timestamptz not null default now(),
  locked_by text,
  locked_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- worker claim index
create index if not exists jobs_claim_idx on public.jobs (status, run_after) where status = 'queued';
create index if not exists jobs_project_idx on public.jobs (project_id);

-- ---------- notifications ----------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null default 'system' check (kind in ('render','post','billing','system')),
  text text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

-- ---------- takedowns (PRD 5.9: respond within 24h) ----------
create table if not exists public.takedowns (
  id uuid primary key default gen_random_uuid(),
  requester_name text not null,
  requester_email text not null,
  target_url text not null,
  project_id uuid references public.projects(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','removed','rejected')),
  repeat_infringer boolean not null default false,
  received_at timestamptz not null default now(),
  deadline_at timestamptz not null default (now() + interval '24 hours'),
  resolved_at timestamptz,
  actions_taken text
);

-- ---------- updated_at trigger ----------
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['profiles','projects','clips','presets','scheduled_posts','jobs'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.projects enable row level security;
alter table public.clips enable row level security;
alter table public.presets enable row level security;
alter table public.scheduled_posts enable row level security;
alter table public.notifications enable row level security;

create policy profiles_own on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy ledger_own on public.credit_ledger for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy projects_own on public.projects for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy clips_own on public.clips for all using (user_id = auth.uid()) with check (user_id = auth.uid());
-- built-in presets (owner_id is null) readable by everyone; own rows fully writable
create policy presets_read on public.presets for select using (owner_id is null or owner_id = auth.uid());
create policy presets_write on public.presets for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy posts_own on public.scheduled_posts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notifications_own on public.notifications for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- jobs/takedowns are service tables: no RLS policies (API/worker use the service role)
