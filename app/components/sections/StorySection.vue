<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { landing } from '~/data/landing'
import { useReducedMotion } from '~/composables/useReducedMotion'
import { playVideoEl } from '~/utils/playVideoEl'

/** Mais longos = sumiço/reaparição do loop mais suave */
const LOOP_FADE_OUT_S = 0.95
const LOOP_FADE_IN_S = 0.95
const TIMELINE_VIDEO_PLAYBACK_RATE = 0.68
const TIMELINE_PIN_FADE_MS = 1100

const store = usePortfolioStore()
const rootRef = ref<HTMLElement | null>(null)
const introBlockRef = ref<HTMLElement | null>(null)
const introTextColRef = ref<HTMLElement | null>(null)
const diamondRailRef = ref<HTMLElement | null>(null)
const diamondFloatWrapRef = ref<HTMLElement | null>(null)
const diamondVideoRef = ref<HTMLVideoElement | null>(null)
/** Vídeo só no mobile: fundo atrás da constelação (coluna direita fica `md+` apenas). */
const mobileStackDiamondVideoRef = ref<HTMLVideoElement | null>(null)
const parallaxPinned = ref<HTMLElement | null>(null)
const scrollProgress = ref(0)
const hoveredLine = ref<number | null>(null)
const expandedLine = ref<number | null>(null)
const mdUp = ref(false)
const tweens: gsap.core.Tween[] = []
let stParallax: ScrollTrigger | null = null
let diamondIntroTween: gsap.core.Tween | null = null
let mqCleanup: (() => void) | null = null
let introColResizeRo: ResizeObserver | null = null

const { prefersReducedMotion } = useReducedMotion()
const timelineVideoRef = ref<HTMLVideoElement | null>(null)
const timelinePinActive = ref(false)
const timelineLoopBlend = ref(1)

function applyTimelineVideoRate() {
  const v = timelineVideoRef.value
  if (v) v.playbackRate = TIMELINE_VIDEO_PLAYBACK_RATE
}

/** Atualiza opacidade do vídeo no loop; se duration ainda não existe, mantém visível (evita blend preso em 0). */
function onTimelineVideoTime() {
  if (prefersReducedMotion.value) return
  const v = timelineVideoRef.value
  if (!v || !timelinePinActive.value) return
  const d = v.duration
  if (!Number.isFinite(d) || d <= 0) {
    timelineLoopBlend.value = 1
    return
  }
  const t = v.currentTime
  const fadeIn = Math.min(LOOP_FADE_IN_S, Math.max(d * 0.12, 0.12))
  const fadeOut = Math.min(LOOP_FADE_OUT_S, Math.max(d * 0.12, 0.12))
  const tOutStart = Math.max(d - fadeOut, fadeIn)
  if (t < fadeIn) {
    timelineLoopBlend.value = Math.min(1, t / fadeIn)
  } else if (t > tOutStart && fadeOut > 0) {
    timelineLoopBlend.value = Math.max(0, (d - t) / fadeOut)
  } else {
    timelineLoopBlend.value = 1
  }
}

watch(timelinePinActive, (active) => {
  const v = timelineVideoRef.value
  if (!v || prefersReducedMotion.value) return
  if (active) {
    v.currentTime = 0
    applyTimelineVideoRate()
    void v.play().catch(() => {})
    nextTick(() => onTimelineVideoTime())
  } else {
    v.pause()
  }
})

const constellationSkills = computed(() => {
  if (store.skills.length) return store.skills.slice(0, 22)
  return landing.story.stackIntroFallback
    .split(' · ')
    .map((s) => s.trim())
    .filter(Boolean)
})

const exp = computed(() => store.experience)

const dominantSlideIndex = computed(() => {
  const n = exp.value.length
  if (!n) return 0
  const p = scrollProgress.value * n
  return Math.min(Math.max(Math.floor(p), 0), n - 1)
})

const activeIndex = computed(() => dominantSlideIndex.value)

