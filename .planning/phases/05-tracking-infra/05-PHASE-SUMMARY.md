# Phase 05 — execution summary

Fase 05 executada usando o **MCP do Supabase** (`plugin-supabase-supabase`) para aplicar migrations e gerar tipos, ao invés do SQL Editor manual.

## Preparação via Supabase MCP

- `list_projects` → confirmou o projeto `wladi-portal` (id `oqslwfxugwvaqsfbemzi`) já ligado ao `.env` do repo.
- `apply_migration` → `0001_auth` aplicada; depois `0001a_auth_search_path` para tapar `function_search_path_mutable` em `tg_set_updated_at`.
- `apply_migration` → `0002_tracking` aplicada. `get_advisors {type:security}` voltou com **0 lints**.
- `generate_typescript_types` → substituiu o stub em `app/types/database.types.ts` pelos tipos oficiais (profiles + invites + visitors + leads + lead_events + link_clicks + enums).

## Código

- **Schema** — `supabase/migrations/0002_tracking.sql`:
  - Enum `lead_status`, tabelas `visitors`, `leads`, `lead_events`, `link_clicks` com índices apropriados.
  - Função `public.is_editor_or_admin()` (security definer, search_path explícito).
  - RLS deny-all + policies de leitura para `admin/editor`; `admin` pode deletar/updatear leads; escritas sempre via service role no server.
- **Utilitário** — `app/utils/utm.ts` com `parseUtmFromSearch`, `parseUtmFromUrl`, `hasAnyUtm` + testes em `tests/unit/utils/utm.spec.ts` (7 tests).
- **Composables:**
  - `app/composables/useTracker.ts` — gerencia cookie `wv_anon_id` (90d, `SameSite=Lax`), honra `Do Not Track` e `VITE_TRACKING_ENABLED`, expõe `trackEvent` e `trackLead` (fire-and-forget; nunca quebra UX).
  - `app/composables/useSectionInView.ts` — usa `IntersectionObserver` + `sessionStorage` para emitir um único `section_in_view` por id por sessão.
- **Plugin** — `app/plugins/tracker.client.ts` emite `page_view` em `app:mounted` e após cada `router.afterEach`.
- **Server utils** — `server/utils/supabase.ts` (`serverSupabaseServiceRole`), só acessível do Nitro.
- **Endpoints Nitro:**
  - `server/api/track/event.post.ts` — valida `anonId` + `type`, upserts `visitors` por `anon_id`, insere em `lead_events`.
  - `server/api/track/lead.post.ts` — upserts visitor, cria `leads` e um `lead_events` do tipo `lead_<source>`; retorna `{ leadId }`.
- **Instrumentação da landing:**
  - `app/components/sections/ContactFooterSection.vue` — WhatsApp → `trackLead({ source: 'whatsapp' })`; email → `trackLead({ source: 'email' })`; social → `trackEvent({ type: 'click_social', meta: { label } })`; `useSectionInView(root, 'contact')`.
  - `app/utils/inPageHashNav.ts` — `navigateToHash` dispara `trackEvent({ type: 'hash_nav', target: id })` depois do scroll.

## Verificação

```
npm run typecheck   # exit 0 (só warnings de env quando .env sem service key)
npm run test        # 6 files / 15 tests passed
npm run build       # endpoints /api/track/event e /api/track/lead emitidos no Nitro
```

## Pendências manuais para tracking funcionar

1. Em `.env`, preencher `SUPABASE_SERVICE_KEY=` com o **service role** key do projeto (obtido no painel da Supabase → Project Settings → API → `service_role`). O MCP não expõe essa chave.
2. Em produção, setar a mesma variável como secret no host (Vercel/Netlify/etc). Nunca commitar.
3. Depois do deploy, abrir a landing e confirmar em Supabase SQL Editor que `public.lead_events` recebe registos de `page_view` e `hash_nav`.

## Próxima fase

Fase **06 — Dashboard Home** (planos em `.planning/phases/06-dashboard-home/`).
