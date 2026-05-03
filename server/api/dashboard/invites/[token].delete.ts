import { cmdRevokeInvite } from '~~/server/application/dashboard/access/commands'

export default defineEventHandler(async (event) => {
  const { userId } = await requireAdmin(event)
  await cmdRevokeInvite(event, {
    actorId: userId,
    token: getRouterParam(event, 'token') ?? undefined
  })
  setResponseStatus(event, 204)
  return null
})
