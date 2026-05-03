# Brainstorm — Paperclip-adapt (humano) — 2026-04-30

Documento de pré-design alinhado à skill **brainstorming** (cenários, trade-offs, simplicidade UX). Saída consolidada também em [.planning/requirements/REQ-PAPERCLIP-ADAPT.md](./REQ-PAPERCLIP-ADAPT.md).

## Objetivo do produto

Dashboard e superfície pública onde **projeto = produto**: trabalho humano (tasks, equipas), **landing editável por projeto** para o cliente final, **leads** com contexto de projeto quando aplicável, e **inbox** agregado — inspirado na UX Paperclip, **sem** agentes/LLM orchestration.

## Cenários obrigatórios (edge cases)

| Área | Cenário | Comportamento desejado (MVP) |
|------|---------|------------------------------|
| Projeto | Projeto sem membros além do criador | Dono mantém acesso total; convites explícitos para outros. |
| Projeto | Viewer abre projeto | Lê tasks/leads permitidos; não edita landing nem tasks além do permitido por policy. |
| Landing | Sem draft publicado | Rota pública mostra estado “em construção” ou 404 brand-safe (decisão produto — preferir mensagem única). |
| Landing | Dois editores em simultâneo | Last-write-wins no MVP; OT/CRDT **won’t** no MVP (ver backlog). |
| Landing | Slug duplicado | Validação server-side + erro claro; não permitir publish até resolver. |
| Inbox | Zero itens | Empty state com CTA “Ir a projetos” / “Criar tarefa”. |
| Inbox | Muitos projetos | Filtros por projeto + prioridade; sem infinite scroll obrigatório no MVP. |
| Leads | Projeto arquivado/desativado | Leads associados ficam read-only ou migrados para inbox global — política explícita em migração. |
| Leads | Spam no formulário público | Rate-limit Nitro + honeypot opcional; sem captcha obrigatório no MVP se rate-limit suficiente. |
| Tasks | Reassign para membro que saiu | Assignee nullable + histórico; alerta na inbox do PM. |
| Tasks | Sprint fechado | Bloquear drag para colunas “done” apenas se regra existir; senão warning-only no MVP. |

## Abordagens consideradas (trade-offs)

### Landing editor

1. **JSON blocks + preview SSR** — recomendado: controla schema, fácil de versionar/publicar, alinha DDD.
2. **Rich HTML livre** — rápido mas XSS/risco; **rejeitado** para público sem sanitização forte.
3. **iframe só Figma-like** — bom preview mas duplica routing; usar só como modo secundário.

### Preview tempo real

1. **Query `?draft=1` + sessão autenticada** — recomendado: mesma página Nuxt, sem segundo deploy.
2. **iframe URL pública com token curto** — mais complexo operacionalmente; fase 2.

### Inbox MVP

1. **Agregador de “tasks atribuídas a mim” + menções futuras** — MVP enxuto.
2. **Replicação completa Paperclip activity** — **could**, não MVP.

## Must / Should / Could / Won’t

### Must (MVP documentação + primeira entrega funcional)

- Projeto como contentor; RBAC + `can_access_project`.
- Landing por projeto: modelo dados + rota pública + publish/draft.
- Editor dashboard com preview draft.
- Leads existentes + associação `project_id` onde schema permitir.
- Inbox mínimo: lista trabalho “para mim” cross-project.
- Audit em mutações críticas (já padrão portal).

### Should

- Equipa/membros por projeto na UI dedicada.
- SEO básico (title/meta por slug).
- Workshop decisão slug vs subdomain.

### Could

- Menções @ em tasks/comentários alimentando inbox.
- Concorrência OT para editor.
- Goals/epics além de tasks.

### Won’t (explícito)

- Agentes, heartbeats automáticos, budgets de tokens LLM.
- Plugins externos estilo Paperclip.
- Workflow builder drag-and-drop.

## Filtro de simplicidade UX

Toda feature nova deve responder **sim** a pelo menos uma:

- Reduz passos até à acção principal?
- Mantém um **único** contexto mental (projeto selecionado)?
- Evita segundo “modo” (ex.: curador vs editor) sem necessidade?

---

Referência externa: [paperclipai/paperclip](https://github.com/paperclipai/paperclip) (apenas inspiração funcional; implementação continua Nuxt/Vue + Nitro + Supabase/Drizzle híbrido).
