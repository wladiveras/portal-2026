import type { Service } from '~~/server/domain/dashboard/shared'
import type { Database } from '~/types/database.types'
import { buildBurndownResult } from '~~/server/domain/dashboard/burndown'
import { logAudit } from '~~/server/utils/audit'
import { parseISODate, sanitizeSlug } from '~~/server/domain/dashboard/shared'
import { getDefaultOrganizationIdFromService } from '~~/server/utils/defaultOrganization'
import type {
  AgileRepositoryPort,
  CreateProjectInput,
  CreateSprintInput,
  CreateTaskInput,
  UpdateProjectInput,
  UpdateSprintInput,
  UpdateTaskInput
} from '~~/server/domain/dashboard/projects/repositories'

export function createSupabaseAgileRepository(service: Service): AgileRepositoryPort {
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
      const organizationId = input.organizationId ?? (await getDefaultOrganizationIdFromService(service))

      const { data, error } = await service
        .from('projects')
        .insert({
          name: name.slice(0, 120),
          slug: slug.slice(0, 80),
          description: description ? description.slice(0, 1500) : null,
          color,
          organization_id: organizationId,
          owner_id: input.userId
        })
        .select('*')
        .single()
      if (error) {
        if (error.code === '23505') throw createError({ statusCode: 409, statusMessage: 'slug already exists' })
        throw createError({ statusCode: 500, statusMessage: error.message })
      }
      await logAudit(service, {
        action: 'project_created',
        targetType: 'project',
        targetId: data.id,
        meta: { actor_user_id: input.userId, entity: 'project', action: 'insert' }
      })
      return data
    },

    async updateProject(input: UpdateProjectInput) {
      const patch: Database['public']['Tables']['projects']['Update'] = {}
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

      const { data, error } = await service.from('projects').update(patch).eq('id', input.id).select('*').single()
      if (error) {
        if (error.code === '23505') throw createError({ statusCode: 409, statusMessage: 'slug already exists' })
        throw createError({ statusCode: 500, statusMessage: error.message })
      }
      await logAudit(service, {
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
      return data
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

      const { data, error } = await service
        .from('sprints')
        .insert({
          project_id: projectId,
          name: name.slice(0, 160),
          starts_at: startsAt,
          ends_at: endsAt,
          goal: goal ? goal.slice(0, 2000) : null
        })
        .select('*')
        .single()
      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      await logAudit(service, {
        action: 'sprint_created',
        targetType: 'sprint',
        targetId: data.id,
        meta: { actor_user_id: input.userId, entity: 'sprint', action: 'insert', project_id: projectId }
      })
      return data
    },

    async updateSprint(input: UpdateSprintInput) {
      const patch: Database['public']['Tables']['sprints']['Update'] = {}
      if (input.name !== undefined) {
        const name = input.name.trim()
        if (!name) throw createError({ statusCode: 400, statusMessage: 'name required' })
        patch.name = name.slice(0, 160)
      }
      if (input.goal !== undefined) patch.goal = input.goal?.trim() ? input.goal.trim().slice(0, 2000) : null
      if (input.starts_at !== undefined) {
        const startsAt = parseISODate(input.starts_at)
        if (!startsAt) throw createError({ statusCode: 400, statusMessage: 'starts_at must be YYYY-MM-DD' })
        patch.starts_at = startsAt
      }
      if (input.ends_at !== undefined) {
        const endsAt = parseISODate(input.ends_at)
        if (!endsAt) throw createError({ statusCode: 400, statusMessage: 'ends_at must be YYYY-MM-DD' })
        patch.ends_at = endsAt
      }
      if (input.close_now === true) patch.ends_at = new Date().toISOString().slice(0, 10)
      if (!Object.keys(patch).length) throw createError({ statusCode: 400, statusMessage: 'no fields to update' })

      const { data, error } = await service.from('sprints').update(patch).eq('id', input.id).select('*').single()
      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      await logAudit(service, {
        action: input.close_now ? 'sprint_closed' : 'sprint_updated',
        targetType: 'sprint',
        targetId: input.id,
        meta: { actor_user_id: input.userId, entity: 'sprint', action: input.close_now ? 'close' : 'update', fields: Object.keys(patch) }
      })
      return data
    },

    async createTask(input: CreateTaskInput) {
      if (!input.project_id || !input.title?.trim()) throw createError({ statusCode: 400, statusMessage: 'project_id and title required' })
      const { data: last } = await service
        .from('tasks')
        .select('position')
        .eq('project_id', input.project_id)
        .eq('status', input.status ?? 'todo')
        .order('position', { ascending: false })
        .limit(1)
        .maybeSingle()
      const position = (last?.position ?? 0) + 1024
      const { data, error } = await service
        .from('tasks')
        .insert({
          project_id: input.project_id,
          title: input.title.trim().slice(0, 280),
          status: input.status ?? 'todo',
          sprint_id: input.sprint_id ?? null,
          points: input.points ?? null,
          position
        })
        .select('*')
        .single()
      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      await logAudit(service, {
        action: 'task_created',
        targetType: 'task',
        targetId: data.id,
        meta: { actor_user_id: input.userId, entity: 'task', action: 'insert', project_id: input.project_id }
      })
      return data
    },

    async updateTask(input: UpdateTaskInput) {
      if (input.status && !VALID_STATUS.includes(input.status)) throw createError({ statusCode: 400, statusMessage: 'invalid status' })
      const patch: Database['public']['Tables']['tasks']['Update'] = {}
      if (input.status !== undefined) patch.status = input.status
      if (input.position !== undefined) patch.position = input.position
      if (input.title !== undefined) patch.title = input.title
      if (input.description !== undefined) patch.description = input.description
      if (input.points !== undefined) patch.points = input.points
      if (input.assignee_id !== undefined) patch.assignee_id = input.assignee_id
      if (input.sprint_id !== undefined) patch.sprint_id = input.sprint_id

      const { data, error } = await service.from('tasks').update(patch).eq('id', input.id).select('*').single()
      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      await logAudit(service, {
        action: 'task_updated',
        targetType: 'task',
        targetId: input.id,
        meta: { actor_user_id: input.userId, entity: 'task', action: 'update', fields: Object.keys(patch) }
      })
      return data
    },

    async deleteTask(input: { id: string; userId: string }) {
      const { data: before, error: beforeError } = await service
        .from('tasks')
        .select('id, project_id, title')
        .eq('id', input.id)
        .maybeSingle()
      if (beforeError) throw createError({ statusCode: 500, statusMessage: beforeError.message })
      if (!before) throw createError({ statusCode: 404, statusMessage: 'task not found' })
      const { error } = await service.from('tasks').delete().eq('id', input.id)
      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      await logAudit(service, {
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
      const { data: sprint } = sprintIdParam
        ? await service.from('sprints').select('*').eq('id', sprintIdParam).maybeSingle()
        : await service
            .from('sprints')
            .select('*')
            .eq('project_id', projectId)
            .order('starts_at', { ascending: false })
            .limit(1)
            .maybeSingle()

      if (!sprint) return buildBurndownResult(null, [])

      const { data: taskRows, error } = await service
        .from('tasks')
        .select('points, done_at')
        .eq('project_id', projectId)
        .eq('sprint_id', sprint.id)

      if (error) throw createError({ statusCode: 500, statusMessage: error.message })

      return buildBurndownResult(
        { id: sprint.id, starts_at: sprint.starts_at, ends_at: sprint.ends_at },
        (taskRows ?? []) as Array<{ points: number | null; done_at: string | null }>
      )
    }
  }
}
