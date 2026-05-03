-- Phase 21 — Organizations + projects.organization_id (tenant foundation)

begin;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.tg_set_updated_at();

alter table public.organizations enable row level security;

insert into public.organizations (name, slug) values ('Default', 'default');

alter table public.projects
  add column organization_id uuid references public.organizations(id) on delete restrict;

update public.projects p
set organization_id = o.id
from public.organizations o
where o.slug = 'default'
  and p.organization_id is null;

alter table public.projects
  alter column organization_id set not null;

create index if not exists projects_organization_id_idx on public.projects (organization_id);

create policy organizations_select on public.organizations
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.projects p
      where p.organization_id = organizations.id
        and public.can_access_project(p.id)
    )
  );

create policy organizations_admin_all on public.organizations
  for all using (public.is_admin()) with check (public.is_admin());

commit;
