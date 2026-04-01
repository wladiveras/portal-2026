import { onUnmounted, ref, watch, type Ref } from 'vue'

function rafNow(cb: FrameRequestCallback): number {
  if (typeof globalThis.requestAnimationFrame === 'function') {
    return globalThis.requestAnimationFrame(cb)
  }
  return 0
}

function cafSafe(id: number) {
  if (id && typeof globalThis.cancelAnimationFrame === 'function') {
    globalThis.cancelAnimationFrame(id)
  }
}

/**
 * Loop manual com fade no início/fim do clip (sem corte seco).
 * Só corre no cliente (evita SSR sem window).
 */
export function useCinematicLoopVideo(
  videoRef: Ref<HTMLVideoElement | null>,
  options?: { fadeSec?: number; restartDelayMs?: number }
) {
  const fadeSec = options?.fadeSec ?? 0.5
  const restartDelayMs = options?.restartDelayMs ?? 100

  const opacity = ref(0)
  let raf = 0
  let cancelled = false
  let boundEl: HTMLVideoElement | null = null

  const onEnded = () => {
    if (cancelled || !boundEl || !import.meta.client) return
    opacity.value = 0
    globalThis.setTimeout(() => {
      if (cancelled || !boundEl) return
      boundEl.currentTime = 0
      void boundEl.play().catch(() => {})
    }, restartDelayMs)
  }

  const tick = () => {
    if (cancelled || !import.meta.client) return
    const el = boundEl
    if (!el || !el.duration || !Number.isFinite(el.duration)) {
      raf = rafNow(tick)
      return
    }

    const t = el.currentTime
    const d = el.duration
    const fade = Math.min(fadeSec, d / 4)

    if (t < fade) {
      opacity.value = t / fade
    } else if (t > d - fade) {
      opacity.value = Math.max(0, (d - t) / fade)
    } else {
      opacity.value = 1
    }

    raf = rafNow(tick)
  }

  const stop = () => {
    cancelled = true
    cafSafe(raf)
    raf = 0
    if (boundEl) {
      boundEl.removeEventListener('ended', onEnded)
      boundEl = null
    }
  }

  const start = () => {
    if (!import.meta.client) return
    stop()
    const el = videoRef.value
    if (!el) return
    cancelled = false
    boundEl = el
    el.muted = true
    el.playsInline = true
    el.addEventListener('ended', onEnded)
    raf = rafNow(tick)
    void el.play().catch(() => {})
  }

  watch(videoRef, start, { immediate: true })

  onUnmounted(stop)

  return { opacity }
}
