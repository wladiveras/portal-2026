import { onMounted, onUnmounted, ref, watch } from 'vue'
import type { Ref } from 'vue'

type ScrollVideoOptions = {
  start?: number
  end?: number
  smoothing?: number
  externalProgress?: Ref<number | undefined>
}

export const useScrollVideo = (
  videoRef: Ref<HTMLVideoElement | null>,
  options: ScrollVideoOptions = {}
) => {
  const isActive = ref(true)
  const targetTime = ref(0)
  const currentTime = ref(0)
  const progress = ref(0)

  const smoothing = options.smoothing ?? 0.12
  let rafId = 0
  let observer: IntersectionObserver | null = null

  const updateProgress = () => {
    if (options.externalProgress && options.externalProgress.value !== undefined) {
      progress.value = Math.min(Math.max(options.externalProgress.value, 0), 1)
      return
    }
    const doc = document.documentElement
    const maxScroll = doc.scrollHeight - window.innerHeight
    if (maxScroll <= 0) return

    const start = options.start ?? 0
    const end = options.end ?? maxScroll
    const raw = (window.scrollY - start) / (end - start)
    progress.value = Math.min(Math.max(raw, 0), 1)
  }

  const animate = () => {
    const element = videoRef.value
    if (element && Number.isFinite(element.duration) && isActive.value) {
      targetTime.value = progress.value * Math.max(element.duration - 0.08, 0)
      currentTime.value += (targetTime.value - currentTime.value) * smoothing
      element.currentTime = currentTime.value
    }
    rafId = window.requestAnimationFrame(animate)
  }

  onMounted(() => {
    if (!options.externalProgress) {
      window.addEventListener('scroll', updateProgress, { passive: true })
    }
    updateProgress()

    if (options.externalProgress) {
      watch(
        options.externalProgress,
        (value) => {
          if (value === undefined) return
          progress.value = Math.min(Math.max(value, 0), 1)
        },
        { immediate: true }
      )
    }

    observer = new IntersectionObserver(
      (entries) => {
        isActive.value = entries.some((entry) => entry.isIntersecting)
      },
      { threshold: 0.05 }
    )

    if (videoRef.value) observer.observe(videoRef.value)
    rafId = window.requestAnimationFrame(animate)
  })

  onUnmounted(() => {
    if (!options.externalProgress) {
      window.removeEventListener('scroll', updateProgress)
    }
    if (rafId) window.cancelAnimationFrame(rafId)
    observer?.disconnect()
  })
}
