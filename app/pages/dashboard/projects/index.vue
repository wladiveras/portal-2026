<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { ProjectSummary } from '~/../server/api/dashboard/projects/index.get'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  role: ['admin', 'editor', 'viewer']
})

const { data: projects, pending } = await useFetch<ProjectSummary[]>('/api/dashboard/projects', {
  default: () => [] as ProjectSummary[]
})

function progress(p: ProjectSummary): number {
  if (!p.tasks_total) return 0
  return Math.round((p.tasks_done / p.tasks_total) * 100)
}
</script>

<template>
  <NuxtLayout name="dashboard" eyebrow="Projetos" title="Portfólio ágil">
    <div class="space-y-6">
      <header class="flex items-center justify-between">
        <p class="text-sm text-muted">
          {{ projects?.length ?? 0 }} projetos ativos. Clique num card para abrir o Kanban.
        </p>
      </header>

      <p v-if="pending" class="text-sm text-muted">Carregando…</p>

      <section
        v-else-if="projects && projects.length"
        class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        <NuxtLink
          v-for="p in projects"
          :key="p.id"
          :to="`/dashboard/projects/${p.id}`"
          class="glass-surface group relative flex flex-col gap-3 overflow-hidden rounded-3xl p-6 transition-transform hover:-translate-y-0.5"
        >
          <span
            class="absolute left-0 top-0 h-1 w-full"
            :style="{ background: p.color ?? 'hsl(var(--accent))' }"
            aria-hidden="true"
          />
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="text-[10px] uppercase tracking-[0.32em] text-muted">{{ p.slug }}</p>
              <h3 class="font-display text-2xl italic text-text-primary">{{ p.name }}</h3>
            </div>
            <Icon icon="lucide:arrow-up-right" class="h-4 w-4 text-muted group-hover:text-text-primary" />
          </div>
          <p v-if="p.description" class="line-clamp-3 text-sm text-muted">{{ p.description }}</p>
          <div class="mt-auto space-y-2">
            <div class="flex items-center justify-between text-[11px] text-muted">
              <span>{{ p.tasks_done }} / {{ p.tasks_total }} tasks</span>
              <span>{{ progress(p) }}%</span>
            </div>
            <div class="h-1.5 overflow-hidden rounded-full bg-stroke/60">
              <div
                class="h-full rounded-full bg-gradient-to-r from-[hsl(212_50%_76%)] to-[hsl(212_45%_50%)] transition-[width]"
                :style="{ width: `${progress(p)}%` }"
              />
            </div>
          </div>
        </NuxtLink>
      </section>

      <div
        v-else
        class="rounded-3xl border border-dashed border-stroke bg-surface/60 p-10 text-center text-muted"
      >
        <p class="font-display text-2xl italic text-text-primary">Nenhum projeto ainda.</p>
        <p class="mt-2 text-sm">Crie o primeiro projeto no Supabase SQL Editor (fase 09 traz a UI de criação).</p>
      </div>
    </div>
  </NuxtLayout>
</template>
