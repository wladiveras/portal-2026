import type { H3Event } from 'h3'
import { requireDashboardUserId } from '~~/server/application/dashboard/require-user'
import { createNotesRepository } from '~~/server/infrastructure/dashboard/notes/factory'

export async function cmdCreateNote(event: H3Event, rawBody?: string) {
  const body = rawBody?.trim()
  if (!body) throw createError({ statusCode: 400, statusMessage: 'body required' })
  const userId = await requireDashboardUserId(event)
  const repository = await createNotesRepository(event)
  return repository.create({ userId, body })
}

export async function cmdUpdateNotePinned(event: H3Event, input: { id: string; pinned: unknown }) {
  if (typeof input.pinned !== 'boolean') {
    throw createError({ statusCode: 400, statusMessage: 'pinned required' })
  }
  await requireDashboardUserId(event)
  const repository = await createNotesRepository(event)
  return repository.updatePinned({ id: input.id, pinned: input.pinned })
}

export async function cmdDeleteNote(event: H3Event, id: string) {
  await requireDashboardUserId(event)
  const repository = await createNotesRepository(event)
  await repository.deleteById(id)
}
