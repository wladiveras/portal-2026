# Roadmap — portal-2026

**Assumption:** No prior `ROADMAP.md` existed; Phase **03** introduces automated testing as the first tracked phase.

## Phase 03: Automated testing

**Goal:** Ship Vitest-based unit/integration tests aligned with current Pinia, Nitro API, and composables; add Playwright coverage for the single-page landing; gate CI with typecheck, unit tests, build, and E2E.

**Requirements:** `TEST-01`, `TEST-02`, `TEST-03`, `TEST-04`, `TEST-05`, `TEST-06`


| ID      | Statement                                                                                                                                                    |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TEST-01 | Vitest + official Nuxt/Vue testing stack is configured; `npm run test` (unit) and `npm run typecheck` exist and pass.                                        |
| TEST-02 | `usePortfolioStore().fetchPortfolioData` is covered: parallel-call deduplication, success merge into state, error sets `error` and `loading === false`.      |
| TEST-03 | `GET /api/portfolio` (Nitro handler) smoke: HTTP 200 and body contains required top-level keys for `PortfolioData`.                                          |
| TEST-04 | `useReducedMotion` and `useGsapCleanup` behaviors are tested with mocks (no full video/GSAP DOM).                                                            |
| TEST-05 | E2E: loading finishes, main sections visible, `FloatingNav` navigates to `#work` and `#contact-cta`, WhatsApp `href` matches `landing.contact.whatsappHref`. |
| TEST-06 | UAT humano documentado pós-suite automática: ver **Human UAT (TEST-06)** em `.planning/codebase/TESTING.md` (vídeo, hero/portfolio, motion).                  |


**Plans:** 6 plans

Plans:

- `03-01-PLAN.md` — Test harness, Vitest + `@nuxt/test-utils`, typecheck script
- `03-02-PLAN.md` — Pinia `fetchPortfolioData` unit tests with mocked `$fetch`
- `03-03-PLAN.md` — Nitro `portfolio.get` smoke test
- `03-04-PLAN.md` — Composable tests (`useReducedMotion`, `useGsapCleanup`)
- `03-05-PLAN.md` — Playwright install, config, landing E2E spec
- `03-06-PLAN.md` — GitHub Actions CI + manual UAT checkpoint

---

## Milestone — Admin Dashboard v1

Sequencia de fases 04-09 para entregar a dashboard administrativa com tracking, leads, projetos (agile) e gestao de acessos, preservando a identidade visual da landing.

## Phase 04: Foundation e Auth

**Goal:** Bootstrap tecnico: corrigir TS/tooling, integrar Supabase Auth com RBAC (admin/editor/viewer), proteger rotas `/dashboard/`** por middleware e entregar o shell visual (layout + login) alinhado ao design da landing, com tokens dark adicionados.

**Requirements:** `DASH-01`, `DASH-02`, `DASH-03`, `DASH-04`, `DASH-05`


| ID      | Statement                                                                                                                                  |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| DASH-01 | `npm run typecheck` executa sem depender de `npx` externo (vue-tsc + @vue/language-core em devDeps) e termina com exit 0.                  |
| DASH-02 | Supabase integrado via `@nuxtjs/supabase`; `SUPABASE_URL`/`SUPABASE_KEY`/`SUPABASE_SERVICE_KEY` documentados em `.env.example`.            |
| DASH-03 | Migration inicial cria `profiles` com enum `user_role`, tabela `invites` e policies RLS deny-all + por role.                               |
| DASH-04 | Middleware `auth.global` redireciona rotas `/dashboard/`** para `/login` quando nao autenticado; middleware `role` aceita metadado `role`. |
| DASH-05 | Layout `dashboard.vue` (Sidebar + TopBar) e pagina `/login` usam tokens HSL e `font-display`; CSS `.dark` adicionado sem afetar landing.   |


**Depends on:** Phase 03 (harness de testes)
**Plans:** 5 plans

Plans:

- `04-01-PLAN.md` — Fix TS/tooling: vue-tsc + @vue/language-core em devDeps
- `04-02-PLAN.md` — Supabase bootstrap: modulo `@nuxtjs/supabase` + env
- `04-03-PLAN.md` — Schema auth: `profiles`, `user_role`, `invites`, RLS
- `04-04-PLAN.md` — Middlewares `auth.global` e `role` + `useRole` composable
- `04-05-PLAN.md` — Shell da dashboard + login + dark tokens

## Phase 05: Tracking infra

