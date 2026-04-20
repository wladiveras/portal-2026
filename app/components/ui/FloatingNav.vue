<script setup lang="ts">
import { Icon } from '@iconify/vue'
import gsap from 'gsap'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { landing } from '~/data/landing'
import { useReducedMotion } from '~/composables/useReducedMotion'
import { onInPageHashClick } from '~/utils/inPageHashNav'

const NAV_ICONS: Record<string, string> = {
  home: 'lucide:house',
  services: 'lucide:layout-grid',
  work: 'lucide:briefcase-business',
  timeline: 'lucide:clock-3'
}

type OrbitPoint = { x: number; y: number }

const open = ref(false)
const linkRefs = ref<(HTMLElement | null)[]>([])
const ctaRef = ref<HTMLAnchorElement | null>(null)
const orbitScale = ref(1)

const { prefersReducedMotion } = useReducedMotion()

const navLinks = computed(() => landing.nav.items)

const FAN_TARGETS = computed<OrbitPoint[]>(() => {
  const scale = orbitScale.value
  const x = 0
  const yStart = Math.round(120 * scale)
  const yStep = Math.round(60 * scale)
  return navLinks.value.map((_, i) => ({ x, y: yStart + i * yStep }))
})

const CTA_FAN = computed<OrbitPoint>(() => {
  const scale = orbitScale.value
  // CTA no topo da coluna, mantendo hierarquia visual.
  return { x: 0, y: Math.round(60 * scale) }
})

function setLinkRef(el: Element | ComponentPublicInstance | null, i: number) {
  while (linkRefs.value.length <= i) linkRefs.value.push(null)
  if (el == null) {
    linkRefs.value[i] = null
    return
  }
  const node = el instanceof HTMLElement ? el : (el as ComponentPublicInstance).$el
  linkRefs.value[i] = node instanceof HTMLElement ? node : null
}

let openTl: gsap.core.Timeline | null = null
let onResizeOrbit: (() => void) | null = null

function killTl() {
  openTl?.kill()
  openTl = null
}

function setSatellitesInteractive(on: boolean) {
  const pe = on ? 'auto' : 'none'
  linkRefs.value.forEach((el) => {
    if (el) el.style.pointerEvents = pe
  })
  if (ctaRef.value) ctaRef.value.style.pointerEvents = pe
}

function animateOpen() {
  killTl()
  if (prefersReducedMotion.value) {
    linkRefs.value.forEach((el, i) => {
      if (!el) return
      const t = FAN_TARGETS.value[i]
      if (t) gsap.set(el, { x: t.x, y: t.y, opacity: 1, scale: 1 })
    })
    if (ctaRef.value) {
      gsap.set(ctaRef.value, {
        x: CTA_FAN.value.x,
        y: CTA_FAN.value.y,
        opacity: 1,
        scale: 1
      })
    }
    setSatellitesInteractive(true)
    return
  }

  const links = linkRefs.value.filter(Boolean) as HTMLElement[]
  const cta = ctaRef.value
  const tl = gsap.timeline({
    onComplete: () => {
      setSatellitesInteractive(true)
      openTl = null
    }
  })
  openTl = tl

  if (cta) {
    tl.fromTo(
      cta,
      { x: 0, y: 0, scale: 0.5, opacity: 0, transformOrigin: '100% 0%' },
      {
        x: CTA_FAN.value.x,
        y: CTA_FAN.value.y,
        scale: 1,
        opacity: 1,
        duration: 0.48,
        ease: 'back.out(1.42)'
      },
      0
    )
  }

  links.forEach((el, i) => {
    const t = FAN_TARGETS.value[i]
    if (!t) return
    tl.fromTo(
      el,
      { x: 0, y: 0, scale: 0.5, opacity: 0, transformOrigin: '100% 0%' },
      {
        x: t.x,
        y: t.y,
        scale: 1,
        opacity: 1,
        duration: 0.48,
        ease: 'back.out(1.45)'
      },
      0.05 + i * 0.07
    )
  })
}

