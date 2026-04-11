/**
 * Pré-aquece um vídeo até `canplay` (ou timeout) sem inserir no DOM.
 * Usado no splash para reduzir jank no primeiro scroll do hero.
 */
export function waitForVideoCanPlay(src: string, timeoutMs: number): Promise<void> {
  if (!import.meta.client || !src) {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    const v = document.createElement('video')
    v.preload = 'auto'
    v.muted = true
    v.playsInline = true

    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      v.removeEventListener('canplay', onReady)
      v.removeEventListener('canplaythrough', onReady)
      v.removeEventListener('error', onReady)
      v.src = ''
      v.load()
      resolve()
    }

    const timer = window.setTimeout(finish, timeoutMs)

    const onReady = () => finish()

    v.addEventListener('canplay', onReady, { once: true })
    v.addEventListener('canplaythrough', onReady, { once: true })
    v.addEventListener('error', onReady, { once: true })

    v.src = src
    v.load()
  })
}
