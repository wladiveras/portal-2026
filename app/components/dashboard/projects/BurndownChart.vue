<script setup lang="ts">
import { VisAxis, VisLine, VisXYContainer } from '@unovis/vue'
import type { BurndownPoint } from '~~/server/api/dashboard/projects/[id]/burndown.get'

interface Props {
  series: BurndownPoint[]
}

const props = defineProps<Props>()

const x = (_: BurndownPoint, i: number) => i
const yIdeal = (d: BurndownPoint) => d.ideal
const yActual = (d: BurndownPoint) => d.actual

const tickFormatX = (i: number) => {
  const p = props.series[i]
  if (!p) return ''
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(p.date))
}
</script>

<template>
  <ClientOnly>
    <VisXYContainer
      :data="props.series"
      :height="220"
      :margin="{ top: 12, bottom: 24, left: 32, right: 12 }"
    >
      <VisLine :x="x" :y="yIdeal" color="hsl(var(--muted))" :stroke-dasharray="[4, 4]" />
      <VisLine :x="x" :y="yActual" color="hsl(var(--accent))" />
      <VisAxis type="x" :tick-format="tickFormatX" :num-ticks="5" />
      <VisAxis type="y" :num-ticks="4" />
    </VisXYContainer>
  </ClientOnly>
</template>
