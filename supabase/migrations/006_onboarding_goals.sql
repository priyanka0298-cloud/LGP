alter table public.profiles
  add column if not exists onboarding_goals text[] default '{}' not null;
