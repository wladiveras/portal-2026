import { cmdDeleteNote } from '~~/server/application/dashboard/notes/commands'

export default defineEventHandler(async (event): Promise<{ ok: true }> => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })
  await cmdDeleteNote(event, id)
  return { ok: true }
})
