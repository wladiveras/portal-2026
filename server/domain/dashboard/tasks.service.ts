import { logAudit } from '~~/server/utils/audit'
import type { Service, Task, TaskStatus, TaskUpdate } from './shared'

export interface CreateTaskInput {
  userId: string
  project_id?: string
  title?: string
  status?: TaskStatus
  sprint_id?: string | null
  points?: number | null
}

export interface UpdateTaskInput {
  id: string
  userId: string
  status?: TaskStatus
  position?: number
  title?: string
  description?: string | null
  points?: number | null
  assignee_id?: string | null
  sprint_id?: string | null
}

const VALID_STATUS: TaskStatus[] = ['todo', 'doing', 'review', 'done']

export async function createTaskDomain(service: Service, input: CreateTaskInput): Promise<Task> {
  if (!input.project_id || !input.title?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'project_id and title required' })
  }

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
    meta: {
      actor_user_id: input.userId,
      entity: 'task',
      action: 'insert',
      project_id: input.project_id
    }
  })

  return data
}

export async function updateTaskDomain(service: Service, input: UpdateTaskInput): Promise<Task> {
  if (input.status && !VALID_STATUS.includes(input.status)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid status' })
  }

  const patch: TaskUpdate = {}
  if (input.status !== undefined) patch.status = input.status
  if (input.position !== undefined) patch.position = input.position
  if (input.title !== undefined) patch.title = input.title
  if (input.description !== undefined) patch.description = input.description
  if (input.points !== undefined) patch.points = input.points
  if (input.assignee_id !== undefined) patch.assignee_id = input.assignee_id
  if (input.sprint_id !== undefined) patch.sprint_id = input.sprint_id

  const { data, error } = await service
    .from('tasks')
    .update(patch)
    .eq('id', input.id)
    .select('*')
    .single()
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  await logAudit(service, {
    action: 'task_updated',
    targetType: 'task',
    targetId: input.id,
    meta: {
      actor_user_id: input.userId,
      entity: 'task',
      action: 'update',
      fields: Object.keys(patch)
    }
  })

  return data
}

export async function deleteTaskDomain(
  service: Service,
  input: { id: string; userId: string }
): Promise<void> {
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
}
