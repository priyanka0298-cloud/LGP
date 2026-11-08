-- Add "slate" as a neutral accent color option
alter table public.profiles drop constraint if exists profiles_accent_color_check;
alter table public.profiles add constraint profiles_accent_color_check
  check (accent_color in ('rose', 'lavender', 'peach', 'sage', 'sky', 'slate'));
