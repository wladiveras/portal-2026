import { describe, expect, it, vi } from 'vitest'

import { cmdAddLeadNote, cmdDeleteLead, cmdUpdateLeadStatus } from '~~/server/application/dashboard/leads/commands'
import { qryGetLeadDetail, qryListLeads } from '~~/server/application/dashboard/leads/queries'
import type { LeadsRepositoryPort } from '~~/server/domain/dashboard/leads/repositories'

vi.mock('~~/server/infrastructure/dashboard/factory', () => ({
  createLeadsRepository: vi.fn()
}))

function makeLeadsRepository(): LeadsRepositoryPort {
  return {
    list: vi.fn(async () => ({ items: [], total: 0, page: 1, pageSize: 25 })),
    getById: vi.fn(async () => null),
    getDetailById: vi.fn(async () => null),
    getLeadConversionStats: vi.fn(async () => ({
      leads: { current: 0, previous: 0 },
      conversions: { current: 0, previous: 0 }
    })),
    getLeadChartRows: vi.fn(async () => []),
    listLeadActivityFeed: vi.fn(async () => []),
    updateStatus: vi.fn(async (input) => ({ id: input.id, status: input.status } as never)),
    addNote: vi.fn(async (input) => ({ id: 'n1', lead_id: input.leadId, body: input.body } as never)),
    deleteById: vi.fn(async () => undefined)
  }
}

describe('dashboard leads application layer', () => {
  it('dispatches lead status update through repository port', async () => {
    const { createLeadsRepository } = await import('~~/server/infrastructure/dashboard/factory')
    const repo = makeLeadsRepository()
    vi.mocked(createLeadsRepository).mockReturnValue(repo)

    await cmdUpdateLeadStatus({} as never, {
      id: 'l1',
      actorId: 'u1',
      status: 'qualified'
    })
    expect(repo.updateStatus).toHaveBeenCalledWith({
      id: 'l1',
      actorId: 'u1',
      status: 'qualified'
    })
  })

  it('dispatches add note and delete lead through repository port', async () => {
    const { createLeadsRepository } = await import('~~/server/infrastructure/dashboard/factory')
    const repo = makeLeadsRepository()
    vi.mocked(createLeadsRepository).mockReturnValue(repo)

    await cmdAddLeadNote({} as never, { leadId: 'l1', actorId: 'u1', body: 'ok note' })
    await cmdDeleteLead({} as never, { id: 'l1', actorId: 'u1' })

    expect(repo.addNote).toHaveBeenCalledWith({
      leadId: 'l1',
      actorId: 'u1',
      body: 'ok note'
    })
    expect(repo.deleteById).toHaveBeenCalledWith({
      id: 'l1',
      actorId: 'u1'
    })
  })

  it('fetches lead detail through repository port', async () => {
    const { createLeadsRepository } = await import('~~/server/infrastructure/dashboard/factory')
    const repo = makeLeadsRepository()
    vi.mocked(createLeadsRepository).mockReturnValue(repo)
    vi.mocked(repo.getDetailById).mockResolvedValue({
      lead: { id: 'l1' } as never,
      events: [],
      notes: []
    })

    const result = await qryGetLeadDetail({} as never, 'l1')
    expect(repo.getDetailById).toHaveBeenCalledWith('l1')
    expect(result.lead).toEqual({ id: 'l1' })
  })

  it('normalizes list query and dispatches through repository port', async () => {
    const { createLeadsRepository } = await import('~~/server/infrastructure/dashboard/factory')
    const repo = makeLeadsRepository()
    vi.mocked(createLeadsRepository).mockReturnValue(repo)

    await qryListLeads({} as never, {
      page: 0,
      pageSize: 999,
      status: ['qualified', 'invalid'],
      source: 'landing',
      search: '  acme  '
    })

    expect(repo.list).toHaveBeenCalledWith({
      page: 1,
      pageSize: 100,
      status: ['qualified'],
      source: ['landing'],
      utmCampaign: undefined,
      q: 'acme',
      from: undefined,
      to: undefined
    })
  })
})
