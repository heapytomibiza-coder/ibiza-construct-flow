-- Create redirect_analytics table
create table if not exists public.redirect_analytics (
  id uuid primary key default gen_random_uuid(),
  from_path text not null,
  to_path text not null,
  redirect_reason text,
  hit_count integer not null default 0,
  last_hit_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_redirect_analytics_paths on public.redirect_analytics (from_path, to_path);
create index if not exists idx_redirect_analytics_last_hit on public.redirect_analytics (last_hit_at desc);

alter table public.redirect_analytics enable row level security;

create policy "Allow authenticated read" on public.redirect_analytics for select using (auth.role() = 'authenticated');
create policy "Allow anon insert" on public.redirect_analytics for insert with check (true);
create policy "Allow anon update" on public.redirect_analytics for update using (true);