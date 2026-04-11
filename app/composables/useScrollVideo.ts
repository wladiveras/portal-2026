import { onMounted, onUnmounted, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { getMotionProfile } from '~/utils/motionProfile'

type ScrollVideoOptions = {
  start?: number
  end?: number
  smoothing?: number
  externalProgress?: Ref<number | undefined>
  /** Sobrescreve perfil (ms); 0 = sem throttle */
  seekMinIntervalMs?: number
  progressEpsilon?: number
  timeSettleEpsilon?: number
}

export const useScrollVideo = (
  videoRef: Ref<HTMLVideoElement | null>,
  options: ScrollVideoOptions = {}
) => {
  const profile = getMotionProfile()
  const smoothing = options.smoothing ?? profile.scrollVideo.smoothing
  const seekMinIntervalMs = options.seekMinIntervalMs ?? profile.scrollVideo.seekMinIntervalMs
  const progressEpsilon = options.progressEpsilon ?? profile.scrollVideo.progressEpsilon
  const timeSettleEpsilon = options.timeSettleEpsilon ?? profile.scrollVideo.timeSettleEpsilon

  const isActive = ref(true)
  const targetTime = ref(0)
  const currentTime = ref(0)
  const progress = ref(0)

  let rafId = 0
  let running = false
  let lastSeekAt = 0
  let lastProgressSample = -1
  let metaWaitFrames = 0
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

  const stopLoop = () => {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
    running = false
  }

  const kick = () => {
    if (!import.meta.client) return
    if (running) return
    running = true
    rafId = requestAnimationFrame(tick)
  }

  const tick = () => {
    rafId = 0
    const element = videoRef.value

    if (!element || !isActive.value) {
      running = false
      return
    }

    if (!Number.isFinite(element.duration) || element.duration <= 0) {
      if (metaWaitFrames < 240) {
        metaWaitFrames += 1
        rafId = requestAnimationFrame(tick)
      } else {
        running = false
      }
      return
    }
    metaWaitFrames = 0

    targetTime.value = progress.value * Math.max(element.duration - 0.08, 0)
    currentTime.value += (targetTime.value - currentTime.value) * smoothing

    const now = performance.now()
    const drift = Math.abs(element.currentTime - currentTime.value)
    const needSeek =
      drift > timeSettleEpsilon ||
      Math.abs(progress.value - lastProgressSample) > progressEpsilon

    if (needSeek) {
      if (seekMinIntervalMs <= 0 || now - lastSeekAt >= seekMinIntervalMs) {
        element.currentTime = currentTime.value
        lastSeekAt = now
      }
    }

    lastProgressSample = progress.value

    const settled =
      Math.abs(targetTime.value - currentTime.value) < timeSettleEpsilon &&
      Math.abs(element.currentTime - currentTime.value) < timeSettleEpsilon * 1.5

    if (!settled) {
      rafId = requestAnimationFrame(tick)
    } else {
      running = false
    }
  }

  const onWindowScroll = () => {
    updateProgress()
    kick()
  }

  onMounted(() => {
    if (!options.externalProgress) {
      window.addEventListener('scroll', onWindowScroll, { passive: true })
    }
    updateProgress()

    if (options.externalProgress) {
      watch(
        options.externalProgress,
        (value) => {
          if (value === undefined) return
          progress.value = Math.min(Math.max(value, 0), 1)
          kick()
        },
        { immediate: true }
      )
    }

    observer = new IntersectionObserver(
      (entries) => {
        isActive.value = entries.some((entry) => entry.isIntersecting)
        if (isActive.value) kick()
        else stopLoop()
      },
      { threshold: 0.05 }
    )

    if (videoRef.value) observer.observe(videoRef.value)
    kick()
  })

  onUnmounted(() => {
    if (!options.externalProgress) {
      window.removeEventListener('scroll', onWindowScroll)
    }
    stopLoop()
    observer?.disconnect()
  })
}
