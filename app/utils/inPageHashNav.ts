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

  const block: ScrollLogicalPosition = id === 'contact-cta' ? 'center' : 'start'
  el.scrollIntoView({ behavior: 'smooth', block, inline: 'nearest' })

  if (options?.updateHistory !== false && history.replaceState) {
    history.replaceState(null, '', href)
  }
  return true
}

export function onInPageHashClick(e: MouseEvent, href: string | undefined): boolean {
  if (!href) return false
  if (!navigateToHash(href)) return false
  e.preventDefault()
  return true
}
