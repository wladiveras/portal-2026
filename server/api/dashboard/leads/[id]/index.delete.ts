import { cmdDeleteLead } from '~~/server/application/dashboard/leads/commands'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })

  const { userId } = await requireAdmin(event)
  await cmdDeleteLead(event, { id, actorId: userId })

  setResponseStatus(event, 204)
  return null
})
