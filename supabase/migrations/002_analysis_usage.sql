-- Run this in Supabase Dashboard → SQL Editor
-- Creates the analysis_usage table for credit metering.

create table if not exists public.analysis_usage (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  ticker      text not null,
  created_at  timestamptz not null default now()
);

alter table public.analysis_usage enable row level security;

create policy "Users can view own usage"
  on public.analysis_usage for select
  using (auth.uid() = user_id);

create policy "Users can insert own usage"
  on public.analysis_usage for insert
  with check (auth.uid() = user_id);

-- Index for fast monthly count per user
create index if not exists analysis_usage_user_month_idx
  on public.analysis_usage (user_id, created_at desc);
