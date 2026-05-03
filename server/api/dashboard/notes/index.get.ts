import type { Database } from '~/types/database.types'
import { qryListNotes } from '~~/server/application/dashboard/notes/queries'

type NoteRow = Database['public']['Tables']['notes']['Row']

export default defineEventHandler(async (event): Promise<NoteRow[]> => {
  return qryListNotes(event) as Promise<NoteRow[]>
})
