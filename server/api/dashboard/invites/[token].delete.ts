export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const token = getRouterParam(event, 'token')
  if (!token) throw createError({ statusCode: 400, statusMessage: 'token required' })
  const service = serverSupabaseServiceRole(event)
  const { error } = await service.from('invites').delete().eq('token', token)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  setResponseStatus(event, 204)
  return null
})
