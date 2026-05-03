<script setup lang="ts">
import { computed } from 'vue'
import StatCard from './StatCard.vue'
import type { DashboardStatsResponse } from '~~/server/api/dashboard/stats.get'

const FALLBACK: DashboardStatsResponse = {
  range: '7d',
  leads: { current: 0, previous: 0 },
  conversions: { current: 0, previous: 0 },
  active_projects: 0,
  open_tasks: 0
}

const { data, pending } = await useFetch<DashboardStatsResponse>('/api/dashboard/stats', {
  query: { range: '7d' },
  default: () => FALLBACK
})

function pct(curr: number, prev: number): number | null {
  if (!prev) return curr > 0 ? 100 : null
  return Math.round(((curr - prev) / prev) * 100)
}

const cards = computed(() => {
  const stats = data.value
  if (!stats) return []
  return [
    {
      label: 'Leads (7d)',
      value: stats.leads.current,
      delta: pct(stats.leads.current, stats.leads.previous),
      icon: 'lucide:users-round'
    },
    {
      label: 'Conversões (7d)',
      value: stats.conversions.current,
      delta: pct(stats.conversions.current, stats.conversions.previous),
      icon: 'lucide:trophy'
    },
    {
      label: 'Projetos ativos',
      value: stats.active_projects,
      delta: null as number | null,
      icon: 'lucide:kanban'
    },
    {
      label: 'Tasks abertas',
      value: stats.open_tasks,
      delta: null as number | null,
      icon: 'lucide:list-todo'
    }
  ]
})
</script>

<template>
  <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <StatCard
      v-for="card in cards"
      :key="card.label"
      :label="card.label"
      :value="card.value"
      :delta="card.delta"
      :icon="card.icon"
      :loading="pending"
    />
  </section>
</template>
