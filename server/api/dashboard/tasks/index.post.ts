import type { Database } from '~/types/database.types'
import { cmdCreateTask } from '~~/server/application/dashboard/agile/commands'

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
  const { userId } = await requireEditorOrAdmin(event)
  return cmdCreateTask(event, { userId, ...body })
})
