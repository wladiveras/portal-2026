<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { Database } from '~/types/database.types'
import type { ProjectDetailResponse } from '~~/server/api/dashboard/projects/[id]/index.get'

type Task = Database['public']['Tables']['tasks']['Row']

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  role: ['admin', 'editor', 'viewer']
})

const route = useRoute()
const projectId = computed(() => String(route.params.id))

const { can } = useRole()

const { data, refresh } = await useFetch<ProjectDetailResponse>(
  () => `/api/dashboard/projects/${projectId.value}`,
  {
    watch: [projectId],
    default: () => ({
      project: { id: '', name: '', slug: '', owner_id: null, color: null, description: null, archived: false, created_at: '', updated_at: '' } as ProjectDetailResponse['project'],
      tasks: [] as Task[],
      sprints: []
    })
  }
)

const tasks = computed(() => data.value?.tasks ?? [])
const selectedId = ref<string | null>(null)
const selected = computed<Task | null>(() =>
  selectedId.value ? tasks.value.find((t) => t.id === selectedId.value) ?? null : null
)

const tab = ref<'kanban' | 'sprint' | 'backlog'>('kanban')

const currentSprint = computed(() => {
  const list = data.value?.sprints ?? []
  const now = new Date()
  return (
    list.find(
      (s) => new Date(s.starts_at) <= now && new Date(s.ends_at) >= now
    ) ?? list[0]
  )
})

async function onTaskMoved(id: string, patch: Partial<Task>) {
  const local = tasks.value.find((t) => t.id === id)
  if (local) Object.assign(local, patch)
  try {
    const url: string = `/api/dashboard/tasks/${id}`
    await $fetch(url, { method: 'PATCH', body: patch })
  } catch {
    refresh()
  }
}

function onTaskUpdated(updated: Task) {
  const local = tasks.value.find((t) => t.id === updated.id)
  if (local) Object.assign(local, updated)
  selectedId.value = null
}
</script>

<template>
  <NuxtLayout
    name="dashboard"
    :eyebrow="data?.project.slug ?? 'Projeto'"
    :title="data?.project.name ?? 'Projeto'"
  >
    <div class="space-y-5">
      <header class="flex flex-wrap items-center justify-between gap-3">
        <p v-if="data?.project.description" class="max-w-2xl text-sm text-muted">
          {{ data.project.description }}
        </p>
        <nav class="flex gap-1 rounded-full border border-stroke bg-surface/70 p-1 text-xs">
          <button
            v-for="t in (['kanban','sprint','backlog'] as const)"
            :key="t"
            type="button"
            class="inline-flex items-center gap-1 rounded-full px-3 py-1 transition-colors"
            :class="tab === t ? 'bg-text-primary text-white' : 'text-muted hover:text-text-primary'"
            @click="tab = t"
          >
            <Icon
              :icon="t === 'kanban' ? 'lucide:kanban' : t === 'sprint' ? 'lucide:target' : 'lucide:list-checks'"
              class="h-3.5 w-3.5"
            />
            {{ t }}
          </button>
        </nav>
      </header>

      <DashboardProjectsKanbanBoard
        v-if="tab === 'kanban'"
        :tasks="tasks"
        :can-edit="can('manage_projects')"
        @task-open="(id) => (selectedId = id)"
        @task-moved="onTaskMoved"
      />

      <DashboardProjectsSprintView
        v-else-if="tab === 'sprint'"
        :project-id="projectId"
        :tasks="tasks"
        :sprint="currentSprint ?? null"
      />

      <section
        v-else
        class="rounded-2xl border border-stroke bg-surface/60 p-6"
      >
        <h3 class="font-display text-xl italic text-text-primary">Backlog</h3>
        <ul class="mt-3 space-y-2 text-sm text-text-primary">
          <li
            v-for="t in tasks.filter((x) => !x.sprint_id)"
            :key="t.id"
            class="rounded-xl border border-stroke bg-bg p-3"
          >
            {{ t.title }}
          </li>
          <li v-if="!tasks.filter((x) => !x.sprint_id).length" class="text-xs text-muted">
            Todas as tasks estão num sprint.
          </li>
        </ul>
      </section>

      <DashboardProjectsTaskDrawer
        :task="selected"
        :can-edit="can('manage_projects')"
        @close="selectedId = null"
        @updated="onTaskUpdated"
      />
    </div>
  </NuxtLayout>
</template>
