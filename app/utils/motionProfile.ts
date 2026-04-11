/**
 * Perfil único de movimento / performance (desktop vs mobile).
 * Usado por Lenis, preload do vídeo do hero e useScrollVideo.
 */
export type MotionProfile = {
  isCoarsePointer: boolean
  isMobileViewport: boolean
  shouldUseHeavySmoothScroll: boolean
  heroVideoPreload: 'auto' | 'metadata'
  lenis: {
    lerp: number
    wheelMultiplier: number
    touchMultiplier: number
    smoothWheel: boolean
    /** Touch mais próximo do nativo (Lenis 1.x) */
    syncTouch: boolean
  }
  scrollVideo: {
    smoothing: number
    seekMinIntervalMs: number
    progressEpsilon: number
    timeSettleEpsilon: number
  }
}

const MOBILE_MAX_WIDTH = 768

function profileFromWindow(w: Window): MotionProfile {
  const coarse = w.matchMedia('(pointer: coarse)').matches
  const mobileW = w.innerWidth < MOBILE_MAX_WIDTH
  const isMobile = coarse || mobileW

  if (isMobile) {
    return {
      isCoarsePointer: coarse,
      isMobileViewport: mobileW,
      shouldUseHeavySmoothScroll: false,
      heroVideoPreload: 'auto',
      lenis: {
        lerp: 0.14,
        wheelMultiplier: 0.76,
        touchMultiplier: 0.52,
        smoothWheel: true,
        syncTouch: true
      },
      scrollVideo: {
        smoothing: 0.22,
        seekMinIntervalMs: 48,
        progressEpsilon: 0.0025,
        timeSettleEpsilon: 0.04
      }
    }
  }

  return {
    isCoarsePointer: false,
    isMobileViewport: false,
    shouldUseHeavySmoothScroll: true,
    heroVideoPreload: 'metadata',
    lenis: {
      lerp: 0.082,
      wheelMultiplier: 0.76,
      touchMultiplier: 0.84,
      smoothWheel: true,
      syncTouch: false
    },
    scrollVideo: {
      smoothing: 0.14,
      seekMinIntervalMs: 0,
      progressEpsilon: 0.0006,
      timeSettleEpsilon: 0.018
    }
  }
}

const ssrFallback: MotionProfile = {
  isCoarsePointer: false,
  isMobileViewport: false,
  shouldUseHeavySmoothScroll: true,
  heroVideoPreload: 'metadata',
  lenis: {
    lerp: 0.082,
    wheelMultiplier: 0.76,
    touchMultiplier: 0.84,
    smoothWheel: true,
    syncTouch: false
  },
  scrollVideo: {
    smoothing: 0.14,
    seekMinIntervalMs: 0,
    progressEpsilon: 0.0006,
    timeSettleEpsilon: 0.018
  }
}

export function getMotionProfile(): MotionProfile {
  if (!import.meta.client || typeof window === 'undefined') {
    return ssrFallback
  }
  return profileFromWindow(window)
}