const currentJob = computed(() => {
  const jobs = exp.value
  const i = dominantSlideIndex.value
  if (!jobs.length || i < 0 || i >= jobs.length) return null
  return { job: jobs[i]!, index: i }
})

watch(activeIndex, () => {
  hoveredLine.value = null
  expandedLine.value = null
})

watch(mdUp, (up) => {
  if (up) expandedLine.value = null
})

function onChipClick(k: number) {
  toggleChipExpand(k)
}

/** Coluna editorial alternada (estilo “fio” / conversa), sem órbita que compete com o parallax. */
function chipRowClass(k: number, total: number) {
  if (!mdUp.value) return ''
  if (total <= 1) return 'md:mx-auto md:max-w-2xl'
  return k % 2 === 0
    ? 'md:ml-0 md:mr-[clamp(0.5rem,8vw,4.5rem)] md:max-w-[min(32rem,88vw)] md:self-end'
    : 'md:mr-0 md:ml-[clamp(0.5rem,8vw,4.5rem)] md:max-w-[min(32rem,88vw)] md:self-start'
}

function onChipEnter(_e: MouseEvent, k: number) {
  hoveredLine.value = k
}

function onChipLeave() {
  hoveredLine.value = null
}

function toggleChipExpand(k: number) {
  expandedLine.value = expandedLine.value === k ? null : k
}

function isChipActive(k: number) {
  return hoveredLine.value === k || expandedLine.value === k
}

/** Posição vertical dos nós no rail (%) — reparte entre topo e área acima dos dots inferiores. */
function timelineDotTop(ti: number, total: number) {
  if (total <= 1) return '46%'
  const start = 13
  const span = 68
  return `${start + (ti / (total - 1)) * span}%`
}

function tryPlayDiamondVideo() {
  if (!import.meta.client || prefersReducedMotion.value) return
  playVideoEl(diamondVideoRef.value)
  playVideoEl(mobileStackDiamondVideoRef.value)
}

/** Desktop: diamante desce/sobe na coluna direita, sincronizado com o scroll no bloco intro. */
function setupDiamondIntroScroll() {
  diamondIntroTween?.scrollTrigger?.kill()
  diamondIntroTween?.kill()
  diamondIntroTween = null

  if (!import.meta.client || prefersReducedMotion.value || !mdUp.value) {
    nextTick(() => {
      if (diamondFloatWrapRef.value) gsap.set(diamondFloatWrapRef.value, { clearProps: 'transform' })
    })
    return
  }

  nextTick(() => {
    const intro = introBlockRef.value
    const textCol = introTextColRef.value
    const floater = diamondFloatWrapRef.value
    if (!intro || !textCol || !floater) return

    gsap.killTweensOf(floater)
    gsap.set(floater, { y: 0 })

    /** Percurso vertical ampliado; scrub longo para acompanhar o scroll. */
    const travel = () => {
      const base = Math.max(0, textCol.offsetHeight - floater.offsetHeight)
      return base * 1.58
    }

    diamondIntroTween = gsap.fromTo(
      floater,
      { y: 0 },
      {
        y: () => travel(),
        ease: 'none',
        scrollTrigger: {
          trigger: intro,
          start: 'top bottom',
          end: () =>
            `+=${(intro.offsetHeight + window.innerHeight) * 1.48}`,
          scrub: 0.55,
          invalidateOnRefresh: true
        }
      }
    )
    ScrollTrigger.refresh()
  })
}

function bindIntroMotion() {
  tweens.forEach((tw) => {
    tw.scrollTrigger?.kill()
    tw.kill()
  })
  tweens.length = 0
  if (!rootRef.value) return

  const introBlocks = rootRef.value.querySelectorAll<HTMLElement>('[data-story-reveal]')
  introBlocks.forEach((el, i) => {
    const tw = gsap.fromTo(
      el,
      { opacity: 0, y: 36 },
      {
        opacity: 1,
        y: 0,
        duration: 0.95,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 86%',
          toggleActions: 'play none none reverse'
        },
        delay: i * 0.06
      }
    )
    tweens.push(tw)
  })
}

