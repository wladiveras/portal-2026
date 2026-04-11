<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { landing } from '~/data/landing'
import type { LandingStatKey } from '~/data/landing'

const store = usePortfolioStore()
const rootRef = ref<HTMLElement | null>(null)
const statsRowRef = ref<HTMLElement | null>(null)
const tweens: gsap.core.Tween[] = []
const sectionScroll = ref(0)
let stSectionParallax: ScrollTrigger | null = null
let stStats: ScrollTrigger | null = null
let statsCountTimeline: gsap.core.Timeline | null = null

const projectTitles = computed(() =>
  store.projects.map((p) => p.title).filter((t) => Boolean(t?.trim()))
)

function statValue(key: LandingStatKey): string {
  if (key === 'years') return String(store.yearsOfExperience)
  if (key === 'projects') return String(Math.max(store.totalProjects, 0))
  if (key === 'voices') return String(store.testimonials.length)
  return '0'
}

const metrics = computed(() =>
  landing.stats.cards.map((c) => ({
    label: c.label,
    suffix: c.suffix,
    display: `${statValue(c.valueKey)}${c.suffix}`
  }))
)

const statNumericTargets = computed(() =>
  landing.stats.cards.map((c) => {
    const n = Number.parseInt(statValue(c.valueKey), 10)
    return Number.isFinite(n) ? n : 0
  })
)

const statDisplay = ref<[number, number, number]>([0, 0, 0])

function tearDownStatAnim() {
  stStats?.kill()
  stStats = null
  statsCountTimeline?.kill()
  statsCountTimeline = null
}

function setupStatCountUp() {
  if (!import.meta.client) return
  tearDownStatAnim()
  const row = statsRowRef.value
  if (!row) return

  const targets = statNumericTargets.value
  statDisplay.value = [0, 0, 0]

  const state = { a: 0, b: 0, c: 0 }
  const sync = () => {
    statDisplay.value = [Math.round(state.a), Math.round(state.b), Math.round(state.c)]
  }

  stStats = ScrollTrigger.create({
    trigger: row,
    start: 'top 86%',
    once: true,
    onEnter: () => {
      const t = statNumericTargets.value
      state.a = 0
      state.b = 0
      state.c = 0
      sync()

      const wraps = row.querySelectorAll('.stat-count-wrap')
      if (wraps.length) {
        gsap.fromTo(
          wraps,
          { opacity: 0, y: 22, scale: 0.92, filter: 'blur(5px)' },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.72,
            stagger: { each: 0.16, from: 'start' },
            ease: 'power2.out'
          }
        )
      }

      const tl = gsap.timeline()
      tl.to(
        state,
        {
          a: t[0] ?? 0,
          duration: 2.55,
          ease: 'power2.out',
          onUpdate: sync
        },
        0
      )
      tl.to(
        state,
        {
          b: t[1] ?? 0,
          duration: 1.62,
          ease: 'power3.out',
          onUpdate: sync
        },
        0.22
      )
      tl.to(
        state,
        {
          c: t[2] ?? 0,
          duration: 1.05,
          ease: 'power3.out',
          onUpdate: sync
        },
        0.4
      )
      statsCountTimeline = tl
    }
  })
}

function setupSectionParallax() {
  stSectionParallax?.kill()
  stSectionParallax = null
  if (!import.meta.client || !rootRef.value) return
  stSectionParallax = ScrollTrigger.create({
    trigger: rootRef.value,
    start: 'top bottom',
    end: 'bottom top',
    scrub: 0.42,
    onUpdate: (self) => {
      sectionScroll.value = self.progress
    }
  })
}

function bindScrollMotion() {
  tweens.forEach((tw) => {
    tw.scrollTrigger?.kill()
    tw.kill()
  })
  tweens.length = 0
  if (!rootRef.value) return

  const header = rootRef.value.querySelector('[data-work-header]')
  const storyLines = rootRef.value.querySelectorAll('[data-work-story-line]')
  const ribbon = rootRef.value.querySelector('[data-work-ribbon]')

  if (header) {
    const tw = gsap.fromTo(
      header,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: header, start: 'top 88%', toggleActions: 'play none none reverse' }
      }
    )
    tweens.push(tw)
  }

  if (storyLines.length) {
    const tw = gsap.fromTo(
      storyLines,
      { opacity: 0, y: 22, filter: 'blur(6px)' },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.85,
        stagger: 0.14,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: storyLines[0]?.parentElement,
          start: 'top 82%',
          toggleActions: 'play none none reverse'
        }
      }
    )
    tweens.push(tw)
  }

  if (ribbon) {
    const tw = gsap.fromTo(
      ribbon,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: { trigger: ribbon, start: 'top 92%', toggleActions: 'play none none reverse' }
      }
    )
    tweens.push(tw)
  }
}

onMounted(() => {
  nextTick(() => {
    setupSectionParallax()
    bindScrollMotion()
    nextTick(() => setupStatCountUp())
  })
})

watch(
  () => [store.projects.length, store.loading],
  () => {
    nextTick(() => {
      setupSectionParallax()
      bindScrollMotion()
      ScrollTrigger.refresh()
    })
  }
)

watch(
  statsRowRef,
  (el) => {
    if (el) nextTick(() => setupStatCountUp())
  },
  { flush: 'post' }
)

onUnmounted(() => {
  tearDownStatAnim()
  stSectionParallax?.kill()
  stSectionParallax = null
  tweens.forEach((tw) => {
    tw.scrollTrigger?.kill()
    tw.kill()
  })
  tweens.length = 0
})
</script>

