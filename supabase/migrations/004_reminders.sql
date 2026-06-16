-- Push subscriptions (one per browser/device per user)
create table if not exists public.push_subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now(),
  unique(user_id, endpoint)
);

alter table public.push_subscriptions enable row level security;
create policy "push_subs_own" on public.push_subscriptions for all using (auth.uid() = user_id);

-- Reminders
create table if not exists public.reminders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  scheduled_time time not null,
  repeat_type text default 'daily' check (repeat_type in ('once', 'daily', 'weekdays', 'weekends', 'weekly')),
  repeat_days integer[] default null, -- 0=Sun..6=Sat, used for 'weekly'
  scheduled_date date default null,   -- used for 'once'
  is_active boolean default true,
  last_sent_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.reminders enable row level security;
create policy "reminders_own" on public.reminders for all using (auth.uid() = user_id);
create index idx_reminders_user_id on public.reminders(user_id);

create trigger reminders_updated_at before update on public.reminders
  for each row execute function public.handle_updated_at();
