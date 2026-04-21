-- Phase 04 — Foundation & Auth
-- Creates RBAC backbone: user_role enum, profiles (tied to auth.users),
-- invites table, handle_new_user trigger, RLS policies (deny-all default).

begin;

-- 1. ROLE ENUM -----------------------------------------------------------

create type public.user_role as enum ('admin', 'editor', 'viewer');

-- 2. PROFILES ------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role public.user_role not null default 'viewer',
  disabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.tg_set_updated_at();

-- 3. INVITES -------------------------------------------------------------

create table public.invites (
  token uuid primary key default gen_random_uuid(),
  email text not null,
  role public.user_role not null default 'viewer',
  expires_at timestamptz not null default (now() + interval '7 days'),
  used_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index invites_email_idx on public.invites (email) where used_at is null;

-- 4. HANDLE_NEW_USER -----------------------------------------------------

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  invited_role public.user_role;
begin
  -- First user bootstraps as admin
  if not exists (select 1 from public.profiles) then
    insert into public.profiles (id, role) values (new.id, 'admin');
    return new;
  end if;

  select role into invited_role
  from public.invites
  where lower(email) = lower(new.email)
    and used_at is null
    and expires_at > now()
  order by created_at desc
  limit 1;

  insert into public.profiles (id, role)
  values (new.id, coalesce(invited_role, 'viewer'));

  update public.invites
  set used_at = now()
  where lower(email) = lower(new.email) and used_at is null;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. RLS -----------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.invites enable row level security;

-- profiles: everyone authenticated can read own, admin reads all.
create policy profiles_self_read on public.profiles
  for select using (id = auth.uid());

create policy profiles_admin_read on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- profiles: self can update only non-privileged cols; admin updates anything.
create policy profiles_self_update on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

create policy profiles_admin_update on public.profiles
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy profiles_admin_insert on public.profiles
  for insert with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy profiles_admin_delete on public.profiles
  for delete using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- invites: admin only.
create policy invites_admin_all on public.invites
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

commit;