**Goal:** Capturar, de forma first-party, visitas e cliques em CTAs (`whatsapp`, `email`, social, hashes de secao) e persistir em Supabase atraves de endpoints Nitro, alimentando a base de leads e eventos consumida pelas fases 06 e 07.

**Requirements:** `DASH-06`, `DASH-07`, `DASH-08`


| ID      | Statement                                                                                                                           |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| DASH-06 | Tabelas `visitors`, `leads`, `lead_events`, `link_clicks` criadas com RLS e indices por data/source.                                |
| DASH-07 | Plugin `tracker.client.ts` gera `visitor_id` em cookie first-party (90d), honra `Do Not Track` e envia eventos para `/api/track/`*. |
| DASH-08 | `onInPageHashClick` e links de `ContactFooterSection` emitem eventos tipados com UTM e source.                                      |


**Depends on:** Phase 04
**Plans:** 3 plans

Plans:

- `05-01-PLAN.md` — Schema tracking + policies RLS
- `05-02-PLAN.md` — Plugin client + endpoints Nitro proxy
- `05-03-PLAN.md` — Instrumentar landing (hashes, WhatsApp, email, social)

## Phase 06: Dashboard Home

**Goal:** Pagina inicial `/dashboard` com saudacao dinamica, relogio vivo, notas rapidas, stat cards, charts (unovis) e feed de atividade; UX alinhada a landing (serif italica, glass, accent gradient).

**Requirements:** `DASH-09`, `DASH-10`, `DASH-11`


| ID      | Statement                                                                                                                        |
| ------- | -------------------------------------------------------------------------------------------------------------------------------- |
| DASH-09 | `WelcomeCard` renderiza saudacao por faixa horaria (America/Sao_Paulo), nome do user e relogio vivo (composable `useLiveClock`). |
| DASH-10 | Stat cards leem dados reais de `leads`/`projects`/`tasks` (fase 05/08 populam); renderizam com fallback "sem dados".             |
| DASH-11 | Charts `LeadsAreaChart`, `SourceDonut`, `FunnelBars` implementados com biblioteca leve (unovis) e responsive.                    |


**Depends on:** Phase 04 (shell), Phase 05 (dados)
**Plans:** 4 plans

Plans:

- `06-01-PLAN.md` — Welcome + clock + notes
- `06-02-PLAN.md` — StatCards + queries agregadas
- `06-03-PLAN.md` — Charts unovis (area, donut, bars)
- `06-04-PLAN.md` — Feed de atividade recente

## Phase 07: Leads management

**Goal:** UI completa para operar o pipeline: tabela filtravel, drawer com timeline de eventos, mudanca de status, notas e export CSV, respeitando RBAC.

**Requirements:** `DASH-12`, `DASH-13`, `DASH-14`


| ID      | Statement                                                                                                                   |
| ------- | --------------------------------------------------------------------------------------------------------------------------- |
| DASH-12 | Pagina `/dashboard/leads` lista com filtros (periodo, source, utm, status, search) e paginacao server-side.                 |
| DASH-13 | Drawer mostra timeline de `lead_events`, permite mudar status (`new→contacted→qualified→proposal→won→lost`) e anexar notas. |
| DASH-14 | Export CSV respeita filtros aplicados; `viewer` so le; `admin` pode apagar.                                                 |


**Depends on:** Phase 05
**Plans:** 3 plans

Plans:

- `07-01-PLAN.md` — DataTable + filtros + paginacao
- `07-02-PLAN.md` — LeadDrawer timeline + notas + status
- `07-03-PLAN.md` — Export CSV + permissoes RBAC

## Phase 08: Projects Agile

**Goal:** Gerir projetos adquiridos com kanban, sprints e backlog, incluindo burndown simplificado. Inspiracao: Linear / Jira lite com identidade serif.

**Requirements:** `DASH-15`, `DASH-16`, `DASH-17`


| ID      | Statement                                                                                                                       |
| ------- | ------------------------------------------------------------------------------------------------------------------------------- |
| DASH-15 | Schema `projects`, `sprints`, `stories`, `tasks`, `task_labels` com RLS por projeto e role.                                     |
| DASH-16 | `/dashboard/projects/[id]` tem tabs Kanban / Sprint / Backlog; Kanban com drag-and-drop entre colunas `todo/doing/review/done`. |
| DASH-17 | Sprint view exibe burndown (pontos restantes por dia) reutilizando biblioteca de charts da fase 06.                             |


