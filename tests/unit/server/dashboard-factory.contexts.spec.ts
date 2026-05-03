import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~~/server/db/client', () => ({
  tryGetDrizzle: vi.fn(() => null)
}))

vi.mock('~~/server/infrastructure/dashboard/leads/supabase-leads.repository', () => ({
  createSupabaseLeadsRepository: vi.fn(() => ({ marker: 'leads-repo' }))
}))

vi.mock('~~/server/infrastructure/dashboard/access/supabase-access.repository', () => ({
  createSupabaseAccessRepository: vi.fn(() => ({ marker: 'access-repo' }))
}))

vi.mock('~~/server/infrastructure/dashboard/tracking/supabase-tracking.repository', () => ({
  createSupabaseTrackingRepository: vi.fn(() => ({ marker: 'tracking-repo' }))
}))

vi.mock('~~/server/infrastructure/dashboard/portfolio/supabase-portfolio.repository', () => ({
  createSupabasePortfolioRepository: vi.fn(() => ({ marker: 'portfolio-repo' }))
}))

describe('dashboard factory context resolution', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it(
    'creates leads/access/tracking/portfolio repositories using service-role client',
    async () => {
    const serviceRole = { marker: 'service-role' }
    const serviceRoleStub = vi.fn(() => serviceRole)
    vi.stubGlobal('serverSupabaseServiceRole', serviceRoleStub)

    const { createSupabaseLeadsRepository } = await import(
      '~~/server/infrastructure/dashboard/leads/supabase-leads.repository'
    )
    const { createSupabaseAccessRepository } = await import(
      '~~/server/infrastructure/dashboard/access/supabase-access.repository'
    )
    const { createSupabaseTrackingRepository } = await import(
      '~~/server/infrastructure/dashboard/tracking/supabase-tracking.repository'
    )
    const { createSupabasePortfolioRepository } = await import(
      '~~/server/infrastructure/dashboard/portfolio/supabase-portfolio.repository'
    )
    const {
      createLeadsRepository,
      createAccessRepository,
      createTrackingRepository,
      createPortfolioRepository
    } = await import('~~/server/infrastructure/dashboard/factory')

    const event = { marker: 'event' } as never

    const leadsRepo = createLeadsRepository(event)
    const accessRepo = createAccessRepository(event)
    const trackingRepo = createTrackingRepository(event)
    const portfolioRepo = createPortfolioRepository(event)

    expect(leadsRepo).toMatchObject({ marker: 'leads-repo' })
    expect(accessRepo).toMatchObject({ marker: 'access-repo' })
    expect(trackingRepo).toMatchObject({ marker: 'tracking-repo' })
    expect(portfolioRepo).toMatchObject({ marker: 'portfolio-repo' })

    expect(serviceRoleStub).toHaveBeenCalledTimes(4)
    expect(createSupabaseLeadsRepository).toHaveBeenCalledWith(serviceRole)
    expect(createSupabaseAccessRepository).toHaveBeenCalledWith(serviceRole)
    expect(createSupabaseTrackingRepository).toHaveBeenCalledWith(serviceRole)
    expect(createSupabasePortfolioRepository).toHaveBeenCalledWith(serviceRole)
    },
    15_000
  )
})
