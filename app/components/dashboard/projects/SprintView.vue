<script setup lang="ts">
import { computed } from 'vue'
import BurndownChart from './BurndownChart.vue'
import type { Database } from '~/types/database.types'
import type { BurndownResponse } from '~~/server/api/dashboard/projects/[id]/burndown.get'

type Task = Database['public']['Tables']['tasks']['Row']
type Sprint = Database['public']['Tables']['sprints']['Row']

interface Props {
  projectId: string
  tasks: Task[]
  sprint: Sprint | null
}

const props = defineProps<Props>()

const sprintTasks = computed(() =>
  props.sprint ? props.tasks.filter((t) => t.sprint_id === props.sprint!.id) : []
)

const totalPoints = computed(() =>
  sprintTasks.value.reduce((acc, t) => acc + (t.points ?? 0), 0)
)
const donePoints = computed(() =>
  sprintTasks.value.reduce((acc, t) => acc + (t.status === 'done' ? t.points ?? 0 : 0), 0)
)

const { data: burndown } = await useFetch<BurndownResponse>(
  () =>
    props.sprint
      ? `/api/dashboard/projects/${props.projectId}/burndown?sprint=${props.sprint.id}`
      : `/api/dashboard/projects/${props.projectId}/burndown`,
  {
    watch: [() => props.sprint?.id],
    default: () => ({ sprint_id: null, total_points: 0, points: [] as BurndownResponse['points'] })
  }
)
</script>

<template>
  <section class="space-y-4">
    <article
      v-if="sprint"
      class="glass-surface flex flex-wrap items-center justify-between gap-3 rounded-3xl p-6"
    >
      <div>
        <p class="text-[10px] uppercase tracking-[0.32em] text-muted">Sprint atual</p>
        <h3 class="font-display text-2xl italic text-text-primary">{{ sprint.name }}</h3>
        <p class="text-xs text-muted">
          {{ new Date(sprint.starts_at).toLocaleDateString('pt-BR') }} →
          {{ new Date(sprint.ends_at).toLocaleDateString('pt-BR') }}
        </p>
      </div>
      <div class="text-right">
        <p class="text-[10px] uppercase tracking-[0.32em] text-muted">Progresso</p>
        <p class="font-display text-3xl italic text-text-primary">
          <span class="accent-gradient bg-clip-text text-transparent">{{ donePoints }}</span>
          <span class="text-base text-muted"> / {{ totalPoints }} pts</span>
        </p>
      </div>
    </article>

    <article
      v-if="sprint"
      class="rounded-3xl border border-stroke bg-surface/80 p-6"
    >
      <header class="mb-3 flex items-baseline justify-between">
        <h4 class="font-display text-xl italic text-text-primary">Burndown</h4>
        <p class="text-xs text-muted">Linha tracejada = ideal · linha sólida = real</p>
      </header>
      <BurndownChart :series="burndown?.points ?? []" />
    </article>

    <article v-if="sprint" class="rounded-3xl border border-stroke bg-surface/70 p-6">
      <h4 class="font-display text-xl italic text-text-primary">Tasks no sprint</h4>
      <ul class="mt-3 space-y-2 text-sm text-text-primary">
        <li
          v-for="t in sprintTasks"
          :key="t.id"
          class="flex items-center justify-between rounded-xl border border-stroke bg-bg p-3"
        >
          <span>{{ t.title }}</span>
          <span class="text-xs text-muted">{{ t.status }} · {{ t.points ?? '—' }} pts</span>
        </li>
        <li v-if="!sprintTasks.length" class="text-xs text-muted">
          Sprint sem tasks atribuídas ainda.
        </li>
      </ul>
    </article>

    <div
      v-if="!sprint"
      class="rounded-3xl border border-dashed border-stroke bg-surface/60 p-10 text-center text-muted"
    >
      <p class="font-display text-xl italic text-text-primary">Nenhum sprint configurado.</p>
      <p class="mt-2 text-sm">Crie um sprint em `public.sprints` para ativar esta visão.</p>
    </div>
  </section>
</template>
