import { onUnmounted, type Ref } from 'vue'
import gsap from 'gsap'
import type { ScrollTrigger } from 'gsap/ScrollTrigger'

type Cleanable = (gsap.core.Tween | gsap.core.Timeline) | ScrollTrigger

/**
 * Gerencia limpeza centralizada de tweens e ScrollTriggers no unmount.
 */
export function useGsapCleanup() {
  const items: Cleanable[] = []

  const add = (item: Cleanable | Cleanable[]) => {
    if (Array.isArray(item)) items.push(...item)
    else items.push(item)
  }

  const killAll = () => {
    for (const item of items) {
      if ('scrollTrigger' in item && (item as gsap.core.Tween | gsap.core.Timeline).scrollTrigger) {
        ;((item as gsap.core.Tween | gsap.core.Timeline).scrollTrigger as ScrollTrigger)?.kill()
      }
      if ('kill' in item) (item as Cleanable).kill()
    }
    items.length = 0
  }

  onUnmounted(killAll)

  return { add, killAll }
}
