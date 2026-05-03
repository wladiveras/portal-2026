import type { Database } from '~/types/database.types'
import { cmdUpdateTask } from '~~/server/application/dashboard/agile/commands'

type TaskStatus = Database['public']['Enums']['task_status']

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
  const { userId } = await requireEditorOrAdmin(event)
  return cmdUpdateTask(event, { id, userId, ...body })
})
