<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, nextTick, useId } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const props = withDefaults(
  defineProps<{
    skills: string[]
    overBackdrop?: boolean
  }>(),
  { overBackdrop: false }
)

const gid = `c-${useId().replace(/[^a-z0-9]/gi, '')}`
const rootRef = ref<HTMLElement | null>(null)
const lineTweens: gsap.core.Tween[] = []
const floatTweens: gsap.core.Tween[] = []
const scrollInstances: ScrollTrigger[] = []

const positions = computed(() => {
  const n = props.skills.length
  if (!n) return []
  const out: { x: number; y: number }[] = []
  const cx = 50
  const cy = 46
  const rings = Math.ceil(n / 8) || 1
  for (let i = 0; i < n; i++) {
    const ring = Math.floor(i / 8) + 1
    const idx = i % 8
    const countOnRing = Math.min(8, n - (ring - 1) * 8)
    const angle = (idx / countOnRing) * Math.PI * 2 - Math.PI / 2 + ring * 0.35
    const baseR = 16 + ring * 12 + (rings > 1 ? ring * 5 : 9)
    const wobble = Math.sin(i * 1.37) * 3.5 + Math.cos(i * 0.91) * 2.5
    const r = Math.min(baseR + wobble, 46)
    out.push({
      x: cx + Math.cos(angle) * r * (0.94 + 0.06 * Math.sin(i)),
      y: cy + Math.sin(angle) * r * (0.9 + 0.1 * Math.cos(i * 1.2))
    })
  }
  return out
})

const links = computed(() => {
  const n = positions.value.length
  if (n < 2) return []
  const set = new Set<string>()
  const pairs: { a: number; b: number }[] = []
  const add = (a: number, b: number) => {
    if (a === b) return
    const k = a < b ? `${a}-${b}` : `${b}-${a}`
    if (set.has(k)) return
    set.add(k)
    pairs.push({ a, b })
  }
  for (let i = 0; i < n; i++) {
    add(i, (i + 1) % n)
    if (n > 3) add(i, (i + Math.max(2, Math.floor(n / 3))) % n)
    if (n > 5) add(i, (i + Math.ceil(n / 2)) % n)
  }
  return pairs
})

function cleanup() {
  scrollInstances.forEach((s) => s.kill())
  scrollInstances.length = 0
  lineTweens.forEach((t) => t.kill())
  lineTweens.length = 0
  floatTweens.forEach((t) => t.kill())
  floatTweens.length = 0
}

function bindMotion() {
  cleanup()
  if (!import.meta.client || !rootRef.value || !props.skills.length) return

  const el = rootRef.value
  const nodes = el.querySelectorAll<HTMLElement>('[data-const-node]')
  const lines = el.querySelectorAll<SVGLineElement>('[data-const-line]')

  gsap.set(nodes, { scale: 0, opacity: 0 })

  const st = ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      gsap.fromTo(
        nodes,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          stagger: { each: 0.035, from: 'random' },
          ease: 'back.out(1.25)',
          onComplete: () => {
            nodes.forEach((node, i) => {
              const tw = gsap.to(node, {
                y: `+=${3 + (i % 4)}`,
                x: `+=${((i * 11) % 5) - 2}`,
                duration: 2.4 + (i % 5) * 0.35,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: i * 0.06
              })
              floatTweens.push(tw)
            })
          }
        }
      )

      lines.forEach((line) => {
        const len = line.getTotalLength()
        gsap.set(line, { strokeDasharray: len, strokeDashoffset: len })
        const tw = gsap.to(line, {
          strokeDashoffset: 0,
          duration: 1.05,
          ease: 'power2.inOut',
          delay: Math.random() * 0.2
        })
        lineTweens.push(tw)
      })
    }
  })
  scrollInstances.push(st)
}

onMounted(() => {
  nextTick(() => bindMotion())
})

watch(
  () => props.skills.join('\0'),
  () =>
    nextTick(() => {
      bindMotion()
      ScrollTrigger.refresh()
    })
)

onUnmounted(() => {
  cleanup()
})
</script>

<template>
  <div ref="rootRef" class="relative mx-auto w-full max-w-xl lg:max-w-none">
    <div
      class="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-[#89aacc]/[0.1] via-transparent to-[#4e85bf]/[0.08] blur-2xl"
      :class="props.overBackdrop ? 'opacity-[0.32] md:opacity-100' : ''"
    />
    <!-- Sem borda: com overBackdrop o vídeo aparece entre as pills no mobile -->
    <div
      class="relative isolate min-h-[300px] overflow-hidden rounded-[1.75rem] sm:min-h-[340px] md:min-h-[380px]"
      :class="props.overBackdrop ? 'bg-transparent md:bg-white/40' : 'bg-white/40'"
    >
      <svg
        class="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient :id="`${gid}-line`" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#89aacc" stop-opacity="0.5" />
            <stop offset="100%" stop-color="#4e85bf" stop-opacity="0.3" />
          </linearGradient>
        </defs>
        <line
          v-for="(link, idx) in links"
          :key="`ln-${link.a}-${link.b}-${idx}`"
          data-const-line
          :x1="positions[link.a]!.x"
          :y1="positions[link.a]!.y"
          :x2="positions[link.b]!.x"
          :y2="positions[link.b]!.y"
          :stroke="`url(#${gid}-line)`"
          stroke-width="0.32"
          class="opacity-[0.45]"
        />
      </svg>

      <div class="absolute inset-0">
        <div
          v-for="(skill, i) in skills"
          :key="`${skill}-${i}`"
          data-const-node
          class="absolute z-[1] max-w-[min(44%,150px)] -translate-x-1/2 -translate-y-1/2 will-change-transform"
          :style="{
            left: `${positions[i]?.x ?? 50}%`,
            top: `${positions[i]?.y ?? 50}%`
          }"
        >
          <span
            class="block rounded-full bg-white/92 px-2.5 py-1.5 text-center text-[10px] font-medium leading-tight text-text-primary/90 shadow-[0_1px_0_rgba(255,255,255,0.9)] sm:px-3.5 sm:py-1.5 sm:text-[11px]"
          >
            {{ skill }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