function setupParallaxST() {
  stParallax?.kill()
  stParallax = null
  nextTick(() => {
    if (!import.meta.client || !parallaxPinned.value || !exp.value.length) return
    const n = exp.value.length
    const vh = () => window.innerHeight
    stParallax = ScrollTrigger.create({
      trigger: parallaxPinned.value,
      start: 'top top',
      end: () => `+=${vh() * n}`,
      pin: true,
      pinSpacing: true,
      scrub: 0.5,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        scrollProgress.value = self.progress
        timelinePinActive.value = self.isActive
      },
      onToggle: (self) => {
        timelinePinActive.value = self.isActive
      }
    })
  })
}

function bindIntroColResizeObserver() {
  introColResizeRo?.disconnect()
  introColResizeRo = null
  if (!import.meta.client || typeof ResizeObserver === 'undefined') return
  const col = introTextColRef.value
  const intro = introBlockRef.value
  if (!col || !intro) return
  let raf = 0
  const schedule = () => {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => {
      ScrollTrigger.refresh()
    })
  }
  introColResizeRo = new ResizeObserver(schedule)
  introColResizeRo.observe(col)
  introColResizeRo.observe(intro)
}

onMounted(() => {
  if (import.meta.client) {
    const mqMd = window.matchMedia('(min-width: 768px)')
    const sync = () => {
      mdUp.value = mqMd.matches
    }
    sync()
    mqMd.addEventListener('change', sync)
    mqCleanup = () => {
      mqMd.removeEventListener('change', sync)
    }
  }
  nextTick(() => {
    bindIntroMotion()
    setupParallaxST()
    tryPlayDiamondVideo()
    setupDiamondIntroScroll()
    bindIntroColResizeObserver()
  })
})

watch(
  () => exp.value.length,
  () => {
    nextTick(() => {
      bindIntroMotion()
      setupParallaxST()
      setupDiamondIntroScroll()
      bindIntroColResizeObserver()
      ScrollTrigger.refresh()
    })
  }
)

watch(
  () => store.skills.length,
  () => {
    nextTick(() => {
      setupDiamondIntroScroll()
      bindIntroColResizeObserver()
      ScrollTrigger.refresh()
    })
  }
)

watch(mdUp, () => {
  nextTick(() => {
    setupDiamondIntroScroll()
    bindIntroColResizeObserver()
    tryPlayDiamondVideo()
    ScrollTrigger.refresh()
  })
})

watch(prefersReducedMotion, () => {
  nextTick(() => {
    setupDiamondIntroScroll()
    tryPlayDiamondVideo()
    ScrollTrigger.refresh()
  })
})

onUnmounted(() => {
  introColResizeRo?.disconnect()
  introColResizeRo = null
  mqCleanup?.()
  mqCleanup = null
  stParallax?.kill()
  stParallax = null
  diamondIntroTween?.scrollTrigger?.kill()
  diamondIntroTween?.kill()
  diamondIntroTween = null
  tweens.forEach((tw) => {
    tw.scrollTrigger?.kill()
    tw.kill()
  })
})
</script>

