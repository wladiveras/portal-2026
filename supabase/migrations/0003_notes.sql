-- Phase 06 — Dashboard Home (QuickNotes)
-- Per-user personal notes used by the Overview screen.

begin;

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notes_user_pinned_created_idx
  on public.notes (user_id, pinned desc, created_at desc);

create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.tg_set_updated_at();

alter table public.notes enable row level security;

create policy notes_self_select on public.notes
  for select using (user_id = auth.uid());

create policy notes_self_insert on public.notes
  for insert with check (user_id = auth.uid());

create policy notes_self_update on public.notes
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy notes_self_delete on public.notes
  for delete using (user_id = auth.uid());

commit;
