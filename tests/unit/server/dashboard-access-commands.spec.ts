import { describe, expect, it, vi } from 'vitest'

import {
  cmdCreateInvite,
  cmdRevokeInvite,
  cmdUpdateProfile,
  cmdUploadAvatar
} from '~~/server/application/dashboard/access/commands'
import { qryListAudit, qryListInvites, qryListProfiles } from '~~/server/application/dashboard/access/queries'

vi.mock('~~/server/infrastructure/dashboard/factory', () => ({
  createAccessRepository: vi.fn()
}))

vi.mock('~~/server/application/dashboard/require-user', () => ({
  requireDashboardUserId: vi.fn(async () => 'u-self')
}))

function makeAccessRepository() {
  return {
    listProfiles: vi.fn(async () => [
      {
        id: 'u1',
        full_name: 'Admin',
        role: 'admin',
        disabled: false,
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
        avatar_url: null,
        email: 'admin@example.com',
        last_sign_in_at: '2026-01-02'
      }
    ]),
    updateProfile: vi.fn(async ({ profileId, patch }) => ({ id: profileId, ...patch })),
    uploadAvatar: vi.fn(async ({ userId }) => ({
      id: userId,
      avatar_url: 'https://example.com/a.png'
    })),
    listInvites: vi.fn(async () => [{ token: 'tok' }]),
    createInvite: vi.fn(async () => ({ invite: { token: 'tok' } })),
    revokeInvite: vi.fn(async () => undefined),
    listAudit: vi.fn(async () => [
      {
        id: 1,
        actor_id: 'u1',
        action: 'changed',
        target_type: 'profile',
        target_id: 'u2',
        meta: {},
        created_at: '2026-01-01T00:00:00.000Z'
      }
    ])
  }
}

describe('dashboard access application layer', () => {
  it('dispatches profile update through repository port', async () => {
    const { createAccessRepository } = await import('~~/server/infrastructure/dashboard/factory')
    const repo = makeAccessRepository()
    vi.mocked(createAccessRepository).mockReturnValue(repo as never)

    await cmdUpdateProfile({} as never, {
      profileId: 'u2',
      actorId: 'u1',
      role: 'editor'
    })
    expect(repo.updateProfile).toHaveBeenCalledWith({
      profileId: 'u2',
      actorId: 'u1',
      patch: { role: 'editor' }
    })
  })

  it('dispatches invite commands through repository port', async () => {
    const { createAccessRepository } = await import('~~/server/infrastructure/dashboard/factory')
    const repo = makeAccessRepository()
    vi.mocked(createAccessRepository).mockReturnValue(repo as never)

    await cmdCreateInvite({} as never, {
      actorId: 'u1',
      email: 'new@example.com',
      role: 'viewer',
      origin: 'https://portal.example.com'
    })
    await cmdRevokeInvite({} as never, { actorId: 'u1', token: 'tok' })

    expect(repo.createInvite).toHaveBeenCalledWith({
      actorId: 'u1',
      email: 'new@example.com',
      role: 'viewer',
      redirectTo: 'https://portal.example.com/confirm'
    })
    expect(repo.revokeInvite).toHaveBeenCalledWith({
      actorId: 'u1',
      token: 'tok'
    })
  })

  it('uploads avatar through repository port', async () => {
    const { createAccessRepository } = await import('~~/server/infrastructure/dashboard/factory')
    const repo = makeAccessRepository()
    vi.mocked(createAccessRepository).mockReturnValue(repo as never)

    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47])
    await cmdUploadAvatar({} as never, {
      bytes: png,
      mimeType: 'image/png',
      filename: 'x.png'
    })

    expect(repo.uploadAvatar).toHaveBeenCalledWith({
      userId: 'u-self',
      bytes: png,
      mimeType: 'image/png',
      filename: 'x.png'
    })
  })

  it('queries profiles/invites/audit through repository port', async () => {
    const { createAccessRepository } = await import('~~/server/infrastructure/dashboard/factory')
    const repo = makeAccessRepository()
    vi.mocked(createAccessRepository).mockReturnValue(repo as never)

    await qryListProfiles({} as never)
    await qryListInvites({} as never)
    const audit = await qryListAudit({} as never, { limit: 50 })

    expect(repo.listProfiles).toHaveBeenCalled()
    expect(repo.listInvites).toHaveBeenCalled()
    expect(repo.listAudit).toHaveBeenCalledWith(51)
    expect(audit.items[0]).toMatchObject({ actor_label: 'Admin' })
  })
})
