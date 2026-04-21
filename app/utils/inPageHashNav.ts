import { getLenis } from '~/utils/lenis'

function fireHashTrack(targetId: string) {
  if (typeof window === 'undefined') return
  try {
    const { useTracker } = (globalThis as unknown as {
      __wvTracker?: typeof import('~/composables/useTracker')
    }).__wvTracker ?? {}
    if (useTracker) {
      useTracker().trackEvent({ type: 'hash_nav', target: targetId })
      return
    }
  } catch {
    // noop
  }
  // Fallback: direct dynamic import so both client and test envs work.
  void import('~/composables/useTracker')
    .then((m) => m.useTracker().trackEvent({ type: 'hash_nav', target: targetId }))
    .catch(() => {})
}

/**
 * Scroll suave para IDs na mesma página (âncoras #). Ajuda no SPA onde o
 * comportamento nativo de hash nem sempre alinha bem com o layout.
 */
export function navigateToHash(
  href: string,
  options?: { updateHistory?: boolean }
): boolean {
  if (!import.meta.client) return false
  if (!href.startsWith('#') || href.length < 2) return false
  const id = decodeURIComponent(href.slice(1))
  const el = document.getElementById(id)
  if (!el) return false

  const lenis = getLenis()
  if (lenis) {
    const isContactCta = id === 'contact-cta'
    const targetHeight = el.getBoundingClientRect().height
    const centerOffset = -Math.max((window.innerHeight - targetHeight) / 2, 0)

    lenis.scrollTo(el, {
      duration: 1.1,
      offset: isContactCta ? centerOffset : 0
    })
  } else {
    const block: ScrollLogicalPosition = id === 'contact-cta' ? 'center' : 'start'
    el.scrollIntoView({ behavior: 'smooth', block, inline: 'nearest' })
  }

  if (options?.updateHistory !== false && history.replaceState) {
    history.replaceState(null, '', href)
  }
  fireHashTrack(id)
  return true
}

export function onInPageHashClick(e: MouseEvent, href: string | undefined): boolean {
  if (!href) return false
  if (!navigateToHash(href)) return false
  e.preventDefault()
  return true
}
