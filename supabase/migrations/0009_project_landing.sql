-- Phase 22 — Project landing (public CMS slice) + optional leads.project_id

begin;

-- 1. Landing content (1:1 com projeto; slug público único)
create table public.project_landing (
  project_id uuid primary key references public.projects(id) on delete cascade,
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft', 'published')),
  draft_json jsonb not null default '{}'::jsonb,
  published_json jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger project_landing_set_updated_at
  before update on public.project_landing
  for each row execute function public.tg_set_updated_at();

create index project_landing_status_idx on public.project_landing (status);

-- 2. Leads opcionalmente ligados a projeto (captura landing por projeto)
alter table public.leads
  add column project_id uuid references public.projects(id) on delete set null;

create index leads_project_id_idx on public.leads (project_id) where project_id is not null;

-- 3. RLS project_landing
alter table public.project_landing enable row level security;

create policy project_landing_public_select on public.project_landing
  for select using (status = 'published');

create policy project_landing_member_select on public.project_landing
  for select using (public.can_access_project(project_id));

create policy project_landing_editor_write on public.project_landing
  for all
  using (public.is_editor_or_admin() and public.can_access_project(project_id))
  with check (public.is_editor_or_admin() and public.can_access_project(project_id));

create policy project_landing_admin_all on public.project_landing
  for all using (public.is_admin()) with check (public.is_admin());

commit;
