-- Phase 09 — Access management
-- Simple immutable audit trail + triggers for profiles/invites.

begin;

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_log_created_idx on public.audit_log (created_at desc);
create index audit_log_action_idx on public.audit_log (action);

alter table public.audit_log enable row level security;

-- Admin reads; no one writes directly through the API.
create policy audit_log_admin_read on public.audit_log
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Helper writable by trigger contexts (security definer functions).
create or replace function public.log_audit(
  p_action text,
  p_target_type text,
  p_target_id text,
  p_meta jsonb default '{}'::jsonb
) returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_log (actor_id, action, target_type, target_id, meta)
  values (auth.uid(), p_action, p_target_type, p_target_id, coalesce(p_meta, '{}'::jsonb));
end;
$$;

-- Triggers: profiles role / disabled changes + invites lifecycle.
create or replace function public.tg_audit_profiles()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'UPDATE') then
    if new.role is distinct from old.role then
      perform public.log_audit(
        'role_changed', 'profile', new.id::text,
        jsonb_build_object('from', old.role, 'to', new.role)
      );
    end if;
    if new.disabled is distinct from old.disabled then
      perform public.log_audit(
        case when new.disabled then 'profile_disabled' else 'profile_enabled' end,
        'profile', new.id::text, '{}'::jsonb
      );
    end if;
  elsif (tg_op = 'DELETE') then
    perform public.log_audit('profile_deleted', 'profile', old.id::text, '{}'::jsonb);
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists audit_profiles on public.profiles;
create trigger audit_profiles
  after update or delete on public.profiles
  for each row execute function public.tg_audit_profiles();

create or replace function public.tg_audit_invites()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'INSERT') then
    perform public.log_audit(
      'invite_created', 'invite', new.token::text,
      jsonb_build_object('email', new.email, 'role', new.role)
    );
  elsif (tg_op = 'UPDATE' and new.used_at is distinct from old.used_at and new.used_at is not null) then
    perform public.log_audit(
      'invite_consumed', 'invite', new.token::text,
      jsonb_build_object('email', new.email)
    );
  elsif (tg_op = 'DELETE') then
    perform public.log_audit(
      'invite_revoked', 'invite', old.token::text,
      jsonb_build_object('email', old.email)
    );
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists audit_invites on public.invites;
create trigger audit_invites
  after insert or update or delete on public.invites
  for each row execute function public.tg_audit_invites();

commit;
