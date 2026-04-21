import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'

type TaskStatus = Database['public']['Enums']['task_status']

interface Body {
  project_id?: string
  title?: string
  status?: TaskStatus
  sprint_id?: string | null
  points?: number | null
}

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as Body | undefined
  if (!body?.project_id || !body.title?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'project_id and title required' })
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

  const service = serverSupabaseServiceRole(event)

  // Position: append to end of column.
  const { data: last } = await service
    .from('tasks')
    .select('position')
    .eq('project_id', body.project_id)
    .eq('status', body.status ?? 'todo')
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()
  const position = (last?.position ?? 0) + 1024

  const { data, error } = await service
    .from('tasks')
    .insert({
      project_id: body.project_id,
      title: body.title.trim().slice(0, 280),
      status: body.status ?? 'todo',
      sprint_id: body.sprint_id ?? null,
      points: body.points ?? null,
      position
    })
    .select('*')
    .single()
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data
})
