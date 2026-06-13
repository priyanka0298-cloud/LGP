-- ============================================================
-- LAZY GIRL PLANNER — Complete Database Schema
-- ============================================================
-- Run this in your Supabase SQL editor or via `supabase db push`

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text,
  display_name text,
  avatar_url text,
  timezone text default 'America/New_York',
  pronouns text,
  bio text,
  -- Personalization
  theme text default 'light' check (theme in ('light', 'dark', 'auto')),
  accent_color text default 'rose' check (accent_color in ('rose', 'lavender', 'peach', 'sage', 'sky')),
  planning_style text default 'balanced' check (planning_style in ('minimal', 'balanced', 'detailed')),
  -- Onboarding
  onboarding_completed boolean default false,
  onboarding_step integer default 0,
  -- Wellness
  cycle_tracking_enabled boolean default false,
  cycle_length integer default 28,
  last_period_date date,
  -- Notifications
  daily_reminder_enabled boolean default true,
  daily_reminder_time time default '09:00:00',
  weekly_review_day integer default 0, -- 0=Sunday
  push_enabled boolean default false,
  -- Metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  plan text default 'free' check (plan in ('free', 'premium', 'lifetime')),
  status text default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  trial_end timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- TASKS
-- ============================================================
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  -- Organization
  category text default 'must_do' check (category in ('must_do', 'should_do', 'if_energy', 'someday')),
  priority integer default 2 check (priority between 1 and 5),
  -- Status
  status text default 'pending' check (status in ('pending', 'in_progress', 'done', 'skipped', 'rolled_over')),
  completed_at timestamptz,
  -- Scheduling
  due_date date,
  due_time time,
  scheduled_date date,
  time_block_start time,
  time_block_end time,
  estimated_minutes integer,
  actual_minutes integer,
  -- Tags & metadata
  tags text[] default '{}',
  color text,
  emoji text,
  -- Recurrence
  is_recurring boolean default false,
  recurrence_rule text, -- iCal RRULE format
  parent_task_id uuid references public.tasks(id),
  -- Brain dump to task conversion
  from_brain_dump boolean default false,
  ai_generated boolean default false,
  -- Sort order for drag-and-drop
  sort_order float default 0,
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- HABITS
-- ============================================================
create table public.habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  emoji text,
  color text default '#f43f6e',
  -- Frequency
  frequency text default 'daily' check (frequency in ('daily', 'weekdays', 'weekends', 'weekly', 'custom')),
  frequency_days integer[], -- [1,2,3,4,5] for Mon-Fri
  target_count integer default 1,
  -- Tracking
  streak_current integer default 0,
  streak_longest integer default 0,
  total_completions integer default 0,
  -- Display
  category text default 'wellness' check (category in ('wellness', 'fitness', 'mindfulness', 'productivity', 'social', 'learning', 'creative', 'other')),
  is_active boolean default true,
  sort_order float default 0,
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.habit_completions (
  id uuid default uuid_generate_v4() primary key,
  habit_id uuid references public.habits(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  completed_date date not null,
  count integer default 1,
  note text,
  created_at timestamptz default now(),
  unique(habit_id, completed_date)
);

-- ============================================================
-- MOODS
-- ============================================================
create table public.moods (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  -- Mood score 1-10
  mood_score integer check (mood_score between 1 and 10),
  mood_emoji text,
  mood_label text check (mood_label in ('terrible', 'rough', 'meh', 'okay', 'good', 'great', 'amazing')),
  -- Energy level 1-5
  energy_level integer check (energy_level between 1 and 5),
  -- Optional notes
  note text,
  -- Context tags
  tags text[] default '{}',
  -- Cycle phase (if tracking)
  cycle_phase text check (cycle_phase in ('menstrual', 'follicular', 'ovulation', 'luteal')),
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, date)
);

-- ============================================================
-- JOURNAL ENTRIES
-- ============================================================
create table public.journal_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  entry_date date not null,
  entry_type text default 'daily' check (entry_type in ('daily', 'weekly_reflection', 'monthly_reflection', 'free_write', 'gratitude', 'brain_dump')),
  title text,
  -- Content sections
  content jsonb default '{}',
  -- For daily: { top_priorities, brain_dump, gratitude, tomorrow_note, prompts: [{q, a}] }
  -- For reflections: { prompts: [{q, a}], tiny_wins, self_care }
  -- Mood snapshot at time of entry
  mood_snapshot integer,
  energy_snapshot integer,
  -- AI-enhanced
  ai_summary text,
  ai_insights text,
  -- Visibility
  is_private boolean default true,
  is_pinned boolean default false,
  tags text[] default '{}',
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- GOALS
-- ============================================================
create table public.goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  -- Vision
  why text, -- "why this matters to me"
  vision_note text,
  -- Categorization
  category text default 'personal' check (category in ('personal', 'career', 'health', 'financial', 'relationships', 'learning', 'creative', 'spiritual', 'other')),
  -- Timeline
  time_horizon text default 'monthly' check (time_horizon in ('weekly', 'monthly', 'quarterly', 'yearly', 'long_term')),
  target_date date,
  -- Progress
  status text default 'active' check (status in ('active', 'paused', 'achieved', 'released')),
  progress_percent integer default 0 check (progress_percent between 0 and 100),
  -- Display
  emoji text,
  color text,
  is_pinned boolean default false,
  sort_order float default 0,
  -- AI-generated breakdown
  ai_steps jsonb, -- [{step, done}]
  -- Timestamps
  achieved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- WEEKLY PLANS
