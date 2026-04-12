import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getLenis } from '~/utils/lenis'
import { navigateToHash } from '~/utils/inPageHashNav'

gsap.registerPlugin(ScrollTrigger)

export default defineNuxtPlugin(() => {
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual'
  }

  window.requestAnimationFrame(() => {
    const lenis = getLenis()
    const scrollToTop = () => {
      if (lenis) {
        lenis.scrollTo(0, { immediate: true, force: true })
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      }
    }

    // Se há hash na URL, tenta scroll até a seção; senão, volta ao topo.
    if (window.location.hash) {
      const navigated = navigateToHash(window.location.hash)
      if (!navigated) scrollToTop()
    } else {
      scrollToTop()
    }

    requestAnimationFrame(() => {
      lenis?.resize()
      ScrollTrigger.refresh()
    })
  })
})
