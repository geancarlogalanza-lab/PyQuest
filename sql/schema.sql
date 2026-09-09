-- PyQuest cloud sync — run once in your Supabase project's SQL editor.
--
-- Progress is stored as one JSON document per user. Row-level security means a
-- signed-in user can only ever read and write their own row.

create table if not exists public.progress (
  user_id    uuid primary key references auth.users on delete cascade,
  payload    jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

drop policy if exists "read own progress"   on public.progress;
drop policy if exists "insert own progress" on public.progress;
drop policy if exists "update own progress" on public.progress;

create policy "read own progress" on public.progress
  for select using (auth.uid() = user_id);

create policy "insert own progress" on public.progress
  for insert with check (auth.uid() = user_id);

create policy "update own progress" on public.progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Then in PyQuest: Settings -> Backup & sync -> paste your project URL and anon key.
