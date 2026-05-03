<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useDashboardProjectsStore } from '~~/layers/2-dashboard/app/stores/dashboard/projects'
import { useDashboardSprintsStore } from '~~/layers/2-dashboard/app/stores/dashboard/sprints'
import { useDashboardTasksStore } from '~~/layers/2-dashboard/app/stores/dashboard/tasks'
import type { Database } from '~/types/database.types'

type Task = Database['public']['Tables']['tasks']['Row']

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  role: ['admin', 'editor', 'viewer'],
  dashboardEyebrow: 'Projeto',
  dashboardTitle: 'Detalhes'
})

const route = useRoute()
const projectId = computed(() => String(route.params.id))

const { can } = useRole()
const projectsStore = useDashboardProjectsStore()
const tasksStore = useDashboardTasksStore()
const sprintsStore = useDashboardSprintsStore()
const data = computed(() => projectsStore.detailById(projectId.value))
const detailLoading = computed(() => projectsStore.loadingDetailById[projectId.value] ?? false)

const tasks = computed(() => data.value?.tasks ?? [])
const selectedId = ref<string | null>(null)
const selected = computed<Task | null>(() =>
  selectedId.value ? tasks.value.find((t) => t.id === selectedId.value) ?? null : null
)

const tab = ref<'kanban' | 'sprint' | 'backlog'>('kanban')
const creatingTask = ref(false)
const deletingTask = ref(false)
const taskError = ref<string | null>(null)
const showNewTask = ref(false)
const taskForm = reactive({
  title: '',
  points: null as number | null,
  status: 'todo' as Database['public']['Enums']['task_status'],
  sprint_id: null as string | null
})

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
  try {
    await tasksStore.updateTask(projectId.value, id, patch)
  } catch {
    await projectsStore.fetchProjectDetail(projectId.value)
  }
}

function onTaskUpdated(updated: Task) {
  const local = tasks.value.find((t) => t.id === updated.id)
  if (local) Object.assign(local, updated)
  selectedId.value = null
}

async function createTask() {
  if (!can('manage_projects') || creatingTask.value) return
  creatingTask.value = true
  taskError.value = null
  try {
    await tasksStore.createTask({
      project_id: projectId.value,
      title: taskForm.title,
      status: taskForm.status,
      sprint_id: taskForm.sprint_id,
      points: taskForm.points
    })
    taskForm.title = ''
    taskForm.points = null
    taskForm.status = 'todo'
    taskForm.sprint_id = null
    showNewTask.value = false
  } catch (error: unknown) {
    taskError.value = error instanceof Error ? error.message : 'Falha ao criar task'
  } finally {
    creatingTask.value = false
  }
}

async function deleteSelectedTask() {
  if (!can('manage_projects') || !selected.value || deletingTask.value) return
  deletingTask.value = true
  taskError.value = null
  try {
    await tasksStore.deleteTask(projectId.value, selected.value.id)
    selectedId.value = null
  } catch (error: unknown) {
    taskError.value = error instanceof Error ? error.message : 'Falha ao excluir task'
  } finally {
    deletingTask.value = false
  }
}

async function createSprint(payload: {
  name: string
  starts_at: string
  ends_at: string
  goal: string | null
}) {
  await sprintsStore.createSprint({
    project_id: projectId.value,
    ...payload
  })
}

async function closeCurrentSprint() {
  if (!currentSprint.value) return
  await sprintsStore.closeSprint(projectId.value, currentSprint.value.id)
}

watch(
  projectId,
  async (nextId) => {
    await projectsStore.fetchProjectDetail(nextId)
  },
  { immediate: true }
)
</script>

