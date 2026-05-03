import { describe, expect, it, vi } from 'vitest'

import { cmdCreateProject, cmdDeleteTask, cmdUpdateTask } from '~~/server/application/dashboard/agile/commands'
import type { AgileRepositoryPort } from '~~/server/domain/dashboard/projects/repositories'

function makeRepository(): AgileRepositoryPort {
  return {
    createProject: vi.fn(async (input) => ({ id: 'p1', ...input })),
    updateProject: vi.fn(async (input) => ({ id: input.id, ...input })),
    createSprint: vi.fn(async (input) => ({ id: 's1', ...input })),
    updateSprint: vi.fn(async (input) => ({ id: input.id, ...input })),
    createTask: vi.fn(async (input) => ({ id: 't1', ...input })),
    updateTask: vi.fn(async (input) => ({ id: input.id, ...input })),
    deleteTask: vi.fn(async () => undefined),
    getBurndown: vi.fn(async () => ({ sprint_id: null, total_points: 0, points: [] }))
  }
}

describe('dashboard agile application commands', () => {
  it('cmdCreateProject dispatches to repository port', async () => {
    const repo = makeRepository()
    await cmdCreateProject({} as never, { userId: 'u1', name: 'Portal' }, repo)
    expect(repo.createProject).toHaveBeenCalledWith({ userId: 'u1', name: 'Portal' })
  })

  it('cmdUpdateTask dispatches to repository port', async () => {
    const repo = makeRepository()
    await cmdUpdateTask({} as never, { id: 't1', userId: 'u1', status: 'doing' }, repo)
    expect(repo.updateTask).toHaveBeenCalledWith({ id: 't1', userId: 'u1', status: 'doing' })
  })

  it('cmdDeleteTask dispatches to repository port', async () => {
    const repo = makeRepository()
    await cmdDeleteTask({} as never, { id: 't1', userId: 'u1' }, repo)
    expect(repo.deleteTask).toHaveBeenCalledWith({ id: 't1', userId: 'u1' })
  })
})
