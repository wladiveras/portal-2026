# Fontes de copy — landing vs portfolio API

Mapa normativo para evitar **drift editorial** entre ficheiros (ver também `.planning/codebase/CONCERNS.md`).

## Onde editar o quê

| Conteúdo | SSOT | Consumidor típico |
| -------- | ---- | ------------------- |
| Navegação, hero nome/roles, story intro, stats labels, contact CTAs, WhatsApp | `app/data/landing.ts` | Secções landing; alguns fallbacks |
| Tagline curta hero (dinâmico), headline/título/summary/longText, CV skills, experiência, projetos, depoimentos | `server/application/dashboard/portfolio/queries.ts` (`qryPortfolioPayload`) | Pinia após `$fetch('/api/portfolio')` |
| Voz / tom editorial | `docs/copy-voice-prompt.md` | Referência humana ao escrever |

## Regras

- Alterar **portfolio público** (projetos, depoimentos, about): editar **`qryPortfolioPayload`** e `app/types/portfolio.ts` em conjunto.
- Alterar **estrutura da página** ou textos que não vêm da API: **`landing.ts`**.
- **Hero tagline visível:** `HeroSection` usa `store.about.summary` com fallback `landing.hero.taglineFallback` — manter ambos coerentes em releases importantes.