function animateClose() {
  killTl()
  setSatellitesInteractive(false)

  if (prefersReducedMotion.value) {
    linkRefs.value.forEach((el) => el && gsap.set(el, { x: 0, y: 0, opacity: 0, scale: 0.5 }))
    if (ctaRef.value) gsap.set(ctaRef.value, { x: 0, y: 0, opacity: 0, scale: 0.5 })
    return
  }

  const links = [...linkRefs.value].filter(Boolean).reverse() as HTMLElement[]
  const cta = ctaRef.value
  const tl = gsap.timeline()
  openTl = tl

  let pos = 0
  if (cta) {
    tl.to(
      cta,
      {
        x: 0,
        y: 0,
        scale: 0.5,
        opacity: 0,
        duration: 0.28,
        ease: 'back.in(1.28)'
      },
      pos
    )
    pos += 0.05
  }
  links.forEach((el, i) => {
    tl.to(
      el,
      {
        x: 0,
        y: 0,
        scale: 0.5,
        opacity: 0,
        duration: 0.3,
        ease: 'back.in(1.3)'
      },
      pos + i * 0.05
    )
  })
}

function close() {
  if (!open.value) return
  open.value = false
}

function toggle() {
  open.value = !open.value
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

watch(open, async (v) => {
  await nextTick()
  if (v) animateOpen()
  else animateClose()
})

function initClosedVisuals() {
  linkRefs.value.forEach((el) => {
    if (el) gsap.set(el, { x: 0, y: 0, opacity: 0, scale: 0.5, transformOrigin: '100% 0%' })
  })
  if (ctaRef.value) {
    gsap.set(ctaRef.value, { x: 0, y: 0, opacity: 0, scale: 0.5, transformOrigin: '100% 0%' })
  }
  setSatellitesInteractive(false)
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  onResizeOrbit = () => {
    orbitScale.value = window.innerWidth < 420 ? 0.84 : 1
  }
  onResizeOrbit()
  window.addEventListener('resize', onResizeOrbit, { passive: true })
  nextTick(() => {
    requestAnimationFrame(() => initClosedVisuals())
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  if (onResizeOrbit) window.removeEventListener('resize', onResizeOrbit)
  onResizeOrbit = null
  killTl()
})

function onNavClick(e: MouseEvent, href: string) {
  onInPageHashClick(e, href)
  close()
}
</script>

<template>
  <div class="fixed right-4 top-4 z-[60] md:right-6 md:top-6">
    <!-- Área maior que o toggle: satélites saem para a esquerda / baixo -->
    <div class="relative h-11 w-11 shrink-0">
      <button
        type="button"
        class="relative z-[35] flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-text-primary text-white shadow-[0_12px_32px_-12px_rgba(20,26,34,0.55)] transition-transform duration-200 ease-out hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-primary"
        :aria-expanded="open"
        aria-haspopup="true"
        :aria-label="open ? 'Fechar menu' : 'Abrir menu'"
        @click="toggle"
      >
        <Icon
          :icon="open ? 'lucide:x' : 'lucide:align-justify'"
          class="h-[19px] w-[19px] text-white"
          aria-hidden="true"
        />
      </button>

      <a
        v-for="(item, i) in navLinks"
        :key="item.id"
        :ref="(el) => setLinkRef(el, i)"
        :href="item.href"
        class="absolute right-0 top-0 z-[20] flex h-11 w-11 items-center justify-center rounded-full border border-white/90 bg-white/95 text-text-primary shadow-[0_12px_32px_-14px_rgba(41,67,101,0.35)] backdrop-blur-xl will-change-transform focus-visible:z-[40] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-primary"
        style="pointer-events: none"
        :title="item.label"
        :aria-hidden="!open"
        :tabindex="open ? 0 : -1"
        @click="(e) => onNavClick(e, item.href)"
      >
        <Icon :icon="NAV_ICONS[item.id] ?? 'lucide:circle'" class="h-[18px] w-[18px]" aria-hidden="true" />
        <span class="sr-only">{{ item.label }}</span>
      </a>

      <a
        ref="ctaRef"
        :href="landing.nav.cta.href"
        :title="landing.nav.cta.label"
        class="absolute right-0 top-0 z-[25] flex h-11 w-11 items-center justify-center rounded-full border border-white/90 bg-white/95 text-text-primary shadow-[0_12px_32px_-14px_rgba(41,67,101,0.35)] backdrop-blur-xl will-change-transform focus-visible:z-[40] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-primary"
        style="pointer-events: none"
        :aria-hidden="!open"
        :tabindex="open ? 0 : -1"
        @click="(e) => onNavClick(e, landing.nav.cta.href)"
      >
        <Icon :icon="landing.nav.cta.icon" class="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
        <span class="sr-only">{{ landing.nav.cta.label }}</span>
      </a>
    </div>
  </div>

  <Transition
    enter-active-class="transition-opacity duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <button
      v-show="open"
      type="button"
      class="fixed inset-0 z-[55] bg-text-primary/18 backdrop-blur-[3px]"
      aria-label="Fechar menu"
      @click="close"
    />
  </Transition>
</template>
