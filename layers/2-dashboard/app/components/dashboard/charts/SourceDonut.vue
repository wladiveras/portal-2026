<script setup lang="ts">
import { computed } from 'vue'
import { VisSingleContainer, VisDonut } from '@unovis/vue'

interface Slice {
  label: string
  value: number
}

interface Props {
  slices: Slice[]
}

const props = defineProps<Props>()

const data = computed(() => props.slices)
const total = computed(() => props.slices.reduce((acc, s) => acc + s.value, 0))

// Use accent + accent-soft + muted derived shades so cores ficam alinhadas ao
// design system. Indices ciclam quando ha mais slices que cores.
const PALETTE = [
  'hsl(var(--accent))',
  'hsl(212 50% 76%)',
  'hsl(215 24% 60%)',
  'hsl(222 27% 28%)',
  'hsl(212 38% 86%)',
  'hsl(215 16% 47%)'
]
const color = (_: Slice, i: number) => PALETTE[i % PALETTE.length] ?? 'hsl(var(--muted))'
const value = (d: Slice) => d.value
</script>

<template>
  <ClientOnly>
    <div class="relative h-full w-full">
      <VisSingleContainer :data="data" :height="240">
        <VisDonut :value="value" :color="color" :arc-width="18" />
      </VisSingleContainer>
      <div
        class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
      >
        <p class="text-[10px] uppercase tracking-[0.28em] text-muted">total</p>
        <p class="font-display text-2xl italic text-text-primary">{{ total }}</p>
      </div>
    </div>
    <ul class="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted">
      <li v-for="(s, i) in slices" :key="s.label" class="flex items-center gap-2">
        <span
          class="h-2 w-2 shrink-0 rounded-full"
          :style="{ background: PALETTE[i % PALETTE.length] }"
          aria-hidden="true"
        />
        <span class="flex-1 truncate text-text-primary">{{ s.label }}</span>
        <span>{{ s.value }}</span>
      </li>
    </ul>
  </ClientOnly>
</template>
