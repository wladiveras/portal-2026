import { describe, expect, it } from 'vitest'
import { greetingForHour } from '~/composables/useLiveClock'

describe('greetingForHour', () => {
  it('returns "bom dia" between 05:00 and 11:59', () => {
    expect(greetingForHour(5)).toBe('bom dia')
    expect(greetingForHour(8)).toBe('bom dia')
    expect(greetingForHour(11)).toBe('bom dia')
  })

  it('returns "boa tarde" between 12:00 and 17:59', () => {
    expect(greetingForHour(12)).toBe('boa tarde')
    expect(greetingForHour(15)).toBe('boa tarde')
    expect(greetingForHour(17)).toBe('boa tarde')
  })

  it('returns "boa noite" between 18:00 and 04:59 (wraps midnight)', () => {
    expect(greetingForHour(18)).toBe('boa noite')
    expect(greetingForHour(23)).toBe('boa noite')
    expect(greetingForHour(0)).toBe('boa noite')
    expect(greetingForHour(4)).toBe('boa noite')
  })
})
