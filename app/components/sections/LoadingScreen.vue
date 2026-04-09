<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { landing } from '~/data/landing'
import { useReducedMotion } from '~/composables/useReducedMotion'

const emit = defineEmits<{ complete: [] }>()

const words = [...landing.loading.words]
const activeWord = ref(words[0]!)
const count = ref(0)
const countPulse = ref(false)
const { prefersReducedMotion } = useReducedMotion()

const videoSrc = landing.loading.videoSrc

/** Splash um pouco mais longo para acompanhar leitura das palavras */
const DURATION_S = 2.65
const WORD_MS = 640
const OUT_MS = 320

let wordInterval = 0
let pulseTimeout = 0
let completeTimer = 0
let rafId = 0
let gsapTween: gsap.core.Tween | null = null

const paddedCount = computed(() => String(Math.min(100, Math.max(0, count.value))).padStart(3, '0'))

const videoRef = ref<HTMLVideoElement | null>(null)

function tryPlayLoadingVideo() {
  if (!import.meta.client || prefersReducedMotion.value) return
  const v = videoRef.value
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

function triggerCountPulse() {
  countPulse.value = true
  clearTimeout(pulseTimeout)
  pulseTimeout = window.setTimeout(() => {
    countPulse.value = false
  }, 220)
}

let lastRounded = 0

onMounted(() => {
  let index = 0
  wordInterval = window.setInterval(() => {
    index = (index + 1) % words.length
    activeWord.value = words[index]!
  }, WORD_MS)

  if (prefersReducedMotion.value) {
    const start = performance.now()
    const tick = (time: number) => {
      const t = Math.min((time - start) / (DURATION_S * 1000), 1)
      const next = Math.round(t * 100)
      if (next !== lastRounded) {
        lastRounded = next
        count.value = next
        triggerCountPulse()
      }
      if (t < 1) {
        rafId = requestAnimationFrame(tick)
      } else {
        count.value = 100
        completeTimer = window.setTimeout(() => emit('complete'), OUT_MS)
      }
    }
    rafId = requestAnimationFrame(tick)
    return
  }

  const proxy = { n: 0 }
  gsapTween = gsap.to(proxy, {
    n: 100,
    duration: DURATION_S,
    ease: 'power2.inOut',
    onUpdate: () => {
      const next = Math.round(proxy.n)
      if (next !== lastRounded) {
        lastRounded = next
        triggerCountPulse()
      }
      count.value = next
    },
    onComplete: () => {
      count.value = 100
      completeTimer = window.setTimeout(() => emit('complete'), OUT_MS)
    }
  })

  void nextTick(() => tryPlayLoadingVideo())
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  clearInterval(wordInterval)
  clearTimeout(pulseTimeout)
  clearTimeout(completeTimer)
  gsapTween?.kill()
  gsapTween = null
})
</script>

<template>
  <div
    class="fixed inset-0 z-[9999] overflow-hidden bg-bg text-text-primary"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <!-- Vídeo no rodapé: contain = diamante inteiro; branco só no topo para não apagar a ponta -->
    <div
      v-if="!prefersReducedMotion"
      class="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[min(62vh,640px)]"
      aria-hidden="true"
    >
      <video
        ref="videoRef"
        class="absolute inset-x-0 bottom-0 box-border h-full w-full object-contain object-bottom opacity-[0.9] [transform:translateZ(0)]"
        :src="videoSrc"
        muted
        autoplay
        loop
        playsinline
        webkit-playsinline
        preload="auto"
        disablepictureinpicture
        tabindex="-1"
        aria-hidden="true"
        @loadeddata="tryPlayLoadingVideo"
      />
      <!-- Branco concentrado na metade superior da faixa — base do diamante quase sem máscara -->
      <div
        class="absolute inset-0"
        style="
          background: linear-gradient(
            to top,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0) 28%,
            rgba(255, 255, 255, 0.12) 48%,
            rgba(255, 255, 255, 0.55) 72%,
            rgba(255, 255, 255, 0.92) 90%,
            hsl(var(--bg)) 100%
          );
        "
      />
      <!-- Tom de marca só no topo (não cobre a pavilhão) -->
      <div
        class="absolute inset-0 mix-blend-soft-light opacity-[0.08]"
        style="
          background: linear-gradient(
            to top,
            transparent 0%,
            transparent 55%,
            rgba(78, 133, 191, 0.28) 100%
          );
        "
      />
    </div>

    <div
      v-else
      class="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-40 bg-gradient-to-t from-slate-100 to-bg"
      aria-hidden="true"
    />

    <div
      class="relative z-10 flex min-h-[100dvh] flex-col px-6 pb-8 pt-[max(2rem,env(safe-area-inset-top,0px))] md:px-12 md:pb-12 md:pt-[max(2.5rem,env(safe-area-inset-top,0px))]"
    >
      <p class="text-[10px] uppercase tracking-[0.38em] text-muted md:text-xs">
        {{ landing.loading.eyebrow }}
      </p>

      <div class="flex flex-1 flex-col items-center justify-center pb-[min(26vh,220px)] text-center">
        <Transition name="loadword" mode="out-in">
          <h2
            :key="activeWord"
            class="max-w-[min(100%,20ch)] font-display text-[clamp(1.85rem,6vw,3.75rem)] font-normal italic leading-[1.08] tracking-tight text-text-primary/88"
          >
            {{ activeWord }}
          </h2>
        </Transition>
      </div>

      <div class="mt-auto space-y-4">
        <div class="flex items-end justify-end">
          <div
            class="loadscreen-pct font-display text-5xl tabular-nums tracking-tight text-text-primary md:text-7xl lg:text-8xl"
            :class="{ 'loadscreen-pct--pulse': countPulse }"
            role="progressbar"
            :aria-valuenow="count"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Progresso de carregamento"
          >
            {{ paddedCount }}
          </div>
        </div>
        <div class="h-[2px] overflow-hidden rounded-full bg-stroke/60">
          <div
            class="accent-gradient h-full origin-left rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-[transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] [will-change:transform]"
            :style="{ transform: `scaleX(${count / 100})` }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loadword-enter-active,
.loadword-leave-active {
  transition:
    opacity 0.36s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.36s cubic-bezier(0.22, 1, 0.36, 1);
}

.loadword-enter-from {
  opacity: 0;
  transform: translate3d(0, 14px, 0) scale(0.985);
}

.loadword-leave-to {
  opacity: 0;
  transform: translate3d(0, -12px, 0) scale(0.985);
}

.loadscreen-pct {
  transition:
    transform 0.32s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.28s ease;
}

.loadscreen-pct--pulse {
  transform: translate3d(0, -2px, 0) scale(1.02);
  opacity: 0.92;
}

@media (prefers-reduced-motion: reduce) {
  .loadword-enter-active,
  .loadword-leave-active {
    transition-duration: 0.01ms;
  }

  .loadscreen-pct,
  .loadscreen-pct--pulse {
    transition: none;
    transform: none;
  }
}
</style>
