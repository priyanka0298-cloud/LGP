insert into public.planner_templates
  (title, description, category, tags, price_cents, download_count, is_published, is_featured)
values
  (
    'The Softlivi Weekly Reset',
    'A gentle Sunday ritual to set your week with intention — not pressure. Adds 4 weekly habits and 3 starter tasks.',
    'weekly',
    ARRAY['weekly-reset', 'gentle', 'beginner', 'sunday', 'intention'],
    0, 0, true, true
  ),
  (
    'Daily Soft Life Planner',
    'Start and end each day with ease. Four simple daily habits that build a life you actually enjoy.',
    'daily',
    ARRAY['daily', 'morning-routine', 'evening-routine', 'habits', 'beginner'],
    0, 0, true, true
  ),
  (
    'Monthly Goal Setting Ritual',
    'Plan your month gently — define 3 goals, break them down, and schedule reflection time. No grind, just growth.',
    'monthly',
    ARRAY['goals', 'monthly', 'reflection', 'planning'],
    0, 0, true, true
  ),
  (
    'Burnout Recovery Planner',
    'For when you''re running on empty. Permission to rest, slow down, and rebuild your energy without guilt.',
    'habit',
    ARRAY['burnout', 'rest', 'recovery', 'self-care', 'mental-health'],
    0, 0, true, false
  ),
  (
    'ADHD-Friendly Focus Planner',
    'Built for brains that work differently. Time blocks, body doubling prompts, and low-pressure task structure.',
    'daily',
    ARRAY['adhd', 'focus', 'neurodivergent', 'time-blocking'],
    0, 0, true, false
  ),
  (
    'Mindful Morning Routine',
    'A 20-minute morning ritual that sets a calm, intentional tone for your day — no 5am wake-up required.',
    'daily',
    ARRAY['morning', 'mindfulness', 'routine', 'calm'],
    0, 0, true, false
  ),
  (
    'Journal Prompts for Self-Discovery',
    'Thirty days of journal prompts to help you understand yourself better — your values, patterns, and desires.',
    'journal',
    ARRAY['journal', 'self-discovery', 'prompts', 'reflection'],
    0, 0, true, false
  ),
  (
    'Habit Stacking Starter Kit',
    'Link new habits to existing ones for effortless consistency. Includes 5 habit pairs and a tracking ritual.',
    'habit',
    ARRAY['habits', 'habit-stacking', 'consistency', 'beginner'],
    0, 0, true, false
  );
