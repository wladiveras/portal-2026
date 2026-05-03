import { describe, expect, it, vi } from 'vitest'

function makeLeadsServiceMock() {
  const from = vi.fn((table: string) => {
    if (table === 'leads') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(async () => ({ data: { id: 'l1', status: 'proposal' }, error: null }))
          }))
        }))
      }
    }
    if (table === 'profiles') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(async () => ({ data: { role: 'editor' }, error: null }))
          }))
        }))
      }
    }
    return {}
  })
  return { from } as never
}

function makeAccessServiceMock() {
  const inviteUserByEmail = vi.fn(async () => ({ error: null }))
  const from = vi.fn((table: string) => {
    if (table === 'invites') {
      return {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(async () => ({
              data: { id: 'i1', email: 'a@b.com', role: 'viewer', token: 't', created_by: 'u1' },
              error: null
            }))
          }))
        }))
      }
    }
    return {}
  })
  return { from, auth: { admin: { inviteUserByEmail } } } as never
}

describe('leads/access repository contracts', () => {
  it('rejects invalid non-forward lead transition for non-admin actor', async () => {
    const { createSupabaseLeadsRepository } = await import(
      '~~/server/infrastructure/dashboard/leads/supabase-leads.repository'
    )
    const repo = createSupabaseLeadsRepository(makeLeadsServiceMock())

    await expect(
      repo.updateStatus({
        id: 'l1',
        actorId: 'u1',
        status: 'new'
      })
    ).rejects.toMatchObject({ statusMessage: 'invalid transition' })
  })

  it('creates invite through repository contract', async () => {
    const service = makeAccessServiceMock()
    const { createSupabaseAccessRepository } = await import(
      '~~/server/infrastructure/dashboard/access/supabase-access.repository'
    )
    const repo = createSupabaseAccessRepository(service)

    const result = await repo.createInvite({
      email: 'a@b.com',
      role: 'viewer',
      actorId: 'u1',
      redirectTo: 'https://example.com/confirm'
    })

    expect(result.invite).toBeTruthy()
    expect(service.auth.admin.inviteUserByEmail).toHaveBeenCalledWith('a@b.com', {
      redirectTo: 'https://example.com/confirm'
    })
  })
})
