import Hls from 'hls.js'
import { onUnmounted } from 'vue'
import type { Ref } from 'vue'

export const useHlsVideo = (videoEl: Ref<HTMLVideoElement | null>) => {
  let hls: Hls | null = null

  const attach = (source: string) => {
    const element = videoEl.value
    if (!element) return

    if (Hls.isSupported()) {
      hls = new Hls()
      hls.loadSource(source)
      hls.attachMedia(element)
      return
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
