import { getLenis } from '~/utils/lenis'

export default defineNuxtPlugin(() => {
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual'
  }

  // Force entry point at hero on full refresh.
  if (window.location.hash) {
    window.history.replaceState(
      window.history.state,
      '',
      `${window.location.pathname}${window.location.search}`
    )
  }

  window.requestAnimationFrame(() => {
    const lenis = getLenis()
    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true })
      return
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  })
})
