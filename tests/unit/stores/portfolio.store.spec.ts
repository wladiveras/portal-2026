import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { PortfolioData } from '~/types/portfolio'

const minimalPayload: PortfolioData = {
  careerStartYear: 2018,
  about: {
    headline: 'h',
    title: 't',
    summary: 's',
    longText: 'l',
    profileImage: '/p.jpg'
  },
  skills: ['a'],
  experience: [],
  projects: [],
  testimonials: []
}

describe('usePortfolioStore fetchPortfolioData', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('deduplicates concurrent in-flight calls so $fetch runs once', async () => {
    let resolveDeferred!: (value: PortfolioData) => void
    const deferred = new Promise<PortfolioData>((resolve) => {
      resolveDeferred = resolve
    })
    const fetchMock = vi.fn(() => deferred)
    vi.stubGlobal('$fetch', fetchMock)

    const { usePortfolioStore } = await import('~/stores/portfolio')
    const store = usePortfolioStore()

    const p1 = store.fetchPortfolioData()
    const p2 = store.fetchPortfolioData()
    expect(fetchMock).toHaveBeenCalledTimes(1)

    resolveDeferred(minimalPayload)
    await Promise.all([p1, p2])

    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
    expect(store.careerStartYear).toBe(2018)
    expect(store.about.headline).toBe('h')
    expect(store.skills).toEqual(['a'])
  })

  it('merges successful $fetch payload and clears error', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue(minimalPayload))
    const { usePortfolioStore } = await import('~/stores/portfolio')
    const store = usePortfolioStore()
    await store.fetchPortfolioData()
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
    expect(store.careerStartYear).toBe(2018)
  })

  it('sets error message and loading false when $fetch rejects', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('$fetch', vi.fn().mockRejectedValue(new Error('network')))
    const { usePortfolioStore } = await import('~/stores/portfolio')
    const store = usePortfolioStore()
    await store.fetchPortfolioData()
    errSpy.mockRestore()
    expect(store.loading).toBe(false)
    expect(store.error).toBe('network')
  })
})
