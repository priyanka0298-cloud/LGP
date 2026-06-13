-- ============================================================
-- Period / Cycle Tracker
-- ============================================================

create table if not exists public.period_logs (
  id              uuid        default gen_random_uuid() primary key,
  user_id         uuid        references auth.users(id) on delete cascade not null,
  start_date      date        not null,
  end_date        date,
  flow_intensity  text        check (flow_intensity in ('spotting', 'light', 'medium', 'heavy')),
  symptoms        text[]      default '{}',
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Cycle length is stored on the profile so predictions survive log deletion
alter table public.profiles
  add column if not exists avg_cycle_length  int default 28,
  add column if not exists avg_period_length int default 5;

-- RLS
alter table public.period_logs enable row level security;

create policy "Users can manage own period logs"
  on public.period_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- updated_at trigger
create or replace function public.handle_period_log_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger period_logs_updated_at
  before update on public.period_logs
  for each row execute function public.handle_period_log_updated_at();
