<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { landing } from '~/data/landing'
import { useCinematicLoopVideo } from '~/composables/useCinematicLoopVideo'

gsap.registerPlugin(ScrollTrigger)

const videoRef = ref<HTMLVideoElement | null>(null)
const { opacity } = useCinematicLoopVideo(videoRef, { fadeSec: 0.5, restartDelayMs: 100 })

const marquee = ref<HTMLElement | null>(null)
const ctaBlock = ref<HTMLElement | null>(null)
const phrase = computed(() => `${landing.contact.marqueePhrase} · `.repeat(8))

let ctaTween: gsap.core.Tween | null = null

onMounted(() => {
  if (marquee.value) {
    gsap.to(marquee.value, { xPercent: -50, duration: 45, ease: 'none', repeat: -1 })
  }
  if (ctaBlock.value) {
    ctaTween = gsap.fromTo(
      ctaBlock.value,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.68,
        ease: 'power3.out',
        delay: 0.15,
        scrollTrigger: {
          trigger: ctaBlock.value,
          start: 'top 88%',
          toggleActions: 'play none none reverse'
        }
      }
    )
  }
})

onUnmounted(() => {
  if (ctaTween) {
    ctaTween.scrollTrigger?.kill()
    ctaTween.kill()
    ctaTween = null
  }
})
</script>

<template>
  <section
    :id="landing.contact.sectionId"
    class="relative scroll-mt-24 min-h-[95vh] w-full overflow-hidden bg-bg pb-20 pt-16 md:min-h-[100vh] md:pb-28 md:pt-20"
  >
    <div class="absolute inset-0 z-0 overflow-hidden">
      <div
        class="absolute inset-x-[-6%] bottom-0 top-[72px] min-h-[58%] overflow-hidden sm:top-[88px] md:top-[96px] lg:top-[104px]"
      >
        <video
          ref="videoRef"
          class="h-full w-full scale-[1.12] object-cover object-[center_72%] [filter:brightness(1.08)_saturate(1.12)_contrast(1.04)] sm:object-[center_75%]"
          :src="landing.contact.ctaVideoSrc"
          muted
          playsinline
          preload="auto"
          :style="{ opacity: opacity }"
        />
      </div>
      <div
        class="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg via-bg/20 to-bg/95"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-[#89aacc]/[0.07] to-transparent"
        aria-hidden="true"
      />
      <div class="pointer-events-none absolute inset-0 bg-white/18 md:bg-white/12" aria-hidden="true" />
      <div
        class="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-bg via-bg/65 to-transparent md:h-28 md:via-bg/55"
        aria-hidden="true"
      />
    </div>

    <div class="relative z-10 mx-auto flex min-h-[78vh] max-w-7xl flex-col px-6 pb-10 md:min-h-[82vh] md:px-10 md:pb-14 lg:px-14">
      <p
        ref="marquee"
        class="mt-10 mb-16 whitespace-nowrap font-display text-2xl italic text-text-primary/55 drop-shadow-[0_2px_24px_rgba(78,133,191,0.25)] md:mt-12 md:mb-20 md:text-4xl md:text-text-primary/50"
      >
        {{ phrase }}
      </p>

      <div
        class="flex min-h-0 flex-1 flex-col items-center justify-center px-2 pb-8 text-center md:px-6 md:pb-12"
      >
        <div
          id="contact-cta"
          ref="ctaBlock"
          class="scroll-mt-28 w-full max-w-2xl rounded-[2rem] border border-white/85 bg-white/90 p-8 shadow-[0_36px_72px_-32px_rgba(41,67,101,0.28),inset_0_1px_0_rgba(255,255,255,1)] backdrop-blur-2xl md:scroll-mt-32 md:rounded-[2.25rem] md:p-12"
        >
          <p class="text-xs uppercase tracking-[0.22em] text-muted">{{ landing.contact.ctaEyebrow }}</p>
          <h3 class="mt-4 text-3xl font-normal leading-[0.98] tracking-tight text-text-primary md:text-5xl">
            {{ landing.contact.titlePlain }}
            <span class="font-display italic text-muted">{{ landing.contact.titleItalic }}</span>
          </h3>
          <p class="mx-auto mt-5 max-w-md text-sm leading-relaxed text-muted md:text-base">
            {{ landing.contact.ctaDescription }}
          </p>
          <div class="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              :href="landing.contact.whatsappHref"
              target="_blank"
              rel="noreferrer"
              class="inline-flex rounded-full bg-text-primary px-8 py-4 text-base text-white shadow-lg transition-transform duration-300 hover:scale-[1.03] md:px-10 md:py-4"
            >
              {{ landing.contact.ctaButtonLabel }}
            </a>
            <a
              :href="`mailto:${landing.contact.email}`"
              class="inline-flex rounded-full border border-stroke/80 bg-white px-8 py-4 text-base text-text-primary shadow-sm transition-transform duration-300 hover:scale-[1.03] md:px-10 md:py-4"
            >
              {{ landing.contact.ctaButtonEmailLabel }}
            </a>
          </div>
          <p class="mt-4 text-xs text-muted">{{ landing.contact.whatsappNumber }} · {{ landing.contact.email }}</p>
        </div>
      </div>

      <footer
        class="mt-auto flex flex-col gap-8 border-t border-stroke/50 pt-14 text-sm md:mt-20 md:flex-row md:flex-wrap md:items-center md:justify-between md:pt-16"
      >
        <div class="flex flex-wrap gap-2 md:gap-3">
          <a
            v-for="s in landing.contact.socials"
            :key="s.label"
            :href="s.href"
            target="_blank"
            rel="noreferrer"
            class="inline-flex items-center gap-2 rounded-full border border-stroke/70 bg-white/55 px-4 py-2.5 text-muted shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#89aacc]/45 hover:text-text-primary hover:shadow-md"
          >
            <Icon :icon="s.icon" class="h-4 w-4 shrink-0 text-text-primary/90" />
            {{ s.label }}
          </a>
        </div>
        <div
          class="inline-flex items-center gap-2.5 self-start rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 text-text-primary md:self-center"
        >
          <span class="relative flex h-2.5 w-2.5">
            <span
              class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-40"
            />
            <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span class="font-medium">{{ landing.contact.availability }}</span>
        </div>
      </footer>
    </div>
  </section>
</template>
