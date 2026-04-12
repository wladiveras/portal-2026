import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getLenis } from '~/utils/lenis'
import { getMotionProfile } from '~/utils/motionProfile'

gsap.registerPlugin(ScrollTrigger)

export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) return

  if (getLenis()) return

  const { lenis: lenisOpts } = getMotionProfile()

  const lenis = new Lenis({
    wheelMultiplier: lenisOpts.wheelMultiplier,
    touchMultiplier: lenisOpts.touchMultiplier,
    smoothWheel: lenisOpts.smoothWheel,
    lerp: lenisOpts.lerp,
    syncTouch: lenisOpts.syncTouch,
    ...(lenisOpts.syncTouch ? { syncTouchLerp: 0.11, touchInertiaExponent: 1.45 } : {}),
    autoRaf: false,
    anchors: true,
    autoResize: true,
    stopInertiaOnNavigate: true
  })

  const ticker = (time: number) => {
    lenis.raf(time * 1000)
  }

  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(ticker)
  gsap.ticker.lagSmoothing(0)

  const root = document.documentElement
  ScrollTrigger.scrollerProxy(root, {
    scrollTop(value) {
      if (arguments.length && typeof value === 'number') {
        lenis.scrollTo(value, { immediate: true })
      }
      return lenis.scroll
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight
      }
    }
  })

  window.__portalLenis = lenis

  requestAnimationFrame(() => {
    lenis.resize()
    ScrollTrigger.refresh()
  })
})

