/**
 * Contrato legado do GET /api/portfolio (Phase 03-03 / PortfolioData):
 * bloco `about` alimenta hero tagline (`about.summary`) e copy longa;
 * falhas aqui quebram SSR/hidratação ou fallback da landing.
 */
import { describe, expect, it } from 'vitest'

import { qryPortfolioPayload } from '~~/server/application/dashboard/portfolio/queries'

describe('qryPortfolioPayload legacy contract', () => {
  it('returns PortfolioData shape with non-empty about fields used by landing', () => {
    const data = qryPortfolioPayload()

    expect(data.careerStartYear).toBeGreaterThan(1900)
    expect(Array.isArray(data.skills)).toBe(true)
    expect(Array.isArray(data.experience)).toBe(true)
    expect(Array.isArray(data.projects)).toBe(true)
    expect(Array.isArray(data.testimonials)).toBe(true)

    const { about } = data
    expect(about.headline?.trim()).toBeTruthy()
    expect(about.title?.trim()).toBeTruthy()
    expect(about.summary?.trim()).toBeTruthy()
    expect(about.longText?.trim()).toBeTruthy()
    expect(about.profileImage?.trim()).toBeTruthy()
  })
})
