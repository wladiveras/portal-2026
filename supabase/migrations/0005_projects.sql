-- Phase 08 — Projects Agile
-- Projects, members, sprints, stories, tasks, labels.

begin;

create type public.task_status as enum ('todo','doing','review','done');

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  name text not null,
  slug text unique not null,
  description text,
  color text,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.tg_set_updated_at();

create table public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table public.sprints (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  starts_at date not null,
  ends_at date not null,
  goal text,
  created_at timestamptz not null default now()
);

create index sprints_project_starts_idx on public.sprints (project_id, starts_at desc);

create table public.stories (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  body text,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  sprint_id uuid references public.sprints(id) on delete set null,
  story_id uuid references public.stories(id) on delete set null,
  title text not null,
  description text,
  status public.task_status not null default 'todo',
  points int,
  assignee_id uuid references auth.users(id) on delete set null,
  position int not null default 0,
  done_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_project_status_idx on public.tasks (project_id, status, position);
create index tasks_sprint_idx on public.tasks (sprint_id) where sprint_id is not null;

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.tg_set_updated_at();

-- Auto-stamp done_at when status moves in/out of 'done'.
create or replace function public.tg_tasks_done_at()
returns trigger language plpgsql set search_path = public as $$
begin
  if (tg_op = 'INSERT' and new.status = 'done') then
    new.done_at = coalesce(new.done_at, now());
  elsif (tg_op = 'UPDATE' and new.status <> old.status) then
    if new.status = 'done' then
      new.done_at = coalesce(new.done_at, now());
    else
      new.done_at = null;
    end if;
  end if;
  return new;
end;
$$;

create trigger tasks_done_at_trg
  before insert or update on public.tasks
  for each row execute function public.tg_tasks_done_at();

create table public.task_labels (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  color text
);

create table public.task_label_links (
  task_id uuid not null references public.tasks(id) on delete cascade,
  label_id uuid not null references public.task_labels(id) on delete cascade,
  primary key (task_id, label_id)
);

-- RLS ------------------------------------------------------------

alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.sprints enable row level security;
alter table public.stories enable row level security;
alter table public.tasks enable row level security;
alter table public.task_labels enable row level security;
alter table public.task_label_links enable row level security;

-- Helper: can current user access this project?
create or replace function public.can_access_project(pid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.projects p
    where p.id = pid and (
      p.owner_id = auth.uid()
      or exists (select 1 from public.project_members m where m.project_id = pid and m.user_id = auth.uid())
      or exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
    )
  )
$$;

-- Projects: members + owner read; admin writes everything.
create policy projects_read on public.projects for select using (
  owner_id = auth.uid()
  or exists (select 1 from public.project_members m where m.project_id = projects.id and m.user_id = auth.uid())
  or exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
);

create policy projects_admin_write on public.projects for all
  using (exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin'))
  with check (exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin'));

-- project_members: admin manages.
create policy members_admin_all on public.project_members for all
  using (exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin'))
  with check (exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin'));

create policy members_self_read on public.project_members for select using (
  user_id = auth.uid() or public.can_access_project(project_id)
);

-- Shared read/write via can_access_project for the rest.
create policy sprints_read on public.sprints for select using (public.can_access_project(project_id));
create policy stories_read on public.stories for select using (public.can_access_project(project_id));
create policy tasks_read on public.tasks for select using (public.can_access_project(project_id));
create policy labels_read on public.task_labels for select using (public.can_access_project(project_id));
create policy label_links_read on public.task_label_links for select using (
  exists (select 1 from public.tasks t where t.id = task_label_links.task_id and public.can_access_project(t.project_id))
);

-- Editors/admin write tasks/sprints/stories/labels of accessible projects.
create policy sprints_editor_write on public.sprints for all
  using (public.is_editor_or_admin() and public.can_access_project(project_id))
  with check (public.is_editor_or_admin() and public.can_access_project(project_id));

create policy stories_editor_write on public.stories for all
  using (public.is_editor_or_admin() and public.can_access_project(project_id))
  with check (public.is_editor_or_admin() and public.can_access_project(project_id));

create policy tasks_editor_write on public.tasks for all
  using (public.is_editor_or_admin() and public.can_access_project(project_id))
  with check (public.is_editor_or_admin() and public.can_access_project(project_id));

create policy labels_editor_write on public.task_labels for all
  using (public.is_editor_or_admin() and public.can_access_project(project_id))
  with check (public.is_editor_or_admin() and public.can_access_project(project_id));

create policy label_links_editor_write on public.task_label_links for all
  using (
    public.is_editor_or_admin()
    and exists (select 1 from public.tasks t where t.id = task_label_links.task_id and public.can_access_project(t.project_id))
  )
  with check (
    public.is_editor_or_admin()
    and exists (select 1 from public.tasks t where t.id = task_label_links.task_id and public.can_access_project(t.project_id))
  );

commit;
