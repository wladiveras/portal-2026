import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useReducedMotion } from '~/composables/useReducedMotion'

describe('useReducedMotion', () => {
  const removeSpy = vi.fn()

  beforeEach(() => {
    removeSpy.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('reads matchMedia after mount and updates on change; removes listener on unmount', async () => {
    let matches = false
    let onChange: (() => void) | null = null

    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => {
      expect(query).toBe('(prefers-reduced-motion: reduce)')
      return {
        get matches() {
          return matches
        },
        media: query,
        addEventListener: (_evt: string, cb: EventListener) => {
          onChange = cb as () => void
        },
        removeEventListener: (_evt: string, cb: EventListener) => {
          removeSpy(_evt, cb)
        },
        dispatchEvent: vi.fn(),
        onchange: null
      } as unknown as MediaQueryList
    })

    const Test = defineComponent({
      setup() {
        return useReducedMotion()
      },
      template: '<span data-test="v">{{ prefersReducedMotion }}</span>'
    })

    const w = mount(Test)
    await nextTick()
    expect(w.get('[data-test="v"]').text()).toBe('false')

    matches = true
    onChange?.()
    await nextTick()
    expect(w.get('[data-test="v"]').text()).toBe('true')

    w.unmount()
    expect(removeSpy).toHaveBeenCalled()
  })
})