<template>
  <section
    :id="landing.story.sectionId"
    ref="rootRef"
    class="relative scroll-mt-24 overflow-x-clip overflow-y-visible bg-white pb-16 md:pb-24"
  >
    <!-- Intro: desktop = texto + coluna direita com diamante a mover com scroll; mobile = texto e vídeo estático -->
    <div
      ref="introBlockRef"
      class="relative isolate z-[1] overflow-x-clip overflow-y-visible py-16 md:overflow-visible md:py-24"
    >
      <div
        class="pointer-events-none absolute inset-x-0 top-0 z-[4] h-32 bg-gradient-to-b from-white via-white/75 to-transparent md:h-40"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute inset-y-0 left-0 z-[4] w-[min(100%,46rem)] md:max-w-[52rem]"
        style="
          background: linear-gradient(
            to right,
            #fff 0%,
            rgba(255, 255, 255, 0.97) 18%,
            rgba(255, 255, 255, 0.88) 36%,
            rgba(255, 255, 255, 0.5) 58%,
            rgba(255, 255, 255, 0.12) 78%,
            transparent 100%
          );
        "
        aria-hidden="true"
      />

      <div class="relative isolate z-10 mx-auto max-w-[1280px] px-6 md:px-10 lg:px-14">
        <div
          class="grid grid-cols-1 items-stretch gap-0 md:grid-cols-[minmax(0,1fr)_clamp(17.5rem,38vw,32rem)] md:gap-x-8 lg:gap-x-12 xl:gap-x-14"
        >
          <div
            ref="introTextColRef"
            data-story-reveal
            class="relative z-40 max-w-xl lg:max-w-2xl"
          >
            <p class="mb-3 text-xs uppercase tracking-[0.3em] text-muted">
              {{ landing.story.introEyebrow }}
            </p>
            <h2 class="text-3xl text-text-primary md:text-4xl">
              {{ landing.story.introTitlePlain }}
              <span class="font-display italic text-muted">{{ landing.story.introTitleItalic }}</span>
            </h2>
            <div class="mt-4 space-y-3.5 text-muted">
              <p
                v-for="(para, i) in landing.story.introParagraphs"
                :key="i"
                class="leading-relaxed first:mt-0"
              >
                {{ para }}
              </p>
            </div>
            <p class="mb-2 mt-8 text-xs uppercase tracking-[0.3em] text-muted">
              {{ landing.story.introWorkEyebrow }}
            </p>
            <ul
              class="list-disc space-y-2 pl-5 text-sm leading-relaxed text-text-primary/80 marker:text-accent-soft/80 md:text-[15px]"
            >
              <li v-for="(item, i) in landing.story.introWorkBullets" :key="i">
                {{ item }}
              </li>
            </ul>

            <!-- Mobile: diamante atrás das stacks (painel transparente nas stacks até md) -->
            <div class="relative mt-10 min-h-[min(52vw,280px)] md:min-h-0">
              <div
                v-if="!prefersReducedMotion"
                class="pointer-events-none absolute inset-x-0 bottom-[-8%] top-[-18%] z-[1] md:hidden"
                aria-hidden="true"
              >
                <video
                  ref="mobileStackDiamondVideoRef"
                  class="absolute left-1/2 top-[50%] h-[min(480px,120vw)] w-[min(820px,260vw)] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.55] will-change-transform"
                  :src="landing.story.introVideoSrc"
                  autoplay
                  loop
                  muted
                  playsinline
                  webkit-playsinline
                  preload="auto"
                  disablepictureinpicture
                  tabindex="-1"
                  @loadeddata="tryPlayDiamondVideo"
                />
                <!-- Leve vinheta: texto/pills legíveis sem esconder o diamante -->
                <div
                  class="absolute inset-0 bg-gradient-to-t from-white/90 via-white/25 to-white/60"
                />
                <div
                  class="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/35 to-transparent"
                />
              </div>
              <UiStackConstellation
                over-backdrop
                :skills="constellationSkills"
                class="relative z-[2]"
              />
            </div>
          </div>

          <div
            ref="diamondRailRef"
            class="relative z-[5] hidden min-h-0 md:mt-0 md:flex md:h-full md:min-h-0 md:items-stretch md:justify-end md:overflow-visible md:pl-0"
          >
            <!-- Garante altura da célula = coluna do texto (filho absolute não estica o pai) -->
            <div
              class="pointer-events-none hidden w-px shrink-0 md:block md:h-full md:min-h-[1px]"
              aria-hidden="true"
            />
            <div
              ref="diamondFloatWrapRef"
              class="pointer-events-none relative z-[5] flex w-full justify-center will-change-transform [transform:translateZ(0)] md:absolute md:inset-x-0 md:top-0 md:w-full md:justify-center"
            >
              <div class="relative z-[5] shrink-0">
                <div
                  class="pointer-events-none absolute -left-4 top-[8%] bottom-[8%] z-[5] w-28 bg-gradient-to-r from-white via-white/85 to-transparent blur-[0.5px] md:-left-6 md:w-40 md:from-white md:via-white/70 lg:-left-10 lg:w-48"
                  aria-hidden="true"
                />
                <video
                  v-if="!prefersReducedMotion"
                  ref="diamondVideoRef"
                  class="relative z-[5] h-auto w-[min(88vw,420px)] object-contain object-center [transform:translateZ(0)] scale-[1.12] sm:w-[min(86vw,460px)] sm:scale-[1.15] md:h-[min(96vh,920px)] md:w-auto md:max-w-[min(130vw,960px)] md:scale-[1.22] lg:scale-[1.28]"
                  :src="landing.story.introVideoSrc"
                  autoplay
                  loop
                  muted
                  playsinline
                  webkit-playsinline
                  preload="auto"
                  disablepictureinpicture
                  tabindex="-1"
                  aria-label="Vídeo em loop na seção Como penso"
                  @loadeddata="tryPlayDiamondVideo"
                />
                <div
                  v-else
                  class="flex aspect-[3/4] w-[min(88vw,320px)] flex-col items-center justify-center rounded-2xl border border-stroke/20 bg-gradient-to-b from-[#eef4fa]/90 to-white"
                >
                  <Icon icon="lucide:clapperboard" class="h-10 w-10 text-accent/50" />
                  <p class="mt-2 text-[10px] font-medium uppercase tracking-[0.26em] text-muted">
                    Vídeo pausado
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Timeline + pin: fundo opaco para não misturar com o vídeo da intro -->
    <div
      :id="landing.story.timelineAnchorId"
      class="relative z-[20] mt-14 w-full scroll-mt-24 border-t border-stroke/40 bg-white pt-12 md:mt-16 md:pt-16"
    >
      <div class="mx-auto w-full max-w-[1280px] px-6 md:px-10 lg:px-14">
        <div class="mx-auto mb-8 max-w-3xl text-center md:mb-10" data-story-reveal>
          <p class="mb-2 text-[10px] uppercase tracking-[0.32em] text-muted md:text-xs">
            {{ landing.story.timelineEyebrow }}
          </p>
          <h3
            class="font-display text-[clamp(1.75rem,4vw,2.75rem)] italic leading-tight tracking-tight text-[#141a22]"
          >
            {{ landing.story.timelineTitle }}
          </h3>
          <div class="mt-6 flex flex-col items-center gap-0.5 md:mt-7">
            <span
              v-if="landing.story.yearsPrefix"
              class="text-[10px] font-medium uppercase tracking-[0.28em] text-muted/90 md:text-[11px]"
            >
              {{ landing.story.yearsPrefix }}
            </span>
            <p
              class="font-display text-[clamp(3rem,8vw,4.75rem)] italic leading-none tabular-nums tracking-tight text-[#141a22]"
            >
              {{ store.yearsOfExperience }}+
            </p>
            <span class="mt-1.5 text-sm text-muted md:text-[15px] md:font-normal">
              {{ landing.story.yearsLabel }}
            </span>
          </div>
          <p
            class="mx-auto mt-5 max-w-md text-xs leading-relaxed text-muted/90 md:mt-6 md:max-w-lg md:text-[13px]"
          >
            {{ landing.story.parallaxScrollHint }}
          </p>
        </div>
      </div>

      <p
        v-if="!exp.length && store.loading"
        class="mx-auto max-w-[1280px] px-6 py-8 text-center text-sm text-muted md:px-10 lg:px-14"
      >
        {{ landing.story.timelineLoading }}
      </p>
      <p
        v-else-if="!exp.length"
        class="mx-auto max-w-[1280px] px-6 py-8 text-center text-sm text-muted md:px-10 lg:px-14"
      >
        {{ landing.story.timelineEmpty }}
      </p>

      <!-- Pin: full viewport width — padding só no conteúdo, não no vídeo (inset-0 respeita padding do pai) -->
      <div
        v-else
        ref="parallaxPinned"
        class="relative flex h-[100dvh] min-h-0 w-full min-w-0 flex-col overflow-hidden pb-2 pt-3 md:pb-3 md:pt-4"
      >
          <!-- Vídeo de fundo: loop com fade nas junções; entra/sai suave com o pin -->
          <div
            v-if="!prefersReducedMotion"
            class="pointer-events-none absolute inset-0 z-0 overflow-hidden transition-opacity ease-[cubic-bezier(0.22,1,0.36,1)]"
            :class="timelinePinActive ? 'opacity-100' : 'opacity-0'"
            :style="{ transitionDuration: `${TIMELINE_PIN_FADE_MS}ms`, transitionProperty: 'opacity' }"
            aria-hidden="true"
          >
            <video
              ref="timelineVideoRef"
              :src="landing.story.timelineVideoSrc"
              class="pointer-events-none absolute left-1/2 top-1/2 h-full w-full min-h-full min-w-full max-w-none object-cover object-center"
              :style="{
                opacity: timelineLoopBlend,
                transform: 'translate(-50%, -50%) scale(1.2)'
              }"
              muted
              playsinline
              loop
              preload="metadata"
              disablepictureinpicture
              @timeupdate="onTimelineVideoTime"
              @loadedmetadata="applyTimelineVideoRate(); onTimelineVideoTime()"
              @canplay="onTimelineVideoTime"
            />
            <div
              class="absolute inset-0 bg-gradient-to-b from-white/45 via-white/30 to-surface/90"
            />
          </div>

          <!-- Camadas com velocidades diferentes (parallax tipo CodePen, tema claro) -->
          <div
            class="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
            aria-hidden="true"
          >
            <div
              class="absolute left-1/2 top-[42%] h-[min(130vw,780px)] w-[min(130vw,780px)] rounded-full bg-[#89aacc]/[0.11] blur-[100px]"
              :style="{
                transform: `translate(-50%, -50%) translateY(${scrollProgress * 11}vh) scale(${1.02 + scrollProgress * 0.035})`
              }"
            />
            <div
              class="absolute left-[6%] top-[22%] h-[min(50vw,300px)] w-[min(50vw,300px)] rounded-full bg-[#4e85bf]/[0.09] blur-[72px]"
              :style="{
                transform: `translateY(${scrollProgress * 18}vh) scale(${1 + scrollProgress * 0.02})`
              }"
            />
            <div
              class="absolute bottom-[14%] right-[4%] h-[min(44vw,260px)] w-[min(44vw,260px)] rounded-full bg-[#b8cfe8]/[0.12] blur-[64px]"
              :style="{
                transform: `translateY(${scrollProgress * -9}vh)`
              }"
            />
            <div
              class="absolute left-[22%] bottom-[28%] h-[min(35vw,200px)] w-[min(35vw,200px)] rounded-full bg-white/80 blur-[48px]"
              :style="{
                transform: `translateY(${scrollProgress * 22}vh) translateX(${scrollProgress * 3}vw)`
              }"
            />
          </div>

          <!-- Timeline móvel: progresso contínuo + capítulo -->
          <div
            class="relative z-[1] mx-auto mb-2 w-full max-w-[min(96vw,1180px)] shrink-0 px-4 sm:px-6 md:mb-3 md:hidden md:px-10 lg:px-14"
          >
            <div class="mb-1 flex justify-between text-[9px] uppercase tracking-[0.2em] text-muted/85">
              <span>{{ landing.story.timelineMobileStep }}</span>
              <span class="tabular-nums">{{ activeIndex + 1 }} / {{ exp.length }}</span>
            </div>
            <div class="h-1 w-full overflow-hidden rounded-full bg-stroke/25">
              <div
                class="h-full rounded-full bg-gradient-to-r from-[#4e85bf] to-[#89aacc] transition-[width] duration-100 ease-out"
                :style="{ width: `${scrollProgress * 100}%` }"
              />
            </div>
          </div>

          <div
            class="relative z-[1] mx-auto flex min-h-0 w-full max-w-[min(96vw,1180px)] flex-1 gap-4 px-4 sm:px-6 md:gap-6 md:px-10 lg:gap-8 lg:px-14"
          >
            <!-- Rail vertical (desktop): preenchimento acompanha o scroll -->
            <div
              class="relative hidden w-11 shrink-0 self-stretch md:block lg:w-[3.25rem]"
              aria-hidden="true"
            >
              <div class="absolute inset-y-0 left-1/2 w-0 -translate-x-1/2">
                <div class="absolute bottom-24 left-1/2 top-4 h-[calc(100%-7rem)] w-[3px] -translate-x-1/2 overflow-hidden rounded-full bg-stroke/25">
                  <div
                    class="absolute left-0 top-0 w-full rounded-full bg-gradient-to-b from-[#4e85bf] via-[#5a8fc4] to-[#89aacc] transition-[height] duration-100 ease-out"
                    :style="{
                      height: `${scrollProgress * 100}%`,
                      minHeight: scrollProgress > 0.02 ? '6px' : '0px'
                    }"
                  />
                </div>
                <div
                  v-for="(job, ti) in exp"
                  :key="`rail-${job.company}-${ti}`"
                  class="absolute left-1/2 z-[2] -translate-x-1/2 -translate-y-1/2"
                  :style="{ top: timelineDotTop(ti, exp.length) }"
                >
                  <span
                    class="block h-2.5 w-2.5 rounded-full border-2 border-white shadow-md transition-all duration-300 md:h-3 md:w-3"
                    :class="
                      ti < activeIndex
                        ? 'bg-[#4e85bf] ring-2 ring-[#4e85bf]/25'
                        : ti === activeIndex
                          ? 'scale-125 bg-[#4e85bf] ring-4 ring-[#4e85bf]/20'
                          : 'bg-white ring-1 ring-stroke/40'
                    "
                  />
                </div>
              </div>
            </div>

            <div class="flex min-h-0 min-w-0 flex-1 flex-col">
              <Transition name="job-swap" mode="out-in">
                <div
                  v-if="currentJob"
                  :key="`${currentJob.job.company}-${currentJob.index}`"
                  class="flex min-h-0 flex-1 flex-col items-center text-center"
                >
                  <div class="shrink-0 px-0.5">
                    <h4
                      class="max-w-[95vw] font-display text-[clamp(1.4rem,3.6vw,2.15rem)] font-normal italic leading-[1.15] tracking-tight text-[#141a22] md:max-w-2xl lg:text-[2.25rem]"
                    >
                      {{ currentJob.job.role }}
                    </h4>
                    <a
                      :href="currentJob.job.site"
                      target="_blank"
                      rel="noreferrer"
                      class="mt-1.5 inline-flex items-center gap-1 text-[14px] font-medium text-[#3d7ab8] transition-opacity hover:opacity-[0.88] md:text-[15px]"
                    >
                      {{ currentJob.job.company }}
                      <Icon icon="lucide:arrow-up-right" class="h-3.5 w-3.5 shrink-0 opacity-90" />
                    </a>
                    <p class="mt-1 text-[11px] text-muted/90 sm:text-xs md:text-[13px]">
                      {{ currentJob.job.duration }}
                    </p>
                    <p
                      class="mx-auto mt-3 max-w-md text-[9px] uppercase tracking-[0.22em] text-muted/80 md:mt-4 md:text-[10px]"
                    >
                      {{ landing.story.timelineFeatsEyebrow }}
                    </p>
                  </div>

                  <div
                    class="story-feats-scroll mt-3 min-h-0 w-full max-w-3xl flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-0.5 pb-2 pt-1 md:mt-4 md:max-w-[42rem] md:pb-3"
                  >
                    <div class="flex flex-col gap-2.5 md:gap-3">
                      <div
                        v-for="(line, k) in currentJob.job.description"
                        :key="k"
                        class="w-full md:flex md:flex-col"
                        :class="[chipRowClass(k, currentJob.job.description.length)]"
                      >
                        <button
                          type="button"
                          class="group w-full origin-center rounded-[1.75rem] text-left text-[13px] font-normal leading-[1.62] text-[#2b3340] shadow-[0_10px_36px_-26px_rgba(41,67,101,0.18)] ring-1 ring-black/[0.05] transition-[box-shadow,background-color,opacity,transform] duration-300 ease-out sm:text-[14px] md:px-5 md:py-3 md:text-[15px] md:leading-relaxed"
                          :class="[
                            k % 2 === 0 ? 'md:-rotate-[0.2deg]' : 'md:rotate-[0.2deg]',
                            isChipActive(k)
                              ? 'bg-white shadow-[0_18px_48px_-30px_rgba(78,133,191,0.2)] ring-[#89aacc]/40 md:scale-[1.01]'
                              : 'bg-white/92 backdrop-blur-sm',
                            hoveredLine !== null && hoveredLine !== k && mdUp ? 'md:opacity-[0.4]' : '',
                            !mdUp ? 'px-4 py-3' : '',
                            isChipActive(k) && mdUp ? 'md:text-[15px] lg:text-[1.05rem]' : ''
                          ]"
                          @mouseenter="onChipEnter($event, k)"
                          @mouseleave="onChipLeave()"
                          @focus="hoveredLine = k"
                          @blur="hoveredLine = null"
                          @click="onChipClick(k)"
                        >
                          <span
                            class="block text-pretty"
                            :class="isChipActive(k) || mdUp ? '' : 'line-clamp-4'"
                          >
                            {{ line }}
                          </span>
                          <span
                            v-if="!mdUp && !isChipActive(k) && line.length > 100"
                            class="mt-1.5 block text-[10px] font-medium uppercase tracking-wider text-[#4e85bf]/80"
                          >
                            {{ landing.story.tapToExpandHint }}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <div
            class="relative z-[1] mx-auto mt-1 flex max-w-[90vw] shrink-0 flex-wrap items-center justify-center gap-2 px-4 pb-[env(safe-area-inset-bottom,0px)] sm:px-6 md:mt-2 md:gap-2.5 md:px-10 lg:px-14"
            aria-hidden="true"
          >
            <span
              v-for="(job, d) in exp"
              :key="`dot-${d}`"
              class="h-1.5 rounded-full transition-all duration-300"
              :class="
                d === activeIndex
                  ? 'w-8 bg-[#4e85bf] sm:w-9'
                  : d < activeIndex
                    ? 'w-1.5 bg-[#89aacc]/70'
                    : 'w-1.5 bg-stroke/70'
              "
            />
          </div>
        </div>
    </div>
  </section>
</template>

<style scoped>
.job-swap-enter-active,
.job-swap-leave-active {
  transition:
    opacity 0.24s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.26s cubic-bezier(0.22, 1, 0.36, 1);
}

.job-swap-enter-from {
  opacity: 0;
  transform: translateY(0.75rem) scale(0.992);
}

.job-swap-leave-to {
  opacity: 0;
  transform: translateY(-0.55rem) scale(0.992);
}

.job-swap-enter-to,
.job-swap-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

@media (prefers-reduced-motion: reduce) {
  .job-swap-enter-active,
  .job-swap-leave-active {
    transition-duration: 0.12s;
  }

  .job-swap-enter-from,
  .job-swap-leave-to {
    transform: none;
    filter: none;
  }
}

.story-feats-scroll {
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: rgba(78, 133, 191, 0.35) transparent;
  /* Evita artefato de “sombra” no topo em scrollers com cantos herdados do layout */
  -webkit-mask-image: none;
  mask-image: none;
}

.story-feats-scroll::-webkit-scrollbar {
  width: 5px;
}

.story-feats-scroll::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(78, 133, 191, 0.35);
}

.story-feats-scroll::-webkit-scrollbar-track {
  background: transparent;
}
</style>
