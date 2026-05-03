# Dashboard application layer

HTTP adapters (`server/api/dashboard/**`) call **use-case commands** here instead of invoking `server/domain/**` or repository code directly.

## Layout

- `agile/commands.ts` — projects / sprints / tasks mutations bound to the agile UX.
- `portfolio/queries.ts` — `qryPortfolioPayload` for public `GET /api/portfolio` (static JSON; extensible to CMS/DB).

## Policies

- **Authz**: enforced at the handler (`requireAdmin`, `requireEditorOrAdmin`) before dispatch.
- **Audit**: performed in domain/infrastructure write flow (`logAudit`); failures propagate (hard-fail) so mutations never silently skip audit for agile writes.

Extend this folder per bounded context (`leads`, `access`) when those handlers are routed through application commands.