**Depends on:** Phase 04
**Plans:** 3 plans

Plans:

- `08-01-PLAN.md` — Schema projects/sprints/tasks + RLS
- `08-02-PLAN.md` — Kanban board + drag-and-drop
- `08-03-PLAN.md` — Sprint view + burndown

## Phase 09: Access management

**Goal:** Administracao de utilizadores e acessos: listar profiles, convidar por email, mudar role, desativar e registar auditoria.

**Requirements:** `DASH-18`, `DASH-19`, `DASH-20`


| ID      | Statement                                                                                               |
| ------- | ------------------------------------------------------------------------------------------------------- |
| DASH-18 | Pagina `/dashboard/access` restrita a `admin` lista `profiles` com role, ultimo login, status.          |
| DASH-19 | Convite por email usa `supabase.auth.admin.inviteUserByEmail` via handler Nitro, gravando em `invites`. |
| DASH-20 | Tabela `audit_log` populada por triggers para `profiles` e `invites`; UI mostra ultimos 50 eventos.     |


**Depends on:** Phase 04
**Plans:** 3 plans

Plans:

- `09-01-PLAN.md` — Profiles list + role edit + disable
- `09-02-PLAN.md` — Invite by email (handler + UI)
- `09-03-PLAN.md` — Audit log + triggers + UI

---

## Milestone — Domain-Driven Refactor v3 (Nuxt Layers)

Objetivo: tornar a aplicacao **100% orientada a dominio** com separacao explicita
de camadas (domain/application/infrastructure/presentation), migracao progressiva
para Nuxt Layers e padronizacao de contratos para componentes, stores e handlers.

## Phase 14: Domain inventory and bounded contexts

**Goal:** Consolidar mapa de dominios, aggregate roots e contratos de fronteira para cada contexto (auth, access, leads, projects, tracking, portfolio).

**Requirements:** `DDD-01`, `DDD-02`, `DDD-03`


| ID     | Statement                                                                                                              |
| ------ | ---------------------------------------------------------------------------------------------------------------------- |
| DDD-01 | Existe documento SSOT de bounded contexts e ownership por modulo (`.planning/codebase/DDD-LAYERS-BLUEPRINT.md`).       |
| DDD-02 | Todas as regras de negocio atuais sao mapeadas para services de dominio (sem regra critica solta em handlers/paginas). |
| DDD-03 | Contratos de entrada/saida para API e stores estao definidos por dominio.                                              |


**Depends on:** Phase 09
**Plans:** 3 plans

Plans:

- `14-01-PLAN.md` — Mapear contexts, entidades, value objects e policies
- `14-02-PLAN.md` — Definir contratos app-layer (commands/queries)
- `14-03-PLAN.md` — Validar cobertura de regras de negocio atuais

## Phase 15: Nuxt Layers foundation rollout

**Goal:** Ativar estrutura de layers em producao com fundacao reutilizavel e convencoes de override previsiveis.

**Requirements:** `DDD-04`, `DDD-05`


| ID     | Statement                                                                                    |
| ------ | -------------------------------------------------------------------------------------------- |
| DDD-04 | `nuxt.config.ts` e estrutura de layers seguem padrao Nuxt 4 com precedencia documentada.     |
| DDD-05 | Componentes/composables/base tokens comuns migram para `layers/1-base` sem regressao visual. |


**Depends on:** Phase 14
**Plans:** 2 plans

Plans:

- `15-01-PLAN.md` — Configurar extends/layers e guardrails de import
- `15-02-PLAN.md` — Migrar fundacao (theme, ui base, composables compartilhados)

## Phase 16: Dashboard presentation split by layer

**Goal:** Extrair dashboard para `layers/2-dashboard` com separacao clara entre composicao de UI e logica de dominio.

**Requirements:** `DDD-06`, `DDD-07`


| ID     | Statement                                                                                                 |
| ------ | --------------------------------------------------------------------------------------------------------- |
| DDD-06 | Paginas e componentes de dashboard vivem no layer de dashboard, com app-root apenas como override minimo. |
| DDD-07 | Nenhum componente de apresentacao contem logica de persistencia ou policy.                                |


**Depends on:** Phase 15
**Plans:** 3 plans

Plans:

- `16-01-PLAN.md` — Migrar pages/layout/dashboard shell para layer
- `16-02-PLAN.md` — Migrar componentes por dominio (leads/projects/access)
- `16-03-PLAN.md` — Validar override strategy entre app e layers

