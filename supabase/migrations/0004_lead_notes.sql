-- Phase 07 — Leads management
-- Append-only notes per lead (editor/admin).

begin;

create table public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index lead_notes_lead_created_idx on public.lead_notes (lead_id, created_at desc);

alter table public.lead_notes enable row level security;

-- editor / admin may read and insert. Updates/deletes never allowed (append-only).
create policy lead_notes_read on public.lead_notes
  for select using (public.is_editor_or_admin());

create policy lead_notes_insert on public.lead_notes
  for insert with check (
    public.is_editor_or_admin() and author_id = auth.uid()
  );

commit;
