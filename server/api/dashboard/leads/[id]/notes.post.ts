import { cmdAddLeadNote } from '~~/server/application/dashboard/leads/commands'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })

  const body = (await readBody(event)) as { body?: string } | undefined
  const { userId } = await requireEditorOrAdmin(event)
  return cmdAddLeadNote(event, {
    leadId: id,
    actorId: userId,
    body: body?.body
  })
})
