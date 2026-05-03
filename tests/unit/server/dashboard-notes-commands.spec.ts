import { describe, expect, it, vi } from 'vitest'

import { cmdCreateNote, cmdDeleteNote, cmdUpdateNotePinned } from '~~/server/application/dashboard/notes/commands'
import { qryListNotes } from '~~/server/application/dashboard/notes/queries'
import type { NotesRepositoryPort } from '~~/server/domain/dashboard/notes/repositories'

vi.mock('~~/server/infrastructure/dashboard/notes/factory', () => ({
  createNotesRepository: vi.fn()
}))

vi.mock('~~/server/application/dashboard/require-user', () => ({
  requireDashboardUserId: vi.fn(async () => 'user-1')
}))

function makeNotesRepository(): NotesRepositoryPort {
  return {
    list: vi.fn(async () => []),
    create: vi.fn(
      async (input) =>
        ({
          id: 'n1',
          user_id: input.userId,
          body: input.body,
          pinned: false,
          created_at: '',
          updated_at: ''
        }) as never
    ),
    updatePinned: vi.fn(async (input) => ({ id: input.id, pinned: input.pinned } as never)),
    deleteById: vi.fn(async () => undefined)
  }
}

describe('dashboard notes application layer', () => {
  it('lists notes through repository', async () => {
    const { createNotesRepository } = await import('~~/server/infrastructure/dashboard/notes/factory')
    const repo = makeNotesRepository()
    vi.mocked(createNotesRepository).mockResolvedValue(repo)

    await qryListNotes({} as never)
    expect(repo.list).toHaveBeenCalledTimes(1)
  })

  it('creates note with trimmed body', async () => {
    const { createNotesRepository } = await import('~~/server/infrastructure/dashboard/notes/factory')
    const repo = makeNotesRepository()
    vi.mocked(createNotesRepository).mockResolvedValue(repo)

    await cmdCreateNote({} as never, '  hello  ')
    expect(repo.create).toHaveBeenCalledWith({ userId: 'user-1', body: 'hello' })
  })

  it('updates pinned and deletes by id', async () => {
    const { createNotesRepository } = await import('~~/server/infrastructure/dashboard/notes/factory')
    const repo = makeNotesRepository()
    vi.mocked(createNotesRepository).mockResolvedValue(repo)

    await cmdUpdateNotePinned({} as never, { id: 'n1', pinned: true })
    await cmdDeleteNote({} as never, 'n1')

    expect(repo.updatePinned).toHaveBeenCalledWith({ id: 'n1', pinned: true })
    expect(repo.deleteById).toHaveBeenCalledWith('n1')
  })
})