<template>
  <section id="work" ref="rootRef" class="relative scroll-mt-24 overflow-hidden bg-bg py-16 md:py-28">
    <div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <div
        class="absolute left-1/2 top-[15%] h-[min(70vw,520px)] w-[min(70vw,520px)] -translate-x-1/2 rounded-full bg-[#89aacc]/[0.07] blur-[90px]"
        :style="{
          transform: `translateX(-50%) translateY(${sectionScroll * 48}px) scale(${1 + sectionScroll * 0.04})`
        }"
      />
      <div
        class="absolute bottom-[20%] left-[10%] h-[min(40vw,280px)] w-[min(40vw,280px)] rounded-full bg-[#4e85bf]/[0.06] blur-[70px]"
        :style="{
          transform: `translateY(${sectionScroll * -40}px)`
        }"
      />
      <div
        class="absolute right-[5%] top-[40%] h-[min(36vw,220px)] w-[min(36vw,220px)] rounded-full bg-white/70 blur-[50px]"
        :style="{
          transform: `translateX(${sectionScroll * 20}px) translateY(${sectionScroll * 24}px)`
        }"
      />
    </div>

    <div
      class="pointer-events-none absolute left-0 right-0 top-0 h-40 bg-gradient-to-b from-[#89aacc]/[0.04] to-transparent"
      aria-hidden="true"
    />

    <div class="relative mx-auto max-w-3xl px-6 md:max-w-[44rem] md:px-8">
      <header data-work-header class="text-center">
        <div class="mb-4 flex items-center justify-center gap-3">
          <span class="h-px w-12 bg-gradient-to-r from-transparent via-[#4e85bf]/50 to-transparent" />
          <span class="text-[10px] font-medium uppercase tracking-[0.32em] text-muted">
            {{ landing.work.visualEyebrow }}
          </span>
          <span class="h-px w-12 bg-gradient-to-l from-transparent via-[#4e85bf]/50 to-transparent" />
        </div>
        <h2
          class="text-[clamp(2rem,5.5vw,3.5rem)] font-normal leading-[1.02] tracking-tight text-[#141a22]"
          style="letter-spacing: -0.03em"
        >
          <span class="font-display">{{ landing.work.visualPlain }}</span>
          <span class="font-display italic text-muted">{{ landing.work.visualItalic }}</span>
        </h2>
        <p class="mx-auto mt-5 max-w-2xl text-sm leading-[1.7] text-muted md:mt-6 md:text-[15px]">
          {{ landing.work.visualSubtitle }}
        </p>
      </header>

      <div
        ref="statsRowRef"
        data-work-stats
        class="mx-auto mt-12 flex max-w-xl flex-wrap justify-center gap-x-10 gap-y-8 border-y border-stroke/25 py-9 md:mt-14 md:max-w-2xl md:gap-x-14 md:py-10"
      >
        <div
          v-for="(m, i) in metrics"
          :key="`stat-${i}`"
          class="stat-count-wrap min-w-[5.5rem] text-center"
        >
          <p
            class="font-display text-[clamp(2.25rem,5vw,3rem)] italic tabular-nums leading-none text-[#141a22] [will-change:transform]"
          >
            {{ statDisplay[i] }}{{ m.suffix }}
          </p>
          <p
            class="mt-2 text-[11px] uppercase tracking-[0.14em] text-muted/90 md:text-xs md:normal-case md:tracking-normal"
          >
            {{ m.label }}
          </p>
        </div>
      </div>

      <div class="mx-auto mt-14 max-w-2xl md:mt-16">
        <p
          v-for="(para, i) in landing.work.storyParagraphs"
          :key="i"
          data-work-story-line
          class="mb-6 text-left text-[15px] leading-[1.75] text-text-primary/88 last:mb-0 md:text-center md:text-[15px] md:leading-[1.8]"
        >
          {{ para }}
        </p>
      </div>

      <div v-if="store.loading && !projectTitles.length" class="mt-12 text-center text-sm text-muted">
        {{ landing.work.emptyState }}
      </div>

      <div
        v-else-if="projectTitles.length"
        data-work-ribbon
        class="work-ribbon relative mt-14 overflow-hidden border-y border-stroke/20 py-5 md:mt-16"
      >
        <p
          class="mb-3 text-center text-[9px] uppercase tracking-[0.28em] text-muted/80"
        >
          {{ landing.work.storyRibbonEyebrow }}
        </p>
        <div class="relative mask-linear-fade">
          <div class="work-marquee-track flex w-max">
            <div class="flex items-center gap-x-10 pr-10 md:gap-x-14">
              <span
                v-for="(title, ti) in projectTitles"
                :key="`a-${ti}`"
                class="whitespace-nowrap font-display text-[clamp(1.05rem,2.8vw,1.35rem)] font-medium italic text-muted/70 md:text-xl"
              >
                {{ title }}
              </span>
            </div>
            <div class="flex items-center gap-x-10 pr-10 md:gap-x-14" aria-hidden="true">
              <span
                v-for="(title, ti) in projectTitles"
                :key="`b-${ti}`"
                class="whitespace-nowrap font-display text-[clamp(1.05rem,2.8vw,1.35rem)] font-medium italic text-muted/70 md:text-xl"
              >
                {{ title }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-12 flex justify-center pb-2 md:mt-14">
        <UiGradientRingButton
          :label="landing.work.storyCtaLabel"
          :href="landing.work.storyCtaHref"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.work-marquee-track {
  animation: work-marquee 58s linear infinite;
}

@keyframes work-marquee {
  to {
    transform: translateX(-50%);
  }
}

.mask-linear-fade {
  mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .work-marquee-track {
    animation: none;
    transform: none;
    width: 100% !important;
    max-width: 42rem;
    margin-left: auto;
    margin-right: auto;
    flex-wrap: wrap;
    justify-content: center;
    row-gap: 0.35rem;
  }

  .work-marquee-track > div:last-child {
    display: none;
  }
}
</style>
