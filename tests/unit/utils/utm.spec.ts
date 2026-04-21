import { describe, expect, it } from 'vitest'
import { EMPTY_UTM, hasAnyUtm, parseUtmFromSearch, parseUtmFromUrl } from '~/utils/utm'

describe('parseUtmFromSearch', () => {
  it('returns empty utm for empty string', () => {
    expect(parseUtmFromSearch('')).toEqual(EMPTY_UTM)
  })

  it('parses all five keys with and without leading "?"', () => {
    const qs = '?utm_source=linkedin&utm_medium=post&utm_campaign=spring&utm_content=hero&utm_term=portfolio'
    expect(parseUtmFromSearch(qs)).toEqual({
      utm_source: 'linkedin',
      utm_medium: 'post',
      utm_campaign: 'spring',
      utm_content: 'hero',
      utm_term: 'portfolio'
    })
    expect(parseUtmFromSearch(qs.slice(1))).toEqual(parseUtmFromSearch(qs))
  })

  it('trims and nulls empty values', () => {
    const utm = parseUtmFromSearch('?utm_source=   &utm_medium=email')
    expect(utm.utm_source).toBeNull()
    expect(utm.utm_medium).toBe('email')
  })
})

describe('parseUtmFromUrl', () => {
  it('falls back to empty utm on invalid url', () => {
    expect(parseUtmFromUrl('::::')).toEqual(EMPTY_UTM)
  })

  it('reads search from relative URL', () => {
    const utm = parseUtmFromUrl('/?utm_campaign=launch')
    expect(utm.utm_campaign).toBe('launch')
  })
})

describe('hasAnyUtm', () => {
  it('is false when all keys are null', () => {
    expect(hasAnyUtm(EMPTY_UTM)).toBe(false)
  })
  it('is true when any key is set', () => {
    expect(hasAnyUtm({ ...EMPTY_UTM, utm_source: 'x' })).toBe(true)
  })
})
