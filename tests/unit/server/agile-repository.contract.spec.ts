import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~~/server/db/client', () => ({
  tryGetDrizzle: vi.fn()
}))

describe('agile repository adapters contract', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it(
    'supabase adapter and drizzle adapter expose equivalent method surface',
    async () => {
      const { createSupabaseAgileRepository } = await import(
        '~~/server/infrastructure/dashboard/projects/supabase-projects.repository'
      )
      const { createDrizzleAgileRepository } = await import(
        '~~/server/infrastructure/dashboard/projects/drizzle-projects.repository'
      )
      const { tryGetDrizzle } = await import('~~/server/db/client')
      vi.mocked(tryGetDrizzle).mockReturnValue({} as never)

      const supabaseRepo = createSupabaseAgileRepository({} as never)
      const drizzleRepo = createDrizzleAgileRepository({} as never)

      expect(Object.keys(supabaseRepo).sort()).toEqual(Object.keys(drizzleRepo).sort())
    },
    15_000
  )
})

describe('agile repository factory fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('prefers drizzle adapter when drizzle client exists', async () => {
    const { tryGetDrizzle } = await import('~~/server/db/client')
    const drizzleModule = await import('~~/server/infrastructure/dashboard/projects/drizzle-projects.repository')
    const supabaseModule = await import('~~/server/infrastructure/dashboard/projects/supabase-projects.repository')
    const { createAgileRepository } = await import('~~/server/infrastructure/dashboard/factory')

    vi.mocked(tryGetDrizzle).mockReturnValue({ client: 'drizzle' } as never)
    const drizzleSpy = vi.spyOn(drizzleModule, 'createDrizzleAgileRepository').mockReturnValue({} as never)
    const supabaseSpy = vi.spyOn(supabaseModule, 'createSupabaseAgileRepository').mockReturnValue({} as never)

    createAgileRepository({ marker: 'event' } as never)

    expect(drizzleSpy).toHaveBeenCalledTimes(1)
    expect(supabaseSpy).not.toHaveBeenCalled()
  })

  it('falls back to supabase adapter when drizzle is unavailable', async () => {
    const { tryGetDrizzle } = await import('~~/server/db/client')
    const drizzleModule = await import('~~/server/infrastructure/dashboard/projects/drizzle-projects.repository')
    const supabaseModule = await import('~~/server/infrastructure/dashboard/projects/supabase-projects.repository')
    const { createAgileRepository } = await import('~~/server/infrastructure/dashboard/factory')

    vi.mocked(tryGetDrizzle).mockReturnValue(null)
    const serviceRole = { marker: 'service-role' }
    const serviceRoleStub = vi.fn(() => serviceRole)
    vi.stubGlobal('serverSupabaseServiceRole', serviceRoleStub)
    const drizzleSpy = vi.spyOn(drizzleModule, 'createDrizzleAgileRepository').mockReturnValue({} as never)
    const supabaseSpy = vi.spyOn(supabaseModule, 'createSupabaseAgileRepository').mockReturnValue({} as never)

    createAgileRepository({ marker: 'event' } as never)

    expect(serviceRoleStub).toHaveBeenCalledTimes(1)
    expect(drizzleSpy).not.toHaveBeenCalled()
    expect(supabaseSpy).toHaveBeenCalledWith(serviceRole)
  })
})
