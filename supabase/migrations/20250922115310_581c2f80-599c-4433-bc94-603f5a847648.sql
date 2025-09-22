-- =========================
-- ROLES / USERS
-- =========================
create type user_role as enum ('client','professional','admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'client',
  full_name text,
  phone text,
  avatar_url text,
  -- PII protection flags (optional)
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- =========================
-- SERVICE CATALOG (Phase 0 seeds 24 handyman micro-services)
-- =========================
create table public.services (
  id bigserial primary key,
  category text not null,        -- e.g., "Home & Property"
  subcategory text not null,     -- e.g., "Handyman"
  micro text not null,           -- e.g., "TV Mounting"
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(category, subcategory, micro)
);

-- JSON schema for micro-specific questions (kept versioned & minimal)
create table public.service_questions (
  id bigserial primary key,
  service_id bigint not null references public.services(id) on delete cascade,
  version int not null default 1,
  questions jsonb not null,      -- array of question defs (type, key, label, options, validation)
  created_at timestamptz not null default now()
);

-- =========================
-- BOOKINGS (the single source of truth)
-- =========================
create type booking_status as enum ('draft','new','curation','inviting','open','in_progress','completed','cancelled');

create table public.bookings (
  id bigserial primary key,
  client_id uuid not null references public.profiles(id) on delete restrict,
  service_id bigint not null references public.services(id) on delete restrict,
  status booking_status not null default 'new',

  -- Two-bucket answer model (your UX rule)
  micro_q_answers jsonb not null default '{}'::jsonb,   -- service detail answers
  general_answers jsonb not null default '{}'::jsonb,   -- location, access, timing, contact, budget

  -- PII fields duplicated into general_answers but kept as columns for indexing/guarding
  contact_name text,
  contact_phone text,
  contact_email text,

  location_geom geography(point, 4326),                 -- optional for distance matching
  city text, region text, country text,
  budget_min numeric, budget_max numeric,
  date_from date, date_to date,

  created_at timestamptz not null default now()
);
create index on public.bookings (client_id);
create index on public.bookings (service_id);
create index on public.bookings (status);
create index on public.bookings using gist (location_geom);

alter table public.bookings enable row level security;

-- =========================
-- MATCHING & APPLICATIONS
-- =========================
create type match_status as enum ('candidate','invited','applied','declined','countered','selected','expired');

create table public.job_matches (
  id bigserial primary key,
  booking_id bigint not null references public.bookings(id) on delete cascade,
  professional_id uuid not null references public.profiles(id) on delete cascade,
  status match_status not null default 'candidate',
  match_score int not null default 0,  -- 0-100
  distance_km numeric,
  created_at timestamptz not null default now(),
  unique (booking_id, professional_id)
);
alter table public.job_matches enable row level security;

create table public.professional_applications (
  id bigserial primary key,
  booking_id bigint not null references public.bookings(id) on delete cascade,
  professional_id uuid not null references public.profiles(id) on delete cascade,
  proposed_price numeric,
  message text,
  status match_status not null default 'applied',
  created_at timestamptz not null default now()
);
alter table public.professional_applications enable row level security;

-- =========================
-- MILESTONES & ESCROW
-- =========================
create type milestone_status as enum ('planned','approved','in_hold','released','disputed');

create table public.milestones (
  id bigserial primary key,
  booking_id bigint not null references public.bookings(id) on delete cascade,
  seq int not null,
  title text not null,
  amount numeric not null,
  status milestone_status not null default 'planned',
  created_at timestamptz not null default now(),
  unique (booking_id, seq)
);
alter table public.milestones enable row level security;

create type escrow_status as enum ('pending_funding','funded','partially_released','released','refunded','disputed');

create table public.escrow_payments (
  id bigserial primary key,
  booking_id bigint not null references public.bookings(id) on delete cascade,
  status escrow_status not null default 'pending_funding',
  currency text not null default 'EUR',
  amount_expected numeric not null default 0,
  amount_held numeric not null default 0,
  created_at timestamptz not null default now()
);
alter table public.escrow_payments enable row level security;

-- =========================
-- FEATURE FLAGS
-- =========================
create table public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  description text,
  created_at timestamptz not null default now()
);
insert into public.feature_flags (key, enabled, description) values
  ('ff.jobWizardV2', false, 'Client job posting wizard v2'),
  ('ff.proInboxV1',  false, 'Pro opportunities inbox'),
  ('ff.adminCurationV1', false, 'Admin curation queue'),
  ('ff.messaging',   false, 'Messaging hub'),
  ('ff.escrow',      false, 'Escrow payments');

-- =========================
-- RLS POLICIES
-- =========================

-- PROFILES
create policy "profiles self read" on public.profiles
for select using (auth.uid() = id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "profiles self update" on public.profiles
for update using (auth.uid() = id);

-- BOOKINGS
-- 1) Clients can see their own bookings
create policy "client owns booking" on public.bookings
for all using (client_id = auth.uid());

-- 2) Admins can see all
create policy "admin can read all bookings" on public.bookings
for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));

-- 3) Professionals can see limited fields ONLY if invited/applied/selected
create view public.booking_safe_view as
select
  b.id, b.service_id, b.status, b.micro_q_answers,
  -- PII redacted pre-invite:
  case when jm.status in ('invited','applied','selected')
       then b.general_answers else jsonb_strip_nulls(b.general_answers - 'contact') end as general_answers,
  b.city, b.region, b.country, b.budget_min, b.budget_max, b.date_from, b.date_to,
  b.created_at
from public.bookings b
left join public.job_matches jm
  on jm.booking_id = b.id and jm.professional_id = auth.uid();

grant select on public.booking_safe_view to anon, authenticated;

-- JOB_MATCHES
create policy "pro sees own matches" on public.job_matches
for select using (professional_id = auth.uid());
create policy "admin sees matches" on public.job_matches
for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));
create policy "admin inserts invites" on public.job_matches
for insert with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));

-- APPLICATIONS
create policy "pro writes own applications" on public.professional_applications
for insert with check (professional_id = auth.uid());
create policy "pro reads own applications" on public.professional_applications
for select using (professional_id = auth.uid());
create policy "admin reads all applications" on public.professional_applications
for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));

-- MILESTONES / ESCROW (client owner, admin)
create policy "client reads milestones" on public.milestones
for select using (exists (select 1 from public.bookings b where b.id = booking_id and b.client_id = auth.uid()));
create policy "admin reads milestones" on public.milestones
for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));

create policy "client reads escrow" on public.escrow_payments
for select using (exists (select 1 from public.bookings b where b.id = booking_id and b.client_id = auth.uid()));
create policy "admin reads escrow" on public.escrow_payments
for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));

-- =========================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =========================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'client')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();