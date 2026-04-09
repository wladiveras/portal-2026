import type Lenis from 'lenis'

declare global {
  interface Window {
    __portalLenis?: Lenis
  }
}

export function getLenis(): Lenis | null {
  if (!import.meta.client) return null
  return window.__portalLenis ?? null
}

