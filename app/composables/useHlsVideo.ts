import type HlsLib from 'hls.js'
import { onUnmounted } from 'vue'
import type { Ref } from 'vue'

export const useHlsVideo = (videoEl: Ref<HTMLVideoElement | null>) => {
  let hls: HlsLib | null = null

  const attach = async (source: string) => {
    const element = videoEl.value
    if (!element) return

    hls?.destroy()
    hls = null

    try {
      const Hls = (await import('hls.js')).default
      if (Hls.isSupported()) {
        hls = new Hls()
        hls.loadSource(source)
        hls.attachMedia(element)
        return
      }
    } catch {
      // Fallback: native HLS support (Safari)
    }

    if (element.canPlayType('application/vnd.apple.mpegurl')) {
      element.src = source
    }
  }

  onUnmounted(() => {
    hls?.destroy()
    hls = null
  })

  return { attach }
}
