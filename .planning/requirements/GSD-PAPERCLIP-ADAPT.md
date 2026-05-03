# GSD — encadeamento Paperclip-adapt (pré-execução)

Este ficheiro liga o [REQ-PAPERCLIP-ADAPT.md](./REQ-PAPERCLIP-ADAPT.md) ao workflow **discuss → plan → execute** do projeto.

## Ordem das fatias (não paralelizar no mesmo PR)

1. **Fase 21** — Organizações + `organization_id` em `projects` + RLS (fundação).
2. **Fase 22** — Tabela `project_landing` + API app-layer + rota pública Nuxt (published only).
3. **Fase 23** — UI editor no dashboard + preview draft autenticado.
4. **Fase 24** — Inbox MVP + ajustes de navegação (sidebar) + leads filtráveis por projeto.
5. **Fase 25** — Espelhamento Drizzle (onde INFRA permitir) + testes de contrato adicionais.

## Comandos GSD (referência)

- Discuss: `/gsd-discuss-phase` (ou notas em `NN-00-DISCUSS.md` se preferir registo escrito).
- Plan: `/gsd-plan-phase` → ficheiros `NN-0k-PLAN.md` em `.planning/phases/NN-*/`.
- Execute: `/gsd-execute-phase` alinhado aos PLANs; commits atómicos por tarefa quando possível.

## Critério de saída por fase

- Requisitos da tabela no [ROADMAP ../ROADMAP.md](../ROADMAP.md) verificáveis.
- Testes mínimos no boundary alterado (ver [TESTING.md](../codebase/TESTING.md)).
- `.planning/STATE.md` atualizado quando a fase fechar.
