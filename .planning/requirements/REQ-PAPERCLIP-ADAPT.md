# Requisitos — Dashboard estilo Paperclip (adaptação humana) + Drizzle

**Versão:** 1.0 · **Data:** 2026-04-30  
**Referência UX/feature:** [paperclipai/paperclip](https://github.com/paperclipai/paperclip) (Node/React upstream — **não** se faz fork de código; paridade funcional e IA adaptadas ao Portal).  
**Brainstorm associado:** [BRAINSTORM-PAPERCLIP-ADAPT.md](./BRAINSTORM-PAPERCLIP-ADAPT.md)

## 1. Visão

Construir uma experiência **tipo Paperclip** onde:

- **Empresa/projeto** é o contentor de trabalho (**projeto = produto** entregue ao cliente contratante).
- **Pessoas** (não agentes) recebem **tasks**, participam em **equipas**, e editam a **landing pública** do projeto quando autorizadas.
- **Leads** continuam a ser o motor comercial; a captação passa a poder estar **ligada ao projeto** (landing por projeto).
- **Inbox** oferece visão **agregada** do que precisa atenção (paridade “activity/inbox” Paperclip, simplificada).
- **Persistência:** respeitar [.planning/codebase/INFRA-STANDARD.md](../codebase/INFRA-STANDARD.md) — agile/Drizzle onde aplicável; leads/access **Supabase-first** até paridade total.

## 2. Não-objectivos (explícitos)

- Execução de **agentes IA**, heartbeats automáticos de bots, orçamentos de **tokens LLM**.
- **BYO runtimes** / adapters externos estilo Paperclip.
- **Workflow visual** estilo pipeline builder.
- Paridade 1:1 de **código** com o repositório Paperclip.

## 3. Matriz funcional — Paperclip → Portal 2026

| Paperclip (conceito) | Portal — módulo / local provável | Prioridade | Notas |
|----------------------|-----------------------------------|------------|--------|
| Multi-company | `organizations` + `tenant_id` + RLS | P0 | Fundação para isolamento; ver §6 |
| Org chart / roles | `profiles`, `user_role`, projeto membership | P0 | Já existe RBAC; estender membership por projeto |
| Agents → hire/work | **Humanos** assignados a `tasks` | P0 | Domínio agile existente |
| Work & Task System | `server/domain/dashboard/*`, `layers/2-dashboard` | P0 | Kanban/sprints já entregues — evoluir inbox + permissões |
| Goal alignment | Epics/goals opcional | P2 | Could — ligar stories a meta |
| Heartbeats / execution | Check-ins humanos / SLA | P3 | Won’t MVP automatizado |
| Budget / cost | — | — | Won’t (negócio interno diferente) |
| Governance / approvals | Gates simples | P2 | Pós-MVP |
| Ticket / audit trail | `audit_log`, `log_audit()` | P0 | Manter e estender eventos landing/inbox |
| Activity / inbox | Nova UX `/dashboard/inbox` + feed | P1 | MVP mínimo §7 |
| Company portability | Export org | P3 | Could |
| Landing / marketing surface | **Landing por projeto** + editor | P0 | §5–§6 |
| Secrets / storage | Supabase Storage para assets landing | P1 | Imagens OG, logos |

## 4. Requisitos funcionais

1. **Identidade:** convites, perfis, papéis `admin` / `editor` / `viewer`; `ensureProfile()` nos middlewares (regra atual portal).
2. **Projeto como produto:** CRUD projeto (UI + API), permissões com `can_access_project` e políticas RLS alinhadas.
3. **Navegação dashboard:** **Inbox** → **Projetos** → por projeto: **Tasks**, **Equipa**, **Editor landing**, **Leads** (global e/ou filtrado); `/dashboard/access` admin.
4. **Leads:** continuidade do pipeline atual; captura na landing pública com **`project_id`** ou org quando schema estiver disponível.
5. **Landing pública:** uma instância editável por projeto; estados draft/publicados; slug único; SSR público Nuxt.
6. **Tasks:** assignação a humanos, sprints, notas; optimistic UI + rollback (padrão dashboard).
7. **Governance MVP:** RBAC + audit; gates avançados = fase posterior.

## 5. Arquitetura — landing por projeto (conteúdo + API + preview)

### 5.1 Estado atual

- Portfolio institucional pode usar payload **estático** via app-layer (`qryPortfolioPayload`) — ver INFRA-STANDARD.
- **Landing por projeto** é **nova capacidade**: exige persistência própria (tabelas), endpoints Nitro na app-layer, rotas públicas.

### 5.2 Modelo de conteúdo (proposta)

- **`project_landing`** (nome indicativo): `project_id` FK, `slug` único (scoped org ou global — decisão em migração), `status` (`draft` | `published`), `published_at`, `draft_json` (blocos), `published_revision`, timestamps.
- **Blocos:** array JSON versionado (hero, CTA, texto, formulário lead embutido). Form lead referencia `project_id` implícito na página.
- **API:** commands na application layer — `publishLanding`, `saveDraft`, `getPublicLandingBySlug` (leitura anónima só published; draft só autenticado + permissão).

### 5.3 Preview

- **MVP recomendado:** mesma rota pública com `?preview=draft` **apenas** se sessão válida e permissão no projeto (handler valida antes de SSR dados draft).

### 5.4 Rotas públicas Nuxt

- Ex.: `/p/[slug]` ou `/c/[orgSlug]/[projectSlug]` — decisão única na fase de implementação (evitar dois padrões sem necessidade).

## 6. Multi-tenant + RLS (modelo alvo)

### 6.1 Direção

- Introduzir **`organizations`** (id, nome, settings opcionais).
- **`profiles`** ou tabela de junção **`organization_members`** (`org_id`, `user_id`, `role` org-level opcional).
- **`projects`** ganham `organization_id` FK (nullable inicialmente para migração suave, depois NOT NULL).
- **RLS:** políticas usando helpers existentes (`public.is_admin()`, `public.can_access_project`, etc.) — **nunca** subselect direto em `profiles` que dispare recursão.

### 6.2 Ligação projeto ↔ landing

- `project_landing.project_id` único (1:1).
- Slug único no âmbito acordado (global ou por org).

### 6.3 Drizzle vs Supabase

- Novas tabelas devem existir em **migrations Supabase** como SSOT; espelhar em `server/db/schema.ts` quando o contexto migrar para Drizzle **de acordo com INFRA-STANDARD**.

## 7. Information architecture — rotas

### Dashboard (autenticado)

| Rota | Função |
|------|--------|
| `/dashboard` | Home — pode incorporar resumo inbox |
| `/dashboard/inbox` | Fila “para mim” / atenção (MVP) |
| `/dashboard/projects` | Lista projetos |
| `/dashboard/projects/[id]` | Tasks / sprints (existente) + tab ou link **Landing** / **Equipa** |
| `/dashboard/projects/[id]/landing` | Editor + preview (novo) |
| `/dashboard/projects/[id]/team` | Membros do projeto (novo ou integrado) |
| `/dashboard/leads` | Leads (existente) — filtro por projeto |
| `/dashboard/access` | Admin |

### Público

| Rota | Função |
|------|--------|
| `/` | Landing institucional portal (atual) |
| `/p/[slug]` (exemplo) | Landing do projeto cliente |

## 8. Plano incremental Drizzle

Alinhado a [.planning/codebase/INFRA-STANDARD.md](../codebase/INFRA-STANDARD.md):

| Ordem | Contexto | Ação |
|-------|----------|------|
| 1 | Agile (projects/sprints/tasks) | Continuar Drizzle quando `DATABASE_URL` + testes de contrato existentes |
| 2 | Novas tabelas landing/org | Definir em SQL + opcionalmente Drizzle **depois** de paridade com migrations |
| 3 | Leads / access / tracking | **Supabase-only** até schema Drizzle 1:1 + testes de contrato + RLS verificados |

**Gating:** nenhum switch “Drizzle-first” em leads/access antes dos contratos.

## 9. Pré-execução GSD (passo a passo)

Para cada fatia do [ROADMAP ../ROADMAP.md](../ROADMAP.md) (Milestone Paperclip-adapt):

1. **Discuss** — premissas, UAT, dependências (`/gsd-discuss-phase` ou equivalente).
2. **Plan** — `PLAN.md` na pasta da fase com tarefas verificáveis.
3. **Execute** — código + testes + atualização STATE.

**Uma fatia por vez** (tenant → landing dados/API → rotas públicas → editor → inbox → Drizzle mirror).

## 10. Rastreabilidade

- Blueprint DDD: [.planning/codebase/DDD-LAYERS-BLUEPRINT.md](../codebase/DDD-LAYERS-BLUEPRINT.md)
- Testes: [.planning/codebase/TESTING.md](../codebase/TESTING.md)
- Regras dashboard: [.cursor/rules/dashboard.mdc](../../.cursor/rules/dashboard.mdc)