## Phase 17: Application layer and domain orchestration

**Goal:** Introduzir camada de aplicacao (use-cases/commands/queries) entre handlers e services de dominio.

**Requirements:** `DDD-08`, `DDD-09`


| ID     | Statement                                                                                           |
| ------ | --------------------------------------------------------------------------------------------------- |
| DDD-08 | Handlers chamam casos de uso da app-layer, nao services de dominio diretamente.                     |
| DDD-09 | Regras transversais (audit, authz, idempotencia, observabilidade) ficam centralizadas na app-layer. |


**Depends on:** Phase 16
**Plans:** 3 plans

Plans:

- [x] `17-01-PLAN.md` — Criar application services por contexto
- [x] `17-02-PLAN.md` — Refatorar handlers para command/query handlers
- [x] `17-03-PLAN.md` — Integrar audit/logging padronizado por use case

## Phase 18: Infrastructure isolation (Supabase/Drizzle adapters)

**Goal:** Isolar acesso a dados em adapters/repositories de infraestrutura com estrategia hibrida controlada.

**Requirements:** `DDD-10`, `DDD-11`


| ID     | Statement                                                                               |
| ------ | --------------------------------------------------------------------------------------- |
| DDD-10 | Repositories por contexto abstraem Drizzle/Supabase sem contaminar dominio/app-layer.   |
| DDD-11 | Estrategia hibrida (`Drizzle -> Supabase fallback`) e observavel/testavel por contrato. |


**Depends on:** Phase 17
**Plans:** 3 plans

Plans:

- [x] `18-01-PLAN.md` — Definir interfaces de repository por aggregate
- [x] `18-02-PLAN.md` — Implementar adapters Drizzle e Supabase
- [x] `18-03-PLAN.md` — Cobertura de testes de contrato e fallback

## Phase 19: Domain-first quality gates

**Goal:** Fortalecer gates de qualidade para garantir manutencao do modelo DDD/layers no dia a dia.

**Requirements:** `DDD-12`, `DDD-13`


| ID     | Statement                                                                                    |
| ------ | -------------------------------------------------------------------------------------------- |
| DDD-12 | Suite de testes cobre dominio/app-layer/presentation com RBAC e flows criticos autenticados. |
| DDD-13 | Rules/docs/checklists impedem regressao arquitetural (lint arquitetural + PR checklist).     |


**Depends on:** Phase 18
**Plans:** 3 plans

Plans:

- [x] `19-01-PLAN.md` — Expandir unit/integration/e2e por camada
- [x] `19-02-PLAN.md` — Criar checklist arquitetural e gates CI
- [x] `19-03-PLAN.md` — Auditoria final de aderencia ao blueprint DDD+Layers

**Phase 19 status:** Concluída com riscos residuais documentados no blueprint/checklist.

---

## Milestone — Pós-DDD estabilização (Phase 20)

Objetivo: **fechar o ciclo GSD** do refactor DDD + Layers, alinhar documentação ao código e tratar backlog técnico de baixo risco (portfolio query, docs de CI, expansão opcional de testes).

## Phase 20: Pós-migração DDD — estabilização

**Goal:** Sincronizar STATE/ROADMAP/checklists, simetrizar `GET /api/portfolio` com app-layer e formalizar qualidade contínua.

**Requirements:** `STAB-01`, `STAB-02`, `STAB-03`


| ID      | Statement                                                                                       |
| ------- | ----------------------------------------------------------------------------------------------- |
| STAB-01 | Artefactos `.planning/**` refletem o estado real dos contextos e não contradizem o blueprint. |
| STAB-02 | Handler `portfolio.get` delega para query na application layer (payload ainda pode ser estático). |
| STAB-03 | TESTING/CI documentados; backlog Drizzle não-agile permanece explicitamente opcional.           |


**Depends on:** Phase 19
**Plans:** 3 plans

Plans:

- [x] `20-01-PLAN.md` — Fecho administrativo do milestone DDD v3 (GSD)
- [x] `20-02-PLAN.md` — Simetria portfolio (`qryPortfolioPayload`) + contrato `about`
- [x] `20-03-PLAN.md` — Qualidade contínua e backlog técnico opcional

**Phase 20 status:** Concluída — STAB-01 (STATE/blueprint/checklists), STAB-02 (portfolio app-layer), STAB-03 (TESTING + backlog opcional isolado na STATE).

---

## Milestone — Paperclip-adapt (humano) + landing por projeto

