/**
 * Tenta reproduzir um elemento <video> com retry automático via `canplay`.
 * Útil para contornar autoplay policies do navegador em mobile/desktop.
 */
export function playVideoEl(v: HTMLVideoElement | null) {
  if (!v) return
  v.muted = true
  void v.play().catch(() => {
    const retry = () => {
      void v.play().catch(() => {})
      v.removeEventListener('canplay', retry)
    }
    v.addEventListener('canplay', retry, { once: true })
  })
}
