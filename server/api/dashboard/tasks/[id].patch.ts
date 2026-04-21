import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'

type TaskStatus = Database['public']['Enums']['task_status']
type TaskUpdate = Database['public']['Tables']['tasks']['Update']

const VALID_STATUS: TaskStatus[] = ['todo', 'doing', 'review', 'done']

interface Body {
  status?: TaskStatus
  position?: number
  title?: string
  description?: string | null
  points?: number | null
  assignee_id?: string | null
  sprint_id?: string | null
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })

  const body = (await readBody(event)) as Body | undefined
  if (!body) throw createError({ statusCode: 400, statusMessage: 'body required' })
  if (body.status && !VALID_STATUS.includes(body.status)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid status' })
  }

  const authClient = await serverSupabaseClient<Database>(event)
  const { data: userRes } = await authClient.auth.getUser()
  const userId = userRes.user?.id
  if (!userId) throw createError({ statusCode: 401, statusMessage: 'auth required' })

  const { data: profile } = await authClient
    .from('profiles')
    .select('role,disabled')
    .eq('id', userId)
    .maybeSingle()
  if (!profile || profile.disabled || !['admin', 'editor'].includes(profile.role)) {
    throw createError({ statusCode: 403, statusMessage: 'forbidden' })
  }

  const patch: TaskUpdate = {}
  if (body.status !== undefined) patch.status = body.status
  if (body.position !== undefined) patch.position = body.position
  if (body.title !== undefined) patch.title = body.title
  if (body.description !== undefined) patch.description = body.description
  if (body.points !== undefined) patch.points = body.points
  if (body.assignee_id !== undefined) patch.assignee_id = body.assignee_id
  if (body.sprint_id !== undefined) patch.sprint_id = body.sprint_id

  const service = serverSupabaseServiceRole(event)
  const { data, error } = await service
    .from('tasks')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data
})
