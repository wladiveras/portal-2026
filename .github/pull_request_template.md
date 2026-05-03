## Summary

- 

## Scope

- In:
  - 
- Out:
  - 

## DDD / Layers checklist (required)

- `server/api/**` remains transport-only (parse/guard/dispatch only)
- `server/application/**` orchestrates use-cases without driver details
- `server/domain/**` keeps business invariants and stays HTTP-agnostic
- `server/infrastructure/**` contains adapters/repositories only
- Updated `.planning/codebase/CONVENTIONS.md` if architectural contracts changed
- Updated `.planning/codebase/TESTING.md` if test strategy changed
- Updated `.planning/STATE.md` with phase/progress evidence
- If touching persistence strategy: `.planning/codebase/INFRA-STANDARD.md` / `MIGRATION-CHECKLIST-DDD.md` as applicable
- If adding skills/docs for agents: `.planning/codebase/AI-AND-SKILLS.md` or `.cursor/rules/ai-skills.mdc` as applicable

## Validation

- `npm run typecheck`
- `npm run test`
- Targeted smoke checks for changed boundaries

### Evidence

```bash
# Paste relevant command outputs here
```

## Risks / Rollback

- Risk:
  - 
- Rollback:
  - 

