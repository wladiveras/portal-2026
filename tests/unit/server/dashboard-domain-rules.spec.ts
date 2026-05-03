import { describe, expect, it } from 'vitest'

import { createProjectDomain } from '~~/server/domain/dashboard/projects.service'
import { parseISODate, sanitizeSlug } from '~~/server/domain/dashboard/shared'

describe('dashboard domain rules', () => {
  it('sanitizeSlug normalizes accents, spaces and duplicate dashes', () => {
    expect(sanitizeSlug('  Prójeto  Núcleo -- 2026  ')).toBe('projeto-nucleo-2026')
  })

  it('parseISODate accepts only YYYY-MM-DD', () => {
    expect(parseISODate('2026-04-27')).toBe('2026-04-27')
    expect(parseISODate('27-04-2026')).toBeNull()
    expect(parseISODate('2026/04/27')).toBeNull()
  })

  it('createProjectDomain rejects empty name before persistence call', async () => {
    const service = {
      from: () => ({
        insert: () => ({
          select: () => ({
            single: async () => ({ data: { id: 'p1' }, error: null })
          })
        })
      })
    } as never

    await expect(
      createProjectDomain(service, {
        userId: 'u1',
        name: '   ',
        slug: 'valid-slug'
      })
    ).rejects.toMatchObject({ statusMessage: 'name required' })
  })
})
