import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getLenis } from '~/utils/lenis'

gsap.registerPlugin(ScrollTrigger)

export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) return

  if (getLenis()) return

  const lenis = new Lenis({
    wheelMultiplier: 0.76,
    touchMultiplier: 0.84,
    smoothWheel: true,
    lerp: 0.082,
    autoRaf: false,
    anchors: true,
    autoResize: true
  })

  const ticker = (time: number) => {
    lenis.raf(time * 1000)
  }

  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(ticker)
  gsap.ticker.lagSmoothing(0)

  window.__portalLenis = lenis

  requestAnimationFrame(() => {
    ScrollTrigger.refresh()
  })
})

