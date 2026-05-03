-- Phase 09.1 — RLS hardening
-- Eliminate infinite recursion on policies that query `profiles` from within
-- `profiles` RLS (or that cascade into it). We centralize the admin check in
-- a `SECURITY DEFINER` helper so the inner lookup bypasses RLS.

begin;

-- Reusable predicate. SECURITY DEFINER + explicit search_path = no recursion,
-- no search-path hijack.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and not disabled
  )
$$;

-- profiles --------------------------------------------------------------

drop policy if exists profiles_admin_read on public.profiles;
drop policy if exists profiles_admin_update on public.profiles;
drop policy if exists profiles_admin_insert on public.profiles;
drop policy if exists profiles_admin_delete on public.profiles;

create policy profiles_admin_read on public.profiles
  for select using (public.is_admin());

create policy profiles_admin_update on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

create policy profiles_admin_insert on public.profiles
  for insert with check (public.is_admin());

create policy profiles_admin_delete on public.profiles
  for delete using (public.is_admin());

-- invites ---------------------------------------------------------------

drop policy if exists invites_admin_all on public.invites;
create policy invites_admin_all on public.invites
  for all using (public.is_admin()) with check (public.is_admin());

-- leads -----------------------------------------------------------------

drop policy if exists leads_admin_delete on public.leads;
drop policy if exists leads_admin_update on public.leads;

create policy leads_admin_delete on public.leads
  for delete using (public.is_admin());

create policy leads_admin_update on public.leads
  for update using (public.is_editor_or_admin()) with check (public.is_editor_or_admin());

-- projects / members ----------------------------------------------------

drop policy if exists projects_admin_write on public.projects;
drop policy if exists projects_read on public.projects;
drop policy if exists members_admin_all on public.project_members;

create policy projects_admin_write on public.projects
  for all using (public.is_admin()) with check (public.is_admin());

create policy projects_read on public.projects
  for select using (
    owner_id = auth.uid()
    or exists (
      select 1 from public.project_members m
      where m.project_id = projects.id and m.user_id = auth.uid()
    )
    or public.is_admin()
  );

create policy members_admin_all on public.project_members
  for all using (public.is_admin()) with check (public.is_admin());

-- audit_log -------------------------------------------------------------

drop policy if exists audit_log_admin_read on public.audit_log;
create policy audit_log_admin_read on public.audit_log
  for select using (public.is_admin());

commit;
