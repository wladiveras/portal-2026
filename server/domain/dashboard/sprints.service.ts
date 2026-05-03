import { logAudit } from '~~/server/utils/audit'
import type { Service, Sprint, SprintUpdate } from './shared'
import { parseISODate } from './shared'

export interface CreateSprintInput {
  userId: string
  project_id?: string
  name?: string
  starts_at?: string
  ends_at?: string
  goal?: string | null
}

export interface UpdateSprintInput {
  id: string
  userId: string
  name?: string
  starts_at?: string
  ends_at?: string
  goal?: string | null
  close_now?: boolean
}

export async function createSprintDomain(service: Service, input: CreateSprintInput): Promise<Sprint> {
  const projectId = input.project_id?.trim()
  const name = input.name?.trim()
  const startsAt = parseISODate(input.starts_at)
  const endsAt = parseISODate(input.ends_at)
  const goal = input.goal?.trim() || null

  if (!projectId) throw createError({ statusCode: 400, statusMessage: 'project_id required' })
  if (!name) throw createError({ statusCode: 400, statusMessage: 'name required' })
  if (!startsAt || !endsAt) {
    throw createError({ statusCode: 400, statusMessage: 'starts_at and ends_at must be YYYY-MM-DD' })
  }
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
    meta: {
      actor_user_id: input.userId,
      entity: 'sprint',
      action: 'insert',
      project_id: projectId
    }
  })

  return data
}

export async function updateSprintDomain(service: Service, input: UpdateSprintInput): Promise<Sprint> {
  const patch: SprintUpdate = {}
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

  if (!Object.keys(patch).length) {
    throw createError({ statusCode: 400, statusMessage: 'no fields to update' })
  }

  const { data, error } = await service.from('sprints').update(patch).eq('id', input.id).select('*').single()
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  await logAudit(service, {
    action: input.close_now ? 'sprint_closed' : 'sprint_updated',
    targetType: 'sprint',
    targetId: input.id,
    meta: {
      actor_user_id: input.userId,
      entity: 'sprint',
      action: input.close_now ? 'close' : 'update',
      fields: Object.keys(patch)
    }
  })

  return data
}
