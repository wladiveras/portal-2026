<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

interface Props {
  label: string
  value: number | string
  suffix?: string
  delta?: number | null
  icon?: string
  loading?: boolean
}

const props = defineProps<Props>()

const deltaColor = computed(() => {
  if (props.delta == null || props.delta === 0) return 'text-muted'
  return props.delta > 0 ? 'text-emerald-500' : 'text-rose-500'
})

const deltaLabel = computed(() => {
  if (props.delta == null) return null
  const sign = props.delta > 0 ? '+' : ''
  return `${sign}${props.delta}%`
})
</script>

<template>
  <article
    class="glass-surface relative flex h-full flex-col gap-3 rounded-3xl p-6"
  >
    <header class="flex items-start justify-between">
      <p class="text-[10px] uppercase tracking-[0.32em] text-muted">{{ label }}</p>
      <Icon
        v-if="icon"
        :icon="icon"
        class="h-4 w-4 text-muted"
        aria-hidden="true"
      />
    </header>
    <p
      v-if="loading"
      class="h-10 w-1/2 animate-pulse rounded-full bg-stroke"
      aria-hidden="true"
    />
    <p
      v-else
      class="font-display text-4xl italic leading-none tracking-tight"
    >
      <span class="accent-gradient bg-clip-text text-transparent">{{ value }}</span>
      <span v-if="suffix" class="ml-1 text-base text-muted">{{ suffix }}</span>
    </p>
    <p v-if="deltaLabel" class="text-xs" :class="deltaColor">
      {{ deltaLabel }} vs período anterior
    </p>
  </article>
</template>
