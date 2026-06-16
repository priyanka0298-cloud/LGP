-- Extend journal_entries entry_type to include food_log
ALTER TABLE journal_entries DROP CONSTRAINT IF EXISTS journal_entries_entry_type_check;

ALTER TABLE journal_entries
  ADD CONSTRAINT journal_entries_entry_type_check
  CHECK (entry_type IN (
    'daily', 'weekly_reflection', 'monthly_reflection',
    'free_write', 'gratitude', 'brain_dump', 'food_log'
  ));
