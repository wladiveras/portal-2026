import { describe, expect, it } from 'vitest'
import { createProjectDomain, updateProjectDomain } from '~~/server/domain/dashboard/projects.service'
import { createSprintDomain, updateSprintDomain } from '~~/server/domain/dashboard/sprints.service'

describe('dashboard domain guards', () => {
  it('createProjectDomain requires non-empty name', async () => {
    await expect(
      createProjectDomain({} as never, {
        userId: 'u1',
        name: '   ',
        slug: 'portal'
      })
    ).rejects.toMatchObject({ statusMessage: 'name required' })
  })

  it('createSprintDomain validates date range', async () => {
    await expect(
      createSprintDomain({} as never, {
        userId: 'u1',
        project_id: 'p1',
        name: 'Sprint',
        starts_at: '2026-05-10',
        ends_at: '2026-05-01'
      })
    ).rejects.toMatchObject({ statusMessage: 'invalid date range' })
  })

  it('updateSprintDomain rejects empty patch payload', async () => {
    await expect(
      updateSprintDomain({} as never, {
        id: 's1',
        userId: 'u1'
      })
    ).rejects.toMatchObject({ statusMessage: 'no fields to update' })
  })

  it('updateProjectDomain validates slug normalization result', async () => {
    await expect(
      updateProjectDomain({} as never, {
        id: 'p1',
        userId: 'u1',
        slug: '---'
      })
    ).rejects.toMatchObject({ statusMessage: 'slug required' })
  })
})
