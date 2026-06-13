-- ============================================================
-- LAZY GIRL PLANNER — Seed Data
-- ============================================================
-- Sample planner templates for the marketplace

insert into public.planner_templates (
  title, description, category, tags, price_cents, is_published, is_featured,
  preview_images, long_description
) values
(
  'The Lazy Girl Weekly Reset',
  'A gentle weekly planning template designed to ease you into the week without overwhelm.',
  'weekly',
  array['anti-hustle', 'gentle', 'popular'],
  0,
  true,
  true,
  array['https://images.unsplash.com/photo-1517842645767-c639042777db?w=400'],
  'Start each week with intention, not pressure. This template includes: weekly theme-setting, energy check-in, top 3 lazy girl goals (must do / should do / if I have energy), a space for what you are NOT doing this week, and a gentle Friday reflection. Perfect for neurodivergent planners and burnt-out high achievers.'
),
(
  'Daily Soft Life Planner',
  'A daily page that honors your energy and celebrates small wins.',
  'daily',
  array['daily', 'soft-life', 'mood'],
  0,
  true,
  true,
  array['https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400'],
  'Each day is a new page. This template has: top 3 priorities, brain dump box, mood + energy selectors, meal + water tracker, habit checkboxes, reflection prompt, gratitude practice, and the magical "what can wait until tomorrow?" section. Never feel guilty about an incomplete to-do list again.'
),
(
  'Monthly Goal Setting Ritual',
  'Set meaningful goals with intention and self-compassion.',
  'goal',
  array['goals', 'monthly', 'vision'],
  499,
  true,
  false,
  array['https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400'],
  'A complete monthly goal-setting ritual that goes deeper than a list. Includes: reflection on last month, areas-of-life wheel, 3 monthly intentions, week-by-week breakdown, self-care commitments, and an end-of-month celebration ritual.'
),
(
  'Burnout Recovery Planner',
  'Gentle planning for when you are running on empty.',
  'daily',
  array['burnout', 'recovery', 'gentle', 'low-energy'],
  299,
  true,
  true,
  array['https://images.unsplash.com/photo-1515023115689-589c33041d3c?w=400'],
  'For the days (or weeks) when just getting out of bed feels like an achievement. This compassionate planner has: one-thing focus days, self-care check-ins, energy restoration practices, micro-wins tracking, and gentle prompts that never shame you for resting.'
),
(
  'Vision Board Digital Kit',
  'Create a gorgeous digital vision board inside your planner.',
  'vision_board',
  array['vision', 'creative', 'manifestation'],
  799,
  true,
  false,
  array['https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400'],
  'A curated collection of digital vision board templates, stickers, and prompts. Includes 12 themed boards for each month, affirmation cards, and guided visualization exercises.'
),
(
  'ADHD-Friendly Habit Tracker',
  'A dopamine-friendly habit tracker designed for how your brain actually works.',
  'habit',
  array['ADHD', 'habits', 'dopamine', 'neurodivergent'],
  0,
  true,
  true,
  array['https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400'],
  'Ditch the overwhelming 30-habit trackers. This template focuses on 5 keystone habits with colorful visual progress bars, streak celebrations, no-guilt missed day resets, and dopamine reward systems baked in.'
);
