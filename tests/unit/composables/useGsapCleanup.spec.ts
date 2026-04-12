import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useGsapCleanup } from '~/composables/useGsapCleanup'

describe('useGsapCleanup', () => {
  it('killAll kills scrollTrigger then tween and clears registry; second killAll is safe', async () => {
    const stKill = vi.fn()
    const tweenKill = vi.fn()
    const tweenLike = {
      scrollTrigger: { kill: stKill },
      kill: tweenKill
    }

    const plainKill = vi.fn()
    const plain = { kill: plainKill }

    const Test = defineComponent({
      setup() {
        const { add, killAll } = useGsapCleanup()
        return { add, killAll }
      },
      template: '<div />'
    })

    const w = mount(Test)
    const vm = w.vm as { add: (x: unknown) => void; killAll: () => void }

    vm.add([tweenLike, plain])
    vm.killAll()

    expect(stKill).toHaveBeenCalledTimes(1)
    expect(tweenKill).toHaveBeenCalledTimes(1)
    expect(plainKill).toHaveBeenCalledTimes(1)

    vm.killAll()
    expect(stKill).toHaveBeenCalledTimes(1)

    w.unmount()
    await nextTick()
  })

  it('onUnmounted runs killAll for pending items', async () => {
    const kill = vi.fn()
    const item = { kill }

    const Test = defineComponent({
      setup() {
        const { add } = useGsapCleanup()
        add(item)
        return {}
      },
      template: '<div />'
    })

    const w = mount(Test)
    w.unmount()
    await nextTick()
    expect(kill).toHaveBeenCalled()
  })
})
