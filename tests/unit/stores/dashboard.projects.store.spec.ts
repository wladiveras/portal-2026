import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('useDashboardProjectsStore', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('loads project list with fetchProjects', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce([
        {
          id: 'p1',
          owner_id: null,
          name: 'Portal',
          slug: 'portal',
          description: null,
          color: null,
          archived: false,
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
          tasks_total: 0,
          tasks_done: 0
        }
      ])
    vi.stubGlobal('$fetch', fetchMock)

    const { useDashboardProjectsStore } = await import(
      '~~/layers/2-dashboard/app/stores/dashboard/projects'
    )
    const store = useDashboardProjectsStore()
    await store.fetchProjects()

    expect(store.projects).toHaveLength(1)
    expect(store.projects[0]?.slug).toBe('portal')
    expect(store.error).toBeNull()
  })

})
