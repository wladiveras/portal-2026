import { describe, expect, it, vi } from 'vitest'

import { cmdRecordBeaconEvent, cmdRecordLandingLead } from '~~/server/application/dashboard/tracking/commands'
import type { TrackingRepositoryPort } from '~~/server/domain/dashboard/tracking/repositories'

vi.mock('~~/server/infrastructure/dashboard/factory', () => ({
  createTrackingRepository: vi.fn()
}))

function makeTrackingRepository(): TrackingRepositoryPort {
  return {
    recordBeaconEvent: vi.fn(async () => undefined),
    recordLandingLead: vi.fn(async () => ({ leadId: 'lead-1' }))
  }
}

describe('dashboard tracking application commands', () => {
  it('dispatches beacon event through tracking repository', async () => {
    const { createTrackingRepository } = await import('~~/server/infrastructure/dashboard/factory')
    const repo = makeTrackingRepository()
    vi.mocked(createTrackingRepository).mockReturnValue(repo)

    await cmdRecordBeaconEvent({} as never, {
      anonId: 'anon',
      type: 'page_view',
      path: '/'
    })

    expect(repo.recordBeaconEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        anonId: 'anon',
        type: 'page_view',
        path: '/'
      })
    )
  })

  it('dispatches landing lead through tracking repository', async () => {
    const { createTrackingRepository } = await import('~~/server/infrastructure/dashboard/factory')
    const repo = makeTrackingRepository()
    vi.mocked(createTrackingRepository).mockReturnValue(repo)

    const result = await cmdRecordLandingLead({} as never, {
      anonId: 'anon',
      source: 'landing',
      contactValue: 'a@b.com'
    })

    expect(result).toEqual({ leadId: 'lead-1' })
    expect(repo.recordLandingLead).toHaveBeenCalledWith(
      expect.objectContaining({
        anonId: 'anon',
        source: 'landing',
        contactValue: 'a@b.com',
        projectId: null
      })
    )
  })

  it('passes projectId when provided', async () => {
    const { createTrackingRepository } = await import('~~/server/infrastructure/dashboard/factory')
    const repo = makeTrackingRepository()
    vi.mocked(createTrackingRepository).mockReturnValue(repo)

    await cmdRecordLandingLead({} as never, {
      anonId: 'anon',
      source: 'project_landing',
      contactValue: 'x@y.com',
      projectId: 'proj-uuid'
    })

    expect(repo.recordLandingLead).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 'proj-uuid'
      })
    )
  })
})
