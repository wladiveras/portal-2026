<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { Database } from '~/types/database.types'
import type { BurndownResponse } from '~~/server/api/dashboard/projects/[id]/burndown.get'

type Task = Database['public']['Tables']['tasks']['Row']
type Sprint = Database['public']['Tables']['sprints']['Row']

interface Props {
  projectId: string
  tasks: Task[]
  sprint: Sprint | null
  canEdit?: boolean
  onCreateSprint?: (payload: {
    name: string
    starts_at: string
    ends_at: string
    goal: string | null
  }) => Promise<void>
  onCloseSprint?: () => Promise<void>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  changed: []
}>()

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

const showCreate = ref(false)
const creating = ref(false)
const createError = ref<string | null>(null)
const closing = ref(false)
const closeError = ref<string | null>(null)
const form = reactive({
  name: '',
  starts_at: '',
  ends_at: '',
  goal: ''
})

watch(
  () => props.sprint?.id,
  () => {
    showCreate.value = false
    createError.value = null
    closeError.value = null
  }
)

async function createSprint() {
  if (!props.canEdit || creating.value) return
  creating.value = true
  createError.value = null
  try {
    if (!props.onCreateSprint) throw new Error('create handler missing')
    await props.onCreateSprint({
      name: form.name,
      starts_at: form.starts_at,
      ends_at: form.ends_at,
      goal: form.goal || null
    })
    form.name = ''
    form.starts_at = ''
    form.ends_at = ''
    form.goal = ''
    showCreate.value = false
    emit('changed')
  } catch (error: unknown) {
    createError.value = error instanceof Error ? error.message : 'Falha ao criar sprint'
  } finally {
    creating.value = false
  }
}

async function closeSprint() {
  if (!props.canEdit || !props.sprint || closing.value) return
  closing.value = true
  closeError.value = null
  try {
    if (!props.onCloseSprint) throw new Error('close handler missing')
    await props.onCloseSprint()
    emit('changed')
  } catch (error: unknown) {
    closeError.value = error instanceof Error ? error.message : 'Falha ao encerrar sprint'
  } finally {
    closing.value = false
  }
}
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
          <span class="accent-text">{{ donePoints }}</span>
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
      <DashboardProjectsBurndownChart :series="burndown?.points ?? []" />
    </article>

    <article v-if="sprint" class="rounded-3xl border border-stroke bg-surface/70 p-6">
      <div class="flex items-center justify-between gap-3">
        <h4 class="font-display text-xl italic text-text-primary">Tasks no sprint</h4>
        <button
          v-if="canEdit"
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-stroke bg-bg/70 px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:border-accent hover:text-text-primary disabled:opacity-50"
          :disabled="closing"
          @click="closeSprint"
        >
          <Icon :icon="closing ? 'lucide:loader-2' : 'lucide:flag'" class="h-3.5 w-3.5" :class="closing ? 'animate-spin' : ''" />
          {{ closing ? 'Encerrando…' : 'Encerrar sprint' }}
        </button>
      </div>
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
      <p v-if="closeError" class="mt-3 text-xs text-rose-500">{{ closeError }}</p>
    </article>

    <div
      v-if="!sprint"
      class="rounded-3xl border border-dashed border-stroke bg-surface/60 p-10 text-center text-muted"
    >
      <p class="font-display text-xl italic text-text-primary">Nenhum sprint configurado.</p>
      <p class="mt-2 text-sm">Crie o sprint por aqui para ativar a visão de burndown.</p>
      <button
        v-if="canEdit"
        type="button"
        class="mt-4 inline-flex items-center gap-2 rounded-full border border-stroke bg-bg/70 px-5 py-2 text-xs uppercase tracking-[0.18em] text-text-primary transition-colors hover:border-accent"
        @click="showCreate = true"
      >
        <Icon icon="lucide:plus" class="h-3.5 w-3.5" />
        Novo sprint
      </button>
    </div>

    <div
      v-if="showCreate"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      @click.self="showCreate = false"
    >
      <section class="glass-surface w-full max-w-lg rounded-3xl border border-stroke/80 p-6">
        <header class="mb-4 flex items-center justify-between">
          <div>
            <p class="text-[10px] uppercase tracking-[0.32em] text-muted">Sprints</p>
            <h4 class="font-display text-2xl italic text-text-primary">Novo sprint</h4>
          </div>
          <button
            type="button"
            class="rounded-full border border-stroke bg-bg/65 p-2 text-muted transition-colors hover:border-accent hover:text-text-primary"
            aria-label="Fechar"
            @click="showCreate = false"
          >
            <Icon icon="lucide:x" class="h-4 w-4" />
          </button>
        </header>
        <form class="space-y-3" @submit.prevent="createSprint">
          <label class="block space-y-1">
            <span class="text-[10px] uppercase tracking-[0.28em] text-muted">Nome</span>
            <input
              v-model="form.name"
              required
              maxlength="160"
              class="h-11 w-full rounded-xl border border-stroke bg-bg/80 px-3 text-sm text-text-primary outline-none transition-colors focus:border-accent"
              placeholder="Sprint 12"
            />
          </label>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label class="block space-y-1">
              <span class="text-[10px] uppercase tracking-[0.28em] text-muted">Início</span>
              <input
                v-model="form.starts_at"
                type="date"
                required
                class="h-11 w-full rounded-xl border border-stroke bg-bg/80 px-3 text-sm text-text-primary outline-none transition-colors focus:border-accent"
              />
            </label>
            <label class="block space-y-1">
              <span class="text-[10px] uppercase tracking-[0.28em] text-muted">Fim</span>
              <input
                v-model="form.ends_at"
                type="date"
                required
                class="h-11 w-full rounded-xl border border-stroke bg-bg/80 px-3 text-sm text-text-primary outline-none transition-colors focus:border-accent"
              />
            </label>
          </div>
          <label class="block space-y-1">
            <span class="text-[10px] uppercase tracking-[0.28em] text-muted">Objetivo</span>
            <textarea
              v-model="form.goal"
              rows="3"
              maxlength="2000"
              class="w-full rounded-xl border border-stroke bg-bg/80 px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent"
              placeholder="Objetivo do sprint"
            />
          </label>
          <p v-if="createError" class="text-xs text-rose-500">{{ createError }}</p>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              class="rounded-full border border-stroke bg-bg/70 px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:border-accent hover:text-text-primary"
              @click="showCreate = false"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="gradient-border inline-flex items-center gap-2 rounded-full border border-stroke bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-text-primary transition-colors hover:bg-bg disabled:opacity-50"
              :disabled="creating"
            >
              <Icon :icon="creating ? 'lucide:loader-2' : 'lucide:plus'" class="h-3.5 w-3.5" :class="creating ? 'animate-spin' : ''" />
              {{ creating ? 'Criando…' : 'Criar sprint' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </section>
</template>
