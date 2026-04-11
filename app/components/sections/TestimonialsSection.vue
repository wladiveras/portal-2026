<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { landing } from '~/data/landing'

const store = usePortfolioStore()
const sectionRef = ref<HTMLElement | null>(null)
const headerRef = ref<HTMLElement | null>(null)
const bgRef = ref<HTMLElement | null>(null)
const row1Ref = ref<HTMLElement | null>(null)
const row2Ref = ref<HTMLElement | null>(null)

const list = computed(() => store.testimonials.slice(0, landing.testimonials.maxCards))

const row1Items = computed(() => {
  const evens = list.value.filter((_, i) => i % 2 === 0)
  return evens.length ? evens : list.value
})

const row2Items = computed(() => {
  const odds = list.value.filter((_, i) => i % 2 === 1)
  return odds.length ? odds : list.value
})

let tween1: gsap.core.Tween | null = null
let tween2: gsap.core.Tween | null = null
const scrollTriggers: ScrollTrigger[] = []

function setupMarquees() {
  tween1?.kill()
  tween2?.kill()
  tween1 = null
  tween2 = null

  if (!row1Ref.value || !row2Ref.value || !list.value.length) return

  const half1 = row1Ref.value.scrollWidth / 2
  const half2 = row2Ref.value.scrollWidth / 2
  if (half1 < 2 || half2 < 2) return

  tween1 = gsap.fromTo(
    row1Ref.value,
    { x: 0 },
    {
      x: -half1,
      duration: landing.testimonials.marqueeDurationRow1,
      ease: 'none',
      repeat: -1
    }
  )

  tween2 = gsap.fromTo(
    row2Ref.value,
    { x: -half2 },
    {
      x: 0,
      duration: landing.testimonials.marqueeDurationRow2,
      ease: 'none',
      repeat: -1
    }
  )
}

function pauseRow1(p: boolean) {
  if (p) tween1?.pause()
  else tween1?.resume()
}

function pauseRow2(p: boolean) {
  if (p) tween2?.pause()
  else tween2?.resume()
}

function setupScrollMotion() {
  scrollTriggers.forEach((st) => st.kill())
  scrollTriggers.length = 0

  if (!sectionRef.value || !headerRef.value) return

  const titleBlock = headerRef.value.querySelector('[data-t-head-title]')

  const stHeader = ScrollTrigger.create({
    trigger: sectionRef.value,
    start: 'top 88%',
    end: 'top 35%',
    scrub: 0.75,
    onUpdate: (self) => {
      const p = self.progress
      if (titleBlock)
        gsap.set(titleBlock, {
          y: 20 * (1 - p),
          opacity: 0.72 + 0.28 * p
        })
    }
  })
  scrollTriggers.push(stHeader)

  if (bgRef.value) {
    const stBg = ScrollTrigger.create({
      trigger: sectionRef.value,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 0.55,
      onUpdate: (self) => {
        gsap.set(bgRef.value, { yPercent: (self.progress - 0.5) * 3 })
      }
    })
    scrollTriggers.push(stBg)
  }

  const rowsWrap = sectionRef.value.querySelectorAll('[data-marquee-wrap]')
  rowsWrap.forEach((el) => {
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      end: 'top 40%',
      scrub: 0.55,
      onUpdate: (self) => {
        gsap.set(el, {
          opacity: 0.4 + 0.6 * self.progress,
          x: (1 - self.progress) * 12
        })
      }
    })
    scrollTriggers.push(st)
  })
}

onMounted(() => {
  nextTick(() => {
    setupMarquees()
    setupScrollMotion()
  })
})

watch(
  () => list.value.length,
  () => {
    nextTick(() => {
      setupMarquees()
      setupScrollMotion()
    })
  }
)

onUnmounted(() => {
  tween1?.kill()
  tween2?.kill()
  scrollTriggers.forEach((st) => st.kill())
  scrollTriggers.length = 0
})
</script>

<template>
  <section
    :id="landing.testimonials.sectionId"
    ref="sectionRef"
    class="relative scroll-mt-24 overflow-hidden border-t border-stroke/40 bg-gradient-to-b from-bg via-[#f6f9fc] to-bg py-14 md:py-20"
  >
    <div
      ref="bgRef"
      class="pointer-events-none absolute inset-0 opacity-[0.35] will-change-transform"
      aria-hidden="true"
      style="
        background-image: radial-gradient(circle at 1px 1px, rgba(137, 170, 204, 0.12) 1px, transparent 0);
        background-size: 48px 48px;
      "
    />

    <div class="relative mx-auto max-w-[1400px] px-4 sm:px-6 md:px-10 lg:px-12">
      <div ref="headerRef" class="mb-10 text-center md:mb-12">
        <div data-t-head-title>
          <h2
            class="mx-auto max-w-3xl text-[clamp(1.85rem,4.2vw,2.75rem)] font-medium leading-snug tracking-tight text-text-primary md:leading-tight"
          >
            {{ landing.testimonials.headline.lead }}
            <span class="font-display italic text-[#4e85bf]/90">
              {{ landing.testimonials.headline.italic }}
            </span>
          </h2>
          <p class="mx-auto mt-2 max-w-xl text-sm font-light text-muted md:mt-2.5 md:text-base">
            {{ landing.testimonials.headline.muted }}
          </p>
        </div>

      </div>

      <p v-if="store.loading && !list.length" class="py-6 text-center text-xs text-muted">
        {{ landing.testimonials.emptyState }}
      </p>

      <template v-else-if="list.length">
        <div
          data-marquee-wrap
          class="mb-4 overflow-hidden py-6 opacity-100 will-change-[opacity,transform] md:mb-6 md:py-8"
          @mouseenter="pauseRow1(true)"
          @mouseleave="pauseRow1(false)"
        >
          <div ref="row1Ref" class="flex w-max gap-4 pr-4 md:gap-5 md:pr-5">
            <template v-for="dup in [0, 1]" :key="`r1-${dup}`">
              <UiTestimonialMarqueeCard
                v-for="(t, i) in row1Items"
                :key="`r1-${dup}-${t.name}-${i}`"
                :t="t"
              />
            </template>
          </div>
        </div>

        <div
          data-marquee-wrap
          class="overflow-hidden py-6 opacity-100 will-change-[opacity,transform] md:py-8"
          @mouseenter="pauseRow2(true)"
          @mouseleave="pauseRow2(false)"
        >
          <div ref="row2Ref" class="flex w-max gap-4 pr-4 md:gap-5 md:pr-5">
            <template v-for="dup in [0, 1]" :key="`r2-${dup}`">
              <UiTestimonialMarqueeCard
                v-for="(t, i) in row2Items"
                :key="`r2-${dup}-${t.name}-${i}`"
                :t="t"
              />
            </template>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>
