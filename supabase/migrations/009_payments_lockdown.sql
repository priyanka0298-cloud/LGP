-- Payments lockdown
-- Users could previously insert/update their own subscriptions and template_purchases rows,
-- which let anyone grant themselves Premium or a paid template from the browser.
-- From now on only the server (service role: Stripe webhook + API routes) writes these tables.

-- 1. Track whether an owned template is currently applied, so removing a paid
--    template from your planner doesn't throw away the purchase.
alter table public.template_purchases
  add column if not exists applied boolean not null default true;

-- 2. Subscriptions: read-only for users
drop policy if exists "subscriptions_own" on public.subscriptions;
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);

-- 3. Template purchases: read-only for users
drop policy if exists "purchases_own" on public.template_purchases;
drop policy if exists "purchases_select_own" on public.template_purchases;
create policy "purchases_select_own" on public.template_purchases
  for select using (auth.uid() = user_id);
