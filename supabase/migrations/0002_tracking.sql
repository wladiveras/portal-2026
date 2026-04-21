-- Phase 05 — Tracking infra
-- First-party visitor + lead + event model. All writes are expected to flow
-- through Nitro handlers using the service role. Authenticated dashboard
-- users (role editor/admin) read via RLS.

begin;

-- 1. ENUM ---------------------------------------------------------------

create type public.lead_status as enum ('new','contacted','qualified','proposal','won','lost');

-- 2. VISITORS ------------------------------------------------------------

create table public.visitors (
  id uuid primary key default gen_random_uuid(),
  anon_id text unique not null,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  user_agent text,
  language text,
  country text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text
);

create index visitors_last_seen_idx on public.visitors (last_seen desc);

-- 3. LEADS ---------------------------------------------------------------

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid references public.visitors(id) on delete set null,
  status public.lead_status not null default 'new',
  source text,
  display_name text,
  contact_value text,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  notes text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now()
);

create index leads_status_idx on public.leads (status);
create index leads_last_seen_idx on public.leads (last_seen desc);
create index leads_utm_campaign_idx on public.leads (utm_campaign);

-- 4. LEAD_EVENTS ---------------------------------------------------------

create table public.lead_events (
  id bigint generated always as identity primary key,
  visitor_id uuid references public.visitors(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  type text not null,
  target text,
  path text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index lead_events_created_at_idx on public.lead_events (created_at desc);
create index lead_events_type_idx on public.lead_events (type);
create index lead_events_visitor_idx on public.lead_events (visitor_id);

-- 5. LINK_CLICKS ---------------------------------------------------------

create table public.link_clicks (
  id bigint generated always as identity primary key,
  visitor_id uuid references public.visitors(id) on delete cascade,
  href text not null,
  label text,
  created_at timestamptz not null default now()
);

create index link_clicks_created_at_idx on public.link_clicks (created_at desc);

-- 6. RLS -----------------------------------------------------------------

alter table public.visitors enable row level security;
alter table public.leads enable row level security;
alter table public.lead_events enable row level security;
alter table public.link_clicks enable row level security;

-- Reusable role predicate: is current user admin or editor?
create or replace function public.is_editor_or_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','editor') and not disabled
  )
$$;

-- Reads (dashboard) — admin + editor only. Viewer is intentionally blocked
-- here; phase 07 introduces viewer-friendly views if needed.
create policy visitors_read on public.visitors for select using (public.is_editor_or_admin());
create policy leads_read on public.leads for select using (public.is_editor_or_admin());
create policy lead_events_read on public.lead_events for select using (public.is_editor_or_admin());
create policy link_clicks_read on public.link_clicks for select using (public.is_editor_or_admin());

-- Writes are handled by Nitro using the service role (bypasses RLS).
-- No INSERT/UPDATE/DELETE policy is granted to `authenticated`.

-- Admin may delete leads (phase 07 feature parity).
create policy leads_admin_delete on public.leads for delete using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Admin may update lead status/notes (phase 07).
create policy leads_admin_update on public.leads for update using (
  public.is_editor_or_admin()
) with check (public.is_editor_or_admin());

commit;
