import { cmdPublishLanding } from '~~/server/application/dashboard/landing/commands'
import { requireEditorOrAdmin } from '~~/server/utils/requireEditorOrAdmin'

export default defineEventHandler(async (event) => {
  const { userId } = await requireEditorOrAdmin(event)
  const projectId = getRouterParam(event, 'id')
  if (!projectId) throw createError({ statusCode: 400, statusMessage: 'id required' })
  return cmdPublishLanding(event, { projectId, userId })
})
