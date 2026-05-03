import type { H3Event } from 'h3'
import { requireDashboardUserId } from '~~/server/application/dashboard/require-user'
import { createNotesRepository } from '~~/server/infrastructure/dashboard/notes/factory'

export async function qryListNotes(event: H3Event) {
  await requireDashboardUserId(event)
  const repository = await createNotesRepository(event)
  return repository.list()
}
