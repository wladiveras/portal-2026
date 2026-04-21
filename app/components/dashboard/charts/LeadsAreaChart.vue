<script setup lang="ts">
import { computed } from 'vue'
import { VisXYContainer, VisArea, VisAxis } from '@unovis/vue'

interface Point {
  date: string
  count: number
}

interface Props {
  series: Point[]
}

const props = defineProps<Props>()

const data = computed(() => props.series)

const x = (d: Point, i: number) => i
const y = (d: Point) => d.count
const tickFormatX = (i: number) => {
  const point = props.series[i]
  if (!point) return ''
  const d = new Date(point.date)
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(d)
}
</script>

<template>
  <ClientOnly>
    <VisXYContainer :data="data" :height="240" :margin="{ top: 12, bottom: 24, left: 32, right: 12 }">
      <VisArea :x="x" :y="y" color="hsl(var(--accent))" curveType="monotoneX" :opacity="0.55" />
      <VisAxis type="x" :tick-format="tickFormatX" :num-ticks="5" />
      <VisAxis type="y" :num-ticks="4" />
    </VisXYContainer>
  </ClientOnly>
</template>
