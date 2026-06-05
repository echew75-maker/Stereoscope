-- 001_initial_schema.sql

-- Users (managed by Supabase Auth, this extends the profile)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  display_name text,
  tier text default 'free' check (tier in ('free', 'analyst', 'portfolio_manager')),
  created_at timestamptz default now()
);

-- Cached analysis reports
create table public.reports (
  id uuid default gen_random_uuid() primary key,
  ticker text not null,
  report_data jsonb not null,
  filing_period text,
  filing_date text,
  gemini_model text,
  created_at timestamptz default now(),
  expires_at timestamptz,

  constraint unique_ticker_period unique (ticker, filing_period)
);
create index idx_reports_ticker on public.reports(ticker);
create index idx_reports_expires on public.reports(expires_at);

-- Journal messages
create table public.journal_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  ticker text not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);
create index idx_journal_user_ticker on public.journal_messages(user_id, ticker);

-- Tracked commitments
create table public.commitments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  ticker text not null,
  text text not null,
  threshold text,
  check_date text,
  status text default 'watching' check (status in ('watching', 'ok', 'warning', 'fired')),
  source_message_id uuid references public.journal_messages(id),
  created_at timestamptz default now()
);
create index idx_commitments_user on public.commitments(user_id, ticker);

-- Row-level security
alter table public.profiles enable row level security;
alter table public.journal_messages enable row level security;
alter table public.commitments enable row level security;
alter table public.reports enable row level security;

create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can read own journal" on public.journal_messages
  for select using (auth.uid() = user_id);
create policy "Users can insert own journal" on public.journal_messages
  for insert with check (auth.uid() = user_id);

create policy "Users can manage own commitments" on public.commitments
  for all using (auth.uid() = user_id);

-- Reports are public (cached for all users)
create policy "Reports are readable by all" on public.reports
  for select using (true);
create policy "Reports are insertable by service role" on public.reports
  for insert with check (true);
create policy "Reports are updatable by service role" on public.reports
  for update with check (true);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
