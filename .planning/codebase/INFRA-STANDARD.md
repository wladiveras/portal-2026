# Infra standard — persistência híbrida (portal-2026)

Documento normativo para **alinhamento entre equipa e agentes**: quando Drizzle, quando Supabase, e por que leads/access/tracking não têm adapter Drizzle completo hoje.

## Política oficial

| Contexto | Primário (`DATABASE_URL` definido) | Fallback (sem `DATABASE_URL`) |
| -------- | ----------------------------------- | ------------------------------ |
| **Agile** (projects / sprints / tasks / burndown via repos) | Drizzle (`server/db/schema.ts` alinhado às tabelas core) | Supabase service role |
| **Leads** | **Supabase** (`LeadsRepositoryPort` + adapter) | Igual (único driver implementado de ponta a ponta) |
| **Access** | **Supabase** | Igual |
| **Tracking** | **Supabase** | Igual |
| **Portfolio landing** (`GET /api/portfolio`) | N/A — payload estático na app-layer (`qryPortfolioPayload`) | Igual |

## Por que não “Drizzle-first” em leads/access ainda

- O schema Drizzle em `server/db/schema.ts` cobre um **subconjunto** das tabelas Postgres (ex.: `leads` simplificado vs modelo completo com `visitors`, `lead_events`, convites RLS, etc.).
- Introduzir Drizzle paralelo sem **paridade 1:1** com migrations Supabase (`supabase/migrations/**`) arrisca comportamentos divergentes e bugs sutis em RLS.
- **Decisão padronizada:** manter **Supabase-first** para esses contextos até existir schema Drizzle completo + testes de contrato Drizzle vs Supabase (igual ao agile).

## Quando reavaliar

- Necessidade operacional (latency, custo de conexões, relatórios SQL pesados).
- Schema Drizzle expandido com todas as tabelas/policies relevantes ao contexto.

## Factory

- `server/infrastructure/dashboard/factory.ts` resolve adapters por contexto; agile usa `tryGetDrizzle()` para escolher implementação; outros contextos usam adapters Supabase dedicados.
