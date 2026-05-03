import type { Database } from '~/types/database.types'
import { cmdUpdateNotePinned } from '~~/server/application/dashboard/notes/commands'

type NoteRow = Database['public']['Tables']['notes']['Row']

export default defineEventHandler(async (event): Promise<NoteRow> => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })
  const body = await readBody<{ pinned?: boolean }>(event)
  return cmdUpdateNotePinned(event, { id, pinned: body.pinned }) as Promise<NoteRow>
})
