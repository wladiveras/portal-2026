<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { landing } from '~/data/landing'
import { getLenis } from '~/utils/lenis'
import { useReducedMotion } from '~/composables/useReducedMotion'

const store = usePortfolioStore()
const { prefersReducedMotion } = useReducedMotion()
const roles = [...landing.hero.roles]
const tagline = computed(() => store.about.summary?.trim() || landing.hero.taglineFallback)
const roleIndex = ref(0)
let roleInterval = 0
const sectionRef = ref<HTMLElement | null>(null)
const progress = ref(0)
const viewportHeight = ref(1080)
const pinDistance = ref(2200)
let lenisUnsubscribe: (() => void) | null = null

const updateHeroProgress = () => {
  if (!sectionRef.value) return
  const rect = sectionRef.value.getBoundingClientRect()
  const total = Math.max(pinDistance.value, 1)
  const traveled = Math.min(Math.max(-rect.top, 0), total)
  progress.value = traveled / total
}

const updateViewport = () => {
  viewportHeight.value = window.innerHeight
}

const onVideoMeta = (duration: number) => {
  // Use duration to size the pinned scroll window.
  pinDistance.value = Math.max(1800, duration * 900)
}

onMounted(() => {
  updateViewport()
  updateHeroProgress()
  window.addEventListener('resize', updateViewport, { passive: true })
  const lenis = getLenis()
  if (lenis) {
    const onLenisScroll = () => {
      updateHeroProgress()
    }
    lenis.on('scroll', onLenisScroll)
    lenisUnsubscribe = () => {
      lenis.off('scroll', onLenisScroll)
    }
  } else {
    window.addEventListener('scroll', updateHeroProgress, { passive: true })
  }

  roleInterval = window.setInterval(() => {
    roleIndex.value = (roleIndex.value + 1) % roles.length
  }, 2000)

  if (!prefersReducedMotion.value) {
    gsap
      .timeline({ defaults: { ease: 'power3.out' } })
      .to('.name-reveal', { opacity: 1, y: 0, duration: 0.88, delay: 0.08 })
      .to(
        '.blur-in',
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.72, stagger: 0.08, delay: 0.22 },
        '-=0.8'
      )
  } else {
    gsap.set('.name-reveal, .blur-in', { opacity: 1, y: 0, filter: 'blur(0px)' })
  }
})

onUnmounted(() => {
  clearInterval(roleInterval)
  window.removeEventListener('resize', updateViewport)
  window.removeEventListener('scroll', updateHeroProgress)
  lenisUnsubscribe?.()
  lenisUnsubscribe = null
})
</script>

<template>
  <section
    id="home"
    ref="sectionRef"
    class="relative scroll-mt-24"
    :style="{ height: `${viewportHeight + pinDistance}px` }"
  >
    <div class="sticky top-0 flex h-[100dvh] items-center justify-center overflow-hidden">
      <UiVortexVideoBackground
        :local-src="landing.hero.vortexVideoSrc"
        poster="/media/Gemini_Generated_Image_6ve8py6ve8py6ve8.png"
        :progress="progress"
        @meta="onVideoMeta"
      />
      <div class="relative z-10 mx-auto w-full max-w-[1200px] px-6 pt-6 text-center sm:pt-12 md:px-10 md:pt-20 lg:px-16 lg:pt-24">
        <p class="blur-in mb-8 text-xs uppercase tracking-[0.3em] text-slate-700/85 [text-shadow:0_1px_8px_rgba(255,255,255,0.45)]">
          {{ landing.hero.collectionEyebrow }}
        </p>
        <h1 class="name-reveal mb-6 font-display text-6xl italic leading-[0.9] tracking-tight text-slate-950 [text-shadow:0_2px_18px_rgba(255,255,255,0.35)] md:text-8xl lg:text-9xl">
          {{ landing.hero.name }}
        </h1>
        <p class="blur-in mb-4 text-base text-slate-800 [text-shadow:0_1px_8px_rgba(255,255,255,0.4)] md:text-xl">
          {{ landing.hero.roleLinePrefix }}
          <span :key="roleIndex" class="inline-block animate-role-fade-in font-display italic text-slate-900">
            {{ roles[roleIndex] }}
          </span>
          {{ landing.hero.roleLineSuffix }}
        </p>
        <p class="blur-in mx-auto mb-12 max-w-md text-sm text-slate-700 [text-shadow:0_1px_10px_rgba(255,255,255,0.45)] md:text-base">
          {{ tagline }}
        </p>
        <div class="blur-in inline-flex flex-wrap items-center justify-center gap-4">
          <UiGradientRingButton :label="landing.hero.primaryCta.label" :href="landing.hero.primaryCta.href" solid />
          <UiGradientRingButton :label="landing.hero.secondaryCta.label" :href="landing.hero.secondaryCta.href" />
        </div>
      </div>
    </div>
  </section>
</template>