Objetivo: entregar **governance por projeto** (equipas, tasks, leads), **landing pública editável por projeto**, **inbox** agregado e **evolução tenant/org**, mantendo DDD + INFRA-STANDARD. Documentação SSOT: [.planning/requirements/REQ-PAPERCLIP-ADAPT.md](./requirements/REQ-PAPERCLIP-ADAPT.md).

## Phase 21: Organizations + project tenancy

**Goal:** Introduzir `organizations`, associar `projects.organization_id`, migrações Supabase + políticas RLS sem regressão; seeds/dev atualizados.

**Requirements:** `PC-01`, `PC-02`, `PC-03`


| ID   | Statement                                                                 |
| ---- | --------------------------------------------------------------------------- |
| PC-01 | Tabela `organizations` + membership (ou `profiles.organization_id` fase 1) documentada e aplicada em migração numerada. |
| PC-02 | `projects.organization_id` FK com migração segura (nullable → backfill → NOT NULL quando dados prontos). |
| PC-03 | RLS e helpers revisados; sem recursão em policies de `profiles`; testes de smoke em policies críticas. |


**Depends on:** Phase 20  
**Plans:** 2 plans (stubs em `.planning/phases/21-paperclip-tenant-org/`)

Plans:

- `21-01-PLAN.md` — Schema org + migração + Drizzle mirror opcional
- `21-02-PLAN.md` — RLS + factory repos + testes contrato

## Phase 22: Project landing — dados + público

**Goal:** Persistência `project_landing`, commands/queries app-layer, rota pública SSR só para `published`; slug único.

**Requirements:** `PC-04`, `PC-05`, `PC-06`


| ID   | Statement                                                                  |
| ---- | -------------------------------------------------------------------------- |
| PC-04 | Tabela `project_landing` (1:1 com projeto) + revisões draft/publicadas.     |
| PC-05 | Endpoints Nitro finos → application commands (`saveDraft`, `publish`).    |
| PC-06 | Página pública Nuxt (ex. `/p/[slug]`) renderiza landing published + lead capture ligado ao projeto. |


**Depends on:** Phase 21  
**Plans:** 2 plans

Plans:

- `22-01-PLAN.md` — Schema landing + migração Supabase + tipos TS
- `22-02-PLAN.md` — Rotas públicas + handler público + testes contrato

## Phase 23: Dashboard — editor landing + preview

**Goal:** UI no dashboard para editar blocos, preview draft autenticado, publicação explícita.

**Requirements:** `PC-07`, `PC-08`


| ID   | Statement                                                                    |
| ---- | ---------------------------------------------------------------------------- |
| PC-07 | Página `/dashboard/projects/[id]/landing` com editor e lista de estados.    |
| PC-08 | Preview draft via mesma rota pública com gate authz (`?preview=` ou header). |


**Depends on:** Phase 22  
**Plans:** 2 plans

Plans:

- `23-01-PLAN.md` — Editor blocos + integração Pinia/API
- `23-02-PLAN.md` — Preview seguro + audit publish

## Phase 24: Inbox + IA navegação + leads por projeto

**Goal:** `/dashboard/inbox` MVP; filtros leads por projeto; sidebar atualizada.

**Requirements:** `PC-09`, `PC-10`


| ID   | Statement                                                         |
| ---- | ----------------------------------------------------------------- |
| PC-09 | Inbox agrega itens acionáveis (tasks atribuídas no MVP).          |
| PC-10 | `/dashboard/leads` filtra por projeto quando `project_id` disponível. |


**Depends on:** Phase 21 (opcional 23 para contexto)  
**Plans:** 2 plans

Plans:

- `24-01-PLAN.md` — Inbox queries + UI
- `24-02-PLAN.md` — Leads filtros + linking público

## Phase 25: Drizzle espelho + gates qualidade

**Goal:** Expandir `server/db/schema.ts` alinhado às novas tabelas onde política Drizzle se aplica; manter leads/access Supabase-first; documentar gates.

**Requirements:** `PC-11`, `PC-12`


| ID   | Statement                                                          |
| ---- | ------------------------------------------------------------------ |
| PC-11 | Drizzle schema atualizado para org/landing/agile conforme INFRA.    |
| PC-12 | Testes de contrato extras para repositories novos ou alterados.    |


**Depends on:** Phase 21–22  
**Plans:** 1 plan

Plans:

- `25-01-PLAN.md` — Drizzle mirror + testes + STATE