-- ============================================================
create table public.weekly_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  week_start date not null, -- Monday of the week
  week_end date not null,   -- Sunday of the week
  -- Plan content
  theme text,             -- optional weekly theme
  intention text,         -- weekly intention/mantra
  big_three text[] default '{}', -- top 3 goals for the week
  energy_forecast text check (energy_forecast in ('high', 'medium', 'low', 'mixed')),
  -- Reflection (filled at end of week)
  reflection_done boolean default false,
  reflection_content jsonb,
  -- AI-generated
  ai_suggestion text,
  -- Status
  status text default 'active' check (status in ('planning', 'active', 'completed', 'soft_reset')),
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, week_start)
);

-- ============================================================
-- AI GENERATIONS (cache + history)
-- ============================================================
create table public.ai_generations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  generation_type text not null check (generation_type in (
    'brain_dump', 'task_prioritization', 'affirmation', 'schedule',
    'goal_breakdown', 'burnout_check', 'weekly_plan', 'reflection_prompts',
    'low_energy_mode', 'romanticize_life'
  )),
  -- Input and output
  input_data jsonb,
  output_data jsonb,
  -- Usage
  tokens_used integer,
  model_used text,
  -- Feedback
  user_rating integer check (user_rating between 1 and 5),
  user_feedback text,
  -- Timestamps
  created_at timestamptz default now()
);

-- ============================================================
-- PLANNER TEMPLATES (Marketplace items)
-- ============================================================
create table public.planner_templates (
  id uuid default uuid_generate_v4() primary key,
  creator_id uuid references public.profiles(id) on delete set null,
  -- Content
  title text not null,
  description text,
  long_description text,
  category text not null check (category in ('weekly', 'daily', 'monthly', 'goal', 'habit', 'journal', 'vision_board', 'bundle')),
  tags text[] default '{}',
  -- Files
  preview_images text[], -- Supabase storage URLs
  file_url text,          -- downloadable PDF/file URL
  file_type text default 'pdf',
  file_size_kb integer,
  -- Pricing
  price_cents integer default 0, -- 0 = free
  stripe_price_id text,
  -- Stats
  download_count integer default 0,
  rating_average float,
  rating_count integer default 0,
  -- Status
  is_published boolean default false,
  is_featured boolean default false,
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.template_purchases (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  template_id uuid references public.planner_templates(id) on delete cascade not null,
  stripe_payment_intent_id text,
  amount_cents integer,
  created_at timestamptz default now(),
  unique(user_id, template_id)
);

create table public.template_reviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  template_id uuid references public.planner_templates(id) on delete cascade not null,
  rating integer not null check (rating between 1 and 5),
  review_text text,
  is_verified_purchase boolean default false,
  created_at timestamptz default now(),
  unique(user_id, template_id)
);

-- ============================================================
-- FOCUS ROOMS (Body doubling)
-- ============================================================
create table public.focus_rooms (
  id uuid default uuid_generate_v4() primary key,
  creator_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  focus_topic text,
  -- Settings
  is_public boolean default true,
  max_participants integer default 10,
  duration_minutes integer default 25, -- Pomodoro default
  -- Status
  status text default 'waiting' check (status in ('waiting', 'active', 'completed')),
  started_at timestamptz,
  ends_at timestamptz,
  -- Timestamps
  created_at timestamptz default now()
);

