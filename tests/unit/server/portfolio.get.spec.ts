/**
 * @vitest-environment node
 * Invokes the Nitro handler directly — avoids full Nuxt `setup()` build (MagicString / vite-vue issues in test runner).
 */
import { createEvent } from 'h3'
import { describe, expect, it } from 'vitest'
import handler from '../../../server/api/portfolio.get'

describe('server/api/portfolio.get', () => {
  it('returns JSON with PortfolioData keys', async () => {
    const data = (await handler(createEvent())) as Record<string, unknown>

    expect(data.careerStartYear).toBeDefined()
    expect(Array.isArray(data.skills)).toBe(true)
    expect(Array.isArray(data.experience)).toBe(true)
    expect(Array.isArray(data.projects)).toBe(true)
    expect(Array.isArray(data.testimonials)).toBe(true)

    const about = data.about as Record<string, unknown>
    expect(about).toBeTruthy()
    expect(about.headline).toBeDefined()
    expect(about.title).toBeDefined()
    expect(about.summary).toBeDefined()
    expect(about.longText).toBeDefined()
    expect(about.profileImage).toBeDefined()
  })
})
