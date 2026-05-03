import type { Database } from '~/types/database.types'
import { cmdCreateNote } from '~~/server/application/dashboard/notes/commands'

type NoteRow = Database['public']['Tables']['notes']['Row']

export default defineEventHandler(async (event): Promise<NoteRow> => {
  const body = await readBody<{ body?: string }>(event)
  return cmdCreateNote(event, body.body) as Promise<NoteRow>
})
