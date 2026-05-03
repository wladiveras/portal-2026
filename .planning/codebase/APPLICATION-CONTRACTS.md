# Application Contracts

Command/query contracts between `server/api/**` e a camada de aplicação / domínio.

**Landing portfolio:** `GET /api/portfolio` usa **`qryPortfolioPayload`** (`server/application/dashboard/portfolio/queries.ts`), não `PortfolioRepositoryPort`. O port `PortfolioRepositoryPort` permanece na factory para outros fluxos (ex. extensões futuras).

## Repository ports (DDD-10 baseline)

Ports foram formalizados por contexto para desacoplar app-layer de detalhes Drizzle/Supabase:

- `server/domain/dashboard/projects/repositories.ts`
  - `ProjectsRepositoryPort`, `SprintsRepositoryPort`, `TasksRepositoryPort`, `AgileRepositoryPort`
- `server/domain/dashboard/leads/repositories.ts`
  - `LeadsRepositoryPort`
- `server/domain/dashboard/access/repositories.ts`
  - `AccessRepositoryPort`
- `server/domain/dashboard/tracking/repositories.ts`
  - `TrackingRepositoryPort`
- `server/domain/dashboard/portfolio/repositories.ts`
  - `PortfolioRepositoryPort`

Factory central de resolução (DDD-11 baseline):

- `server/infrastructure/dashboard/factory.ts`
  - `createAgileRepository(event)` usa estratégia híbrida (`Drizzle -> Supabase`)
  - comandos da app-layer (`agile/commands.ts`) dependem da factory, não de adapters concretos
  - `createLeadsRepository/createAccessRepository/createTrackingRepository/createPortfolioRepository` já apontam para adapters Supabase dedicados por contexto

### Use-case -> repository port map

- `cmdCreateProject`, `cmdUpdateProject` -> `AgileRepositoryPort.createProject/updateProject`
- `cmdCreateSprint`, `cmdUpdateSprint` -> `AgileRepositoryPort.createSprint/updateSprint`
- `cmdCreateTask`, `cmdUpdateTask`, `cmdDeleteTask` -> `AgileRepositoryPort.createTask/updateTask/deleteTask`
- Leads (`ListLeadsQuery`, `UpdateLeadStatusCommand`, `CreateLeadNoteCommand`, `DeleteLeadCommand`) -> `LeadsRepositoryPort`
- Access (`ListProfilesQuery`, `InviteUserCommand`, `UpdateProfileRoleCommand`, `ToggleProfileDisabledCommand`) -> `AccessRepositoryPort`
- Tracking (`TrackVisitorCommand`, `TrackLeadEventCommand`, `TrackLinkClickCommand`) -> `TrackingRepositoryPort`
- Portfolio (`GetPortfolioSnapshotQuery`) -> `PortfolioRepositoryPort`

**Implementado (agile / projects–sprints–tasks):** `server/application/dashboard/agile/commands.ts` expõe `cmdCreateProject`, `cmdUpdateProject`, `cmdCreateSprint`, `cmdUpdateSprint`, `cmdCreateTask`, `cmdUpdateTask`, `cmdDeleteTask` — os handlers importam estes comandos em vez de chamar domínio/repositório diretamente.

**Implementado (leads / list-status-note-delete):**
- `server/application/dashboard/leads/queries.ts` expõe `qryListLeads`
- `server/application/dashboard/leads/commands.ts` expõe `cmdUpdateLeadStatus`, `cmdAddLeadNote`, `cmdDeleteLead`
- handlers `server/api/dashboard/leads/**` consomem estes entrypoints (sem write Supabase direto no handler)

**Implementado (access / profiles-invites-audit):**
- `server/application/dashboard/access/queries.ts` expõe `qryListProfiles`, `qryListInvites`, `qryListAudit`
- `server/application/dashboard/access/commands.ts` expõe `cmdUpdateProfile`, `cmdCreateInvite`, `cmdRevokeInvite`
- handlers `server/api/dashboard/profiles/**`, `server/api/dashboard/invites/**`, `server/api/dashboard/audit.get.ts` delegam para app-layer

**Implementado (dashboard notes API boundary):**
- handlers `server/api/dashboard/notes/**` centralizam CRUD de `notes` por usuário autenticado
- frontend (`QuickNotes`) consome somente endpoints Nitro; sem acesso direto ao client Supabase em componente

## Naming convention

- Commands: `server/application/<context>/commands/<verb><Entity>.ts` (hoje: ficheiro `agile/commands.ts` com prefixo `cmd`)
- Queries: `server/application/<context>/queries/<verb><Entity>.ts`
- DTOs: `server/application/<context>/dto/*.ts`

## Projects context

- `CreateProjectCommand`
  - input: `{ actorId, name, slug?, description?, color? }`
  - guards: `editor|admin`
  - output: `ProjectDto`
  - audit: `project_created`
- `UpdateProjectCommand`
  - input: `{ actorId, id, patch }`
  - guards: `editor|admin`
  - output: `ProjectDto`
  - audit: `project_updated|project_archived`
- `CreateSprintCommand`
  - input: `{ actorId, projectId, name, startsAt, endsAt, goal? }`
  - guards: `editor|admin`
  - output: `SprintDto`
  - audit: `sprint_created`
- `UpdateTaskCommand`
  - input: `{ actorId, taskId, patch }`
  - guards: `editor|admin`
  - output: `TaskDto`
  - audit: `task_updated`
- `GetProjectDetailQuery`
  - input: `{ actorId, projectId }`
  - guards: `viewer+`
  - output: `{ project, sprint, tasks }`

## Leads context

- `UpdateLeadStatusCommand`
  - input: `{ actorId, leadId, status }`
  - guards: `editor|admin`
  - output: `LeadDto`
  - audit: `lead_status_updated`
- `CreateLeadNoteCommand`
  - input: `{ actorId, leadId, body }`
  - guards: `editor|admin`
  - output: `LeadNoteDto`
  - audit: `lead_note_created`
- `DeleteLeadCommand`
  - input: `{ actorId, leadId }`
  - guards: `admin`
  - output: `void`
  - audit: `lead_deleted`
- `ListLeadsQuery`
  - input: `{ actorId, filters, page, pageSize }`
  - guards: `viewer+`
  - output: `Paginated<LeadSummaryDto>`

## Access context

- `InviteUserCommand`
  - input: `{ actorId, email, role }`
  - guards: `admin`
  - output: `InviteDto`
  - audit: `invite_created`
- `UpdateProfileRoleCommand`
  - input: `{ actorId, profileId, role }`
  - guards: `admin`, self-protection check
  - output: `ProfileDto`
  - audit: `role_changed`
- `ToggleProfileDisabledCommand`
  - input: `{ actorId, profileId, disabled }`
  - guards: `admin`, self-protection check
  - output: `ProfileDto`
  - audit: `profile_disabled|profile_enabled`
- `ListProfilesQuery`
  - input: `{ actorId }`
  - guards: `admin`
  - output: `ProfileListItem[]`

## Error contract

- `400` invalid payload or invariant violation
- `401` missing auth
- `403` role/policy violation
- `404` aggregate not found
- `409` conflict (e.g. slug uniqueness)
- `500` unexpected/internal
