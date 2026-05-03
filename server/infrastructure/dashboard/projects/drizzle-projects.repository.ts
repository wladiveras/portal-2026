import type { H3Event } from '~~/server/domain/dashboard/shared'
import { buildBurndownResult } from '~~/server/domain/dashboard/burndown'
import { and, desc, eq } from 'drizzle-orm'
import { projects, sprints, tasks } from '~~/server/db/schema'
import { tryGetDrizzle } from '~~/server/db/client'
import { logAudit } from '~~/server/utils/audit'
import { parseISODate, sanitizeSlug } from '~~/server/domain/dashboard/shared'
import { getDefaultOrganizationIdFromEvent } from '~~/server/utils/defaultOrganization'
import type {
  AgileRepositoryPort,
  CreateProjectInput,
  CreateSprintInput,
  CreateTaskInput,
  UpdateProjectInput,
  UpdateSprintInput,
  UpdateTaskInput
} from '~~/server/domain/dashboard/projects/repositories'

export function createDrizzleAgileRepository(event: H3Event): AgileRepositoryPort {
  const db = tryGetDrizzle()
  if (!db) throw createError({ statusCode: 500, statusMessage: 'drizzle client unavailable' })
  const VALID_STATUS: Array<'todo' | 'doing' | 'review' | 'done'> = ['todo', 'doing', 'review', 'done']

  return {
    async createProject(input: CreateProjectInput) {
      const name = input.name?.trim()
      const rawSlug = input.slug?.trim() || name || ''
      const slug = sanitizeSlug(rawSlug)
      const description = input.description?.trim() || null
      const color = input.color?.trim() || null
      if (!name) throw createError({ statusCode: 400, statusMessage: 'name required' })
      if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug required' })
      const organizationId = input.organizationId ?? (await getDefaultOrganizationIdFromEvent(event))
      const [row] = await db
        .insert(projects)
        .values({
          organizationId,
          ownerId: input.userId,
          name: name.slice(0, 120),
          slug: slug.slice(0, 80),
          description: description ? description.slice(0, 1500) : null,
          color
        })
        .returning({
          id: projects.id,
          organization_id: projects.organizationId,
          owner_id: projects.ownerId,
          name: projects.name,
          slug: projects.slug,
          description: projects.description,
          color: projects.color,
          archived: projects.archived,
          created_at: projects.createdAt,
          updated_at: projects.updatedAt
        })
      if (!row) throw createError({ statusCode: 500, statusMessage: 'failed to create project' })
      const auditClient = serverSupabaseServiceRole(event)
      await logAudit(auditClient, {
        action: 'project_created',
        targetType: 'project',
        targetId: row.id,
        meta: { actor_user_id: input.userId, entity: 'project', action: 'insert' }
      })
      return row
    },

    async updateProject(input: UpdateProjectInput) {
      const patch: Record<string, unknown> = {}
      if (input.name !== undefined) {
        const name = input.name.trim()
        if (!name) throw createError({ statusCode: 400, statusMessage: 'name required' })
        patch.name = name.slice(0, 120)
      }
      if (input.slug !== undefined) {
        const slug = sanitizeSlug(input.slug)
        if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug required' })
        patch.slug = slug.slice(0, 80)
      }
      if (input.description !== undefined) patch.description = input.description?.trim() ? input.description.trim().slice(0, 1500) : null
      if (input.color !== undefined) patch.color = input.color?.trim() ? input.color.trim() : null
      if (input.archived !== undefined) patch.archived = input.archived
      if (!Object.keys(patch).length) throw createError({ statusCode: 400, statusMessage: 'no fields to update' })

      const [row] = await db
        .update(projects)
        .set(patch)
        .where(eq(projects.id, input.id))
        .returning({
          id: projects.id,
          organization_id: projects.organizationId,
          owner_id: projects.ownerId,
          name: projects.name,
          slug: projects.slug,
          description: projects.description,
          color: projects.color,
          archived: projects.archived,
          created_at: projects.createdAt,
          updated_at: projects.updatedAt
        })
      if (!row) throw createError({ statusCode: 404, statusMessage: 'project not found' })
      const auditClient = serverSupabaseServiceRole(event)
      await logAudit(auditClient, {
        action: patch.archived === true ? 'project_archived' : 'project_updated',
        targetType: 'project',
        targetId: input.id,
        meta: {
          actor_user_id: input.userId,
          entity: 'project',
          action: patch.archived === true ? 'archive' : 'update',
          fields: Object.keys(patch)
        }
      })
      return row
    },

    async createSprint(input: CreateSprintInput) {
      const projectId = input.project_id?.trim()
      const name = input.name?.trim()
      const startsAt = parseISODate(input.starts_at)
      const endsAt = parseISODate(input.ends_at)
      const goal = input.goal?.trim() || null
      if (!projectId) throw createError({ statusCode: 400, statusMessage: 'project_id required' })
      if (!name) throw createError({ statusCode: 400, statusMessage: 'name required' })
      if (!startsAt || !endsAt) throw createError({ statusCode: 400, statusMessage: 'starts_at and ends_at must be YYYY-MM-DD' })
      if (startsAt > endsAt) throw createError({ statusCode: 400, statusMessage: 'invalid date range' })
      const [row] = await db
        .insert(sprints)
        .values({
          projectId,
          name: name.slice(0, 160),
          startsAt,
          endsAt,
          goal: goal ? goal.slice(0, 2000) : null
        })
        .returning({
          id: sprints.id,
          project_id: sprints.projectId,
          name: sprints.name,
          starts_at: sprints.startsAt,
          ends_at: sprints.endsAt,
          goal: sprints.goal,
          created_at: sprints.createdAt
        })
      if (!row) throw createError({ statusCode: 500, statusMessage: 'failed to create sprint' })
      const auditClient = serverSupabaseServiceRole(event)
      await logAudit(auditClient, {
        action: 'sprint_created',
        targetType: 'sprint',
        targetId: row.id,
        meta: { actor_user_id: input.userId, entity: 'sprint', action: 'insert', project_id: projectId }
      })
      return row
    },

    async updateSprint(input: UpdateSprintInput) {
      const patch: Record<string, unknown> = {}
      if (input.name !== undefined) {
        const name = input.name.trim()
        if (!name) throw createError({ statusCode: 400, statusMessage: 'name required' })
        patch.name = name.slice(0, 160)
      }
      if (input.goal !== undefined) patch.goal = input.goal?.trim() ? input.goal.trim().slice(0, 2000) : null
      if (input.starts_at !== undefined) {
        const startsAt = parseISODate(input.starts_at)
        if (!startsAt) throw createError({ statusCode: 400, statusMessage: 'starts_at must be YYYY-MM-DD' })
        patch.startsAt = startsAt
      }
      if (input.ends_at !== undefined) {
        const endsAt = parseISODate(input.ends_at)
        if (!endsAt) throw createError({ statusCode: 400, statusMessage: 'ends_at must be YYYY-MM-DD' })
        patch.endsAt = endsAt
      }
      if (input.close_now === true) patch.endsAt = new Date().toISOString().slice(0, 10)
      if (!Object.keys(patch).length) throw createError({ statusCode: 400, statusMessage: 'no fields to update' })

      const [row] = await db
        .update(sprints)
        .set(patch)
        .where(eq(sprints.id, input.id))
        .returning({
          id: sprints.id,
          project_id: sprints.projectId,
          name: sprints.name,
          starts_at: sprints.startsAt,
          ends_at: sprints.endsAt,
          goal: sprints.goal,
          created_at: sprints.createdAt
        })
      if (!row) throw createError({ statusCode: 404, statusMessage: 'sprint not found' })
      const auditClient = serverSupabaseServiceRole(event)
      await logAudit(auditClient, {
        action: input.close_now ? 'sprint_closed' : 'sprint_updated',
        targetType: 'sprint',
        targetId: input.id,
        meta: { actor_user_id: input.userId, entity: 'sprint', action: input.close_now ? 'close' : 'update', fields: Object.keys(patch) }
      })
      return row
    },

    async createTask(input: CreateTaskInput) {
      if (!input.project_id || !input.title?.trim()) throw createError({ statusCode: 400, statusMessage: 'project_id and title required' })
      const [last] = await db
        .select({ position: tasks.position })
        .from(tasks)
        .where(and(eq(tasks.projectId, input.project_id), eq(tasks.status, input.status ?? 'todo')))
        .orderBy(desc(tasks.position))
        .limit(1)
      const position = (last?.position ?? 0) + 1024
      const [row] = await db
        .insert(tasks)
        .values({
          projectId: input.project_id,
          title: input.title.trim().slice(0, 280),
          status: input.status ?? 'todo',
          sprintId: input.sprint_id ?? null,
          points: input.points ?? null,
          position
        })
        .returning({
          id: tasks.id,
          project_id: tasks.projectId,
          sprint_id: tasks.sprintId,
          story_id: tasks.storyId,
          title: tasks.title,
          description: tasks.description,
          status: tasks.status,
          points: tasks.points,
          assignee_id: tasks.assigneeId,
          position: tasks.position,
          done_at: tasks.doneAt,
          created_at: tasks.createdAt,
          updated_at: tasks.updatedAt
        })
      if (!row) throw createError({ statusCode: 500, statusMessage: 'failed to create task' })
      const auditClient = serverSupabaseServiceRole(event)
      await logAudit(auditClient, {
        action: 'task_created',
        targetType: 'task',
        targetId: row.id,
        meta: { actor_user_id: input.userId, entity: 'task', action: 'insert', project_id: input.project_id }
      })
      return row
    },

    async updateTask(input: UpdateTaskInput) {
      if (input.status && !VALID_STATUS.includes(input.status)) throw createError({ statusCode: 400, statusMessage: 'invalid status' })
      const patch: Record<string, unknown> = {}
      if (input.status !== undefined) patch.status = input.status
      if (input.position !== undefined) patch.position = input.position
      if (input.title !== undefined) patch.title = input.title
      if (input.description !== undefined) patch.description = input.description
      if (input.points !== undefined) patch.points = input.points
      if (input.assignee_id !== undefined) patch.assigneeId = input.assignee_id
      if (input.sprint_id !== undefined) patch.sprintId = input.sprint_id

      const [row] = await db
        .update(tasks)
        .set(patch)
        .where(eq(tasks.id, input.id))
        .returning({
          id: tasks.id,
          project_id: tasks.projectId,
          sprint_id: tasks.sprintId,
          story_id: tasks.storyId,
          title: tasks.title,
          description: tasks.description,
          status: tasks.status,
          points: tasks.points,
          assignee_id: tasks.assigneeId,
          position: tasks.position,
          done_at: tasks.doneAt,
          created_at: tasks.createdAt,
          updated_at: tasks.updatedAt
        })
      if (!row) throw createError({ statusCode: 404, statusMessage: 'task not found' })
      const auditClient = serverSupabaseServiceRole(event)
      await logAudit(auditClient, {
        action: 'task_updated',
        targetType: 'task',
        targetId: input.id,
        meta: { actor_user_id: input.userId, entity: 'task', action: 'update', fields: Object.keys(patch) }
      })
      return row
    },

    async deleteTask(input: { id: string; userId: string }) {
      const [before] = await db
        .select({ id: tasks.id, project_id: tasks.projectId, title: tasks.title })
        .from(tasks)
        .where(eq(tasks.id, input.id))
        .limit(1)
      if (!before) throw createError({ statusCode: 404, statusMessage: 'task not found' })
      await db.delete(tasks).where(eq(tasks.id, input.id))
      const auditClient = serverSupabaseServiceRole(event)
      await logAudit(auditClient, {
        action: 'task_deleted',
        targetType: 'task',
        targetId: input.id,
        meta: {
          actor_user_id: input.userId,
          entity: 'task',
          action: 'delete',
          project_id: before.project_id,
          title: before.title
        }
      })
    },

    async getBurndown(projectId: string, sprintIdParam: string | null) {
      let sprintRow: {
        id: string
        startsAt: string
        endsAt: string
      } | null = null

      if (sprintIdParam) {
        const [r] = await db
          .select({ id: sprints.id, startsAt: sprints.startsAt, endsAt: sprints.endsAt })
          .from(sprints)
          .where(eq(sprints.id, sprintIdParam))
          .limit(1)
        sprintRow = r ?? null
      } else {
        const [r] = await db
          .select({ id: sprints.id, startsAt: sprints.startsAt, endsAt: sprints.endsAt })
          .from(sprints)
          .where(eq(sprints.projectId, projectId))
          .orderBy(desc(sprints.startsAt))
          .limit(1)
        sprintRow = r ?? null
      }

      if (!sprintRow) return buildBurndownResult(null, [])

      const taskRows = await db
        .select({ points: tasks.points, doneAt: tasks.doneAt })
        .from(tasks)
        .where(and(eq(tasks.projectId, projectId), eq(tasks.sprintId, sprintRow.id)))

      return buildBurndownResult(
        { id: sprintRow.id, starts_at: sprintRow.startsAt, ends_at: sprintRow.endsAt },
        taskRows.map((t) => ({ points: t.points, done_at: t.doneAt }))
      )
    }
  }
}
