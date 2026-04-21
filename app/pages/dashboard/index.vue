<script setup lang="ts">
import type { DashboardChartsResponse } from '~~/server/api/dashboard/charts.get'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  role: ['admin', 'editor', 'viewer']
})

const { data: charts } = await useFetch<DashboardChartsResponse>('/api/dashboard/charts', {
  default: () => ({ leadsByDay: [], sources: [], funnel: [] })
})
</script>

<template>
  <NuxtLayout name="dashboard" eyebrow="Overview" title="Visão geral">
    <div class="space-y-6">
      <section class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div class="lg:col-span-2">
          <DashboardWelcomeCard />
        </div>
        <div class="lg:col-span-1">
          <DashboardQuickNotes />
        </div>
      </section>

      <DashboardStatGrid />

      <section class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div class="lg:col-span-2">
          <DashboardChartsBaseChartCard
            eyebrow="Leads"
            title="Volume diário (30d)"
            hint="Quantos leads novos aparecem por dia"
          >
            <DashboardChartsLeadsAreaChart :series="charts?.leadsByDay ?? []" />
          </DashboardChartsBaseChartCard>
        </div>
        <div class="lg:col-span-1">
          <DashboardChartsBaseChartCard
            eyebrow="Origem"
            title="Fontes UTM"
            hint="Top 6 valores de utm_source nos últimos 30 dias"
          >
            <DashboardChartsSourceDonut :slices="charts?.sources ?? []" />
          </DashboardChartsBaseChartCard>
        </div>
      </section>

      <section class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div class="lg:col-span-2">
          <DashboardChartsBaseChartCard eyebrow="Pipeline" title="Funil de status">
            <DashboardChartsFunnelBars :bars="charts?.funnel ?? []" />
          </DashboardChartsBaseChartCard>
        </div>
        <div class="lg:col-span-1">
          <DashboardActivityFeed />
        </div>
      </section>
    </div>
  </NuxtLayout>
</template>