<template>
  <div class="space-y-5">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-[10px] uppercase tracking-[0.32em] text-muted">{{ data?.project.slug ?? 'projeto' }}</p>
        <h2 class="font-display text-2xl italic text-text-primary">{{ data?.project.name ?? 'Projeto' }}</h2>
        <p v-if="data?.project.description" class="max-w-2xl text-sm text-muted">
          {{ data.project.description }}
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <NuxtLink
          :to="`/dashboard/projects/${projectId}/landing`"
          class="inline-flex items-center gap-2 rounded-full border border-stroke bg-bg/70 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:border-accent hover:text-text-primary"
        >
          <Icon icon="lucide:layout-template" class="h-3.5 w-3.5" />
          Landing
        </NuxtLink>
        <button
          v-if="can('manage_projects')"
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-stroke bg-bg/70 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:border-accent hover:text-text-primary"
          @click="showNewTask = true"
        >
          <Icon icon="lucide:plus" class="h-3.5 w-3.5" />
          Nova task
        </button>
      </div>
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

    <p v-if="detailLoading && !data" class="text-sm text-muted">Carregando projeto…</p>

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
      :can-edit="can('manage_projects')"
      :on-create-sprint="createSprint"
      :on-close-sprint="closeCurrentSprint"
      @changed="() => projectsStore.fetchProjectDetail(projectId)"
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

    <div
      v-if="showNewTask"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      @click.self="showNewTask = false"
    >
      <section class="glass-surface w-full max-w-lg rounded-3xl border border-stroke/80 p-6">
        <header class="mb-4 flex items-center justify-between">
          <h3 class="font-display text-2xl italic text-text-primary">Nova task</h3>
          <button
            type="button"
            class="rounded-full border border-stroke bg-bg/65 p-2 text-muted transition-colors hover:border-accent hover:text-text-primary"
            aria-label="Fechar"
            @click="showNewTask = false"
          >
            <Icon icon="lucide:x" class="h-4 w-4" />
          </button>
        </header>
        <form class="space-y-3" @submit.prevent="createTask">
          <label class="block space-y-1">
            <span class="text-[10px] uppercase tracking-[0.28em] text-muted">Título</span>
            <input
              v-model="taskForm.title"
              required
              maxlength="280"
              class="h-11 w-full rounded-xl border border-stroke bg-bg/80 px-3 text-sm text-text-primary outline-none transition-colors focus:border-accent"
              placeholder="Implementar endpoint de archive"
            />
          </label>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label class="block space-y-1">
              <span class="text-[10px] uppercase tracking-[0.28em] text-muted">Status</span>
              <select
                v-model="taskForm.status"
                class="h-11 w-full rounded-xl border border-stroke bg-bg/80 px-3 text-sm text-text-primary outline-none transition-colors focus:border-accent"
              >
                <option value="todo">Todo</option>
                <option value="doing">Doing</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </label>
            <label class="block space-y-1">
              <span class="text-[10px] uppercase tracking-[0.28em] text-muted">Pontos</span>
              <input
                v-model.number="taskForm.points"
                type="number"
                min="0"
                max="99"
                class="h-11 w-full rounded-xl border border-stroke bg-bg/80 px-3 text-sm text-text-primary outline-none transition-colors focus:border-accent"
              />
            </label>
            <label class="block space-y-1">
              <span class="text-[10px] uppercase tracking-[0.28em] text-muted">Sprint</span>
              <select
                v-model="taskForm.sprint_id"
                class="h-11 w-full rounded-xl border border-stroke bg-bg/80 px-3 text-sm text-text-primary outline-none transition-colors focus:border-accent"
              >
                <option :value="null">Backlog</option>
                <option v-for="s in data?.sprints ?? []" :key="s.id" :value="s.id">
                  {{ s.name }}
                </option>
              </select>
            </label>
          </div>
          <p v-if="taskError" class="text-xs text-rose-500">{{ taskError }}</p>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              class="rounded-full border border-stroke bg-bg/70 px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:border-accent hover:text-text-primary"
              @click="showNewTask = false"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="gradient-border inline-flex items-center gap-2 rounded-full border border-stroke bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-text-primary transition-colors hover:bg-bg disabled:opacity-50"
              :disabled="creatingTask"
            >
              <Icon :icon="creatingTask ? 'lucide:loader-2' : 'lucide:plus'" class="h-3.5 w-3.5" :class="creatingTask ? 'animate-spin' : ''" />
              {{ creatingTask ? 'Criando…' : 'Criar task' }}
            </button>
          </div>
        </form>
      </section>
    </div>

    <div v-if="selected && can('manage_projects')" class="fixed bottom-6 left-1/2 z-30 -translate-x-1/2">
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-full border border-rose-400/45 bg-rose-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-200 transition-colors hover:bg-rose-500/25 disabled:opacity-50"
        :disabled="deletingTask"
        @click="deleteSelectedTask"
      >
        <Icon :icon="deletingTask ? 'lucide:loader-2' : 'lucide:trash-2'" class="h-3.5 w-3.5" :class="deletingTask ? 'animate-spin' : ''" />
        {{ deletingTask ? 'Excluindo…' : 'Excluir task' }}
      </button>
    </div>
  </div>
</template>
