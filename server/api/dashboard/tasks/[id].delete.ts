import { cmdDeleteTask } from '~~/server/application/dashboard/agile/commands'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })

  const { userId } = await requireEditorOrAdmin(event)
  await cmdDeleteTask(event, { id, userId })

  setResponseStatus(event, 204)
  return null
})