create table public.focus_room_participants (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references public.focus_rooms(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamptz default now(),
  left_at timestamptz,
  unique(room_id, user_id)
);

-- ============================================================
-- REFERRALS
-- ============================================================
create table public.referrals (
  id uuid default uuid_generate_v4() primary key,
  referrer_id uuid references public.profiles(id) on delete cascade not null,
  referred_email text not null,
  referred_user_id uuid references public.profiles(id) on delete set null,
  -- Referral code used
  referral_code text not null,
  status text default 'pending' check (status in ('pending', 'signed_up', 'converted', 'rewarded')),
  -- Reward tracking
  reward_granted boolean default false,
  reward_type text,
  -- Timestamps
  created_at timestamptz default now(),
  converted_at timestamptz
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
create index idx_tasks_user_id on public.tasks(user_id);
create index idx_tasks_scheduled_date on public.tasks(scheduled_date);
create index idx_tasks_due_date on public.tasks(due_date);
create index idx_tasks_status on public.tasks(status);
create index idx_habits_user_id on public.habits(user_id);
create index idx_habit_completions_habit_id on public.habit_completions(habit_id);
create index idx_habit_completions_date on public.habit_completions(completed_date);
create index idx_moods_user_date on public.moods(user_id, date);
create index idx_journal_user_date on public.journal_entries(user_id, entry_date);
create index idx_goals_user_id on public.goals(user_id);
create index idx_ai_generations_user_id on public.ai_generations(user_id);
create index idx_weekly_plans_user_week on public.weekly_plans(user_id, week_start);

-- Full text search on tasks
create index idx_tasks_title_fts on public.tasks using gin(to_tsvector('english', title));

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.tasks enable row level security;
alter table public.habits enable row level security;
alter table public.habit_completions enable row level security;
alter table public.moods enable row level security;
alter table public.journal_entries enable row level security;
alter table public.goals enable row level security;
alter table public.weekly_plans enable row level security;
alter table public.ai_generations enable row level security;
alter table public.planner_templates enable row level security;
alter table public.template_purchases enable row level security;
alter table public.template_reviews enable row level security;
alter table public.focus_rooms enable row level security;
alter table public.focus_room_participants enable row level security;
alter table public.referrals enable row level security;

-- Profiles: users see own + update own
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- Subscriptions: own only
create policy "subscriptions_own" on public.subscriptions for all using (auth.uid() = user_id);

-- Tasks: own only
create policy "tasks_own" on public.tasks for all using (auth.uid() = user_id);

-- Habits: own only
create policy "habits_own" on public.habits for all using (auth.uid() = user_id);
create policy "habit_completions_own" on public.habit_completions for all using (auth.uid() = user_id);

-- Moods: own only
create policy "moods_own" on public.moods for all using (auth.uid() = user_id);

-- Journal: own only
create policy "journal_own" on public.journal_entries for all using (auth.uid() = user_id);

-- Goals: own only
create policy "goals_own" on public.goals for all using (auth.uid() = user_id);

-- Weekly plans: own only
create policy "weekly_plans_own" on public.weekly_plans for all using (auth.uid() = user_id);

-- AI generations: own only
create policy "ai_generations_own" on public.ai_generations for all using (auth.uid() = user_id);

-- Templates: published visible to all, creators manage own
create policy "templates_select_published" on public.planner_templates for select using (is_published = true or auth.uid() = creator_id);
create policy "templates_manage_own" on public.planner_templates for all using (auth.uid() = creator_id);

-- Template purchases: own only
create policy "purchases_own" on public.template_purchases for all using (auth.uid() = user_id);

-- Template reviews: select all, insert/update own
create policy "reviews_select_all" on public.template_reviews for select using (true);
create policy "reviews_manage_own" on public.template_reviews for all using (auth.uid() = user_id);

-- Focus rooms: select public, manage own
create policy "focus_rooms_select" on public.focus_rooms for select using (is_public = true or auth.uid() = creator_id);
create policy "focus_rooms_manage_own" on public.focus_rooms for all using (auth.uid() = creator_id);
create policy "focus_participants_own" on public.focus_room_participants for all using (auth.uid() = user_id);

-- Referrals: own only
create policy "referrals_own" on public.referrals for all using (auth.uid() = referrer_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active');
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();
create trigger tasks_updated_at before update on public.tasks
  for each row execute procedure public.handle_updated_at();
create trigger habits_updated_at before update on public.habits
  for each row execute procedure public.handle_updated_at();
create trigger goals_updated_at before update on public.goals
  for each row execute procedure public.handle_updated_at();
create trigger journal_updated_at before update on public.journal_entries
  for each row execute procedure public.handle_updated_at();
create trigger subscriptions_updated_at before update on public.subscriptions
  for each row execute procedure public.handle_updated_at();

-- Update habit streak on completion
create or replace function public.update_habit_streak()
returns trigger language plpgsql
as $$
declare
  yesterday date := current_date - interval '1 day';
  streak integer;
begin
  if TG_OP = 'INSERT' then
    -- Check if completed yesterday to extend streak
    select streak_current into streak
    from public.habits where id = new.habit_id;

    if exists (
      select 1 from public.habit_completions
      where habit_id = new.habit_id and completed_date = yesterday
    ) then
      update public.habits
      set streak_current = streak + 1,
          streak_longest = greatest(streak_longest, streak + 1),
          total_completions = total_completions + 1
      where id = new.habit_id;
    else
      update public.habits
      set streak_current = 1,
          total_completions = total_completions + 1
      where id = new.habit_id;
    end if;
  end if;
  return new;
end;
$$;

create trigger habit_completion_streak
  after insert on public.habit_completions
  for each row execute procedure public.update_habit_streak();
