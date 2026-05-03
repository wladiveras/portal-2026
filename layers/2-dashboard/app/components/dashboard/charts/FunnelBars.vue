<script setup lang="ts">
import { computed } from 'vue'

interface Bar {
  status: string
  value: number
}

interface Props {
  bars: Bar[]
}

const STATUS_LABEL: Record<string, string> = {
  new: 'Novo',
  contacted: 'Contactado',
  qualified: 'Qualificado',
  proposal: 'Proposta',
  won: 'Fechado',
  lost: 'Perdido'
}

const props = defineProps<Props>()
const max = computed(() => Math.max(1, ...props.bars.map((b) => b.value)))
</script>

<template>
  <ul class="flex h-full flex-col gap-2">
    <li v-for="bar in bars" :key="bar.status" class="grid grid-cols-[110px_1fr_auto] items-center gap-3">
      <span class="text-xs text-muted">{{ STATUS_LABEL[bar.status] ?? bar.status }}</span>
      <div class="relative h-3 overflow-hidden rounded-full bg-stroke/60">
        <div
          class="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[hsl(212_50%_76%)] to-[hsl(212_45%_50%)] transition-[width]"
          :style="{ width: `${(bar.value / max) * 100}%` }"
        />
      </div>
      <span class="text-xs tabular-nums text-text-primary">{{ bar.value }}</span>
    </li>
  </ul>
</template>
