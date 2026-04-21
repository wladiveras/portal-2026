<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import type { Database } from '~/types/database.types'

type Task = Database['public']['Tables']['tasks']['Row']
type TaskStatus = Database['public']['Enums']['task_status']

interface Props {
  task: Task | null
  canEdit?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  updated: [task: Task]
}>()

const STATUS: TaskStatus[] = ['todo', 'doing', 'review', 'done']
const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'Todo',
  doing: 'Doing',
  review: 'Review',
  done: 'Done'
}

const draft = ref<Task | null>(null)
const saving = ref(false)
const error = ref<string | null>(null)

watch(
  () => props.task,
  (t) => {
    draft.value = t ? { ...t } : null
    error.value = null
  },
  { immediate: true }
)

const dirty = computed(() => {
  if (!draft.value || !props.task) return false
  const keys: (keyof Task)[] = ['title', 'description', 'status', 'points']
  return keys.some((k) => draft.value![k] !== props.task![k])
})

async function save() {
  if (!draft.value || !dirty.value || saving.value) return
  saving.value = true
  error.value = null
  try {
    const url: string = `/api/dashboard/tasks/${draft.value.id}`
    const updated = (await $fetch(url, {
      method: 'PATCH',
      body: {
        title: draft.value.title,
        description: draft.value.description,
        status: draft.value.status,
        points: draft.value.points
      }
    })) as Task
    emit('updated', updated)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Falha ao salvar.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Transition
    enter-active-class="transition-transform duration-300 ease-out"
    leave-active-class="transition-transform duration-200 ease-in"
    enter-from-class="translate-x-full"
    leave-to-class="translate-x-full"
  >
    <aside
      v-if="draft"
      class="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-stroke bg-bg/95 shadow-[0_40px_80px_-32px_rgba(41,67,101,0.45)] backdrop-blur"
    >
      <header class="flex items-center justify-between border-b border-stroke/70 p-5">
        <p class="text-[10px] uppercase tracking-[0.32em] text-muted">Task</p>
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-full border border-stroke text-muted"
          aria-label="Fechar"
          @click="emit('close')"
        >
          <Icon icon="lucide:x" class="h-4 w-4" />
        </button>
      </header>

      <section class="flex-1 space-y-4 overflow-y-auto p-5 text-sm">
        <label class="block space-y-1">
          <span class="text-[10px] uppercase tracking-[0.28em] text-muted">Título</span>
          <input
            v-model="draft.title"
            :disabled="!canEdit"
            class="w-full rounded-2xl border border-stroke bg-surface px-3 py-2 text-text-primary outline-none focus:border-accent"
          />
        </label>

        <label class="block space-y-1">
          <span class="text-[10px] uppercase tracking-[0.28em] text-muted">Descrição</span>
          <textarea
            v-model="draft.description"
            :disabled="!canEdit"
            rows="4"
            class="w-full resize-none rounded-2xl border border-stroke bg-surface px-3 py-2 text-text-primary outline-none focus:border-accent"
          />
        </label>

        <div class="grid grid-cols-2 gap-3">
          <label class="block space-y-1">
            <span class="text-[10px] uppercase tracking-[0.28em] text-muted">Status</span>
            <select
              v-model="draft.status"
              :disabled="!canEdit"
              class="w-full rounded-2xl border border-stroke bg-surface px-3 py-2 text-text-primary outline-none focus:border-accent"
            >
              <option v-for="s in STATUS" :key="s" :value="s">{{ STATUS_LABEL[s] }}</option>
            </select>
          </label>
          <label class="block space-y-1">
            <span class="text-[10px] uppercase tracking-[0.28em] text-muted">Pontos</span>
            <input
              v-model.number="draft.points"
              :disabled="!canEdit"
              type="number"
              min="0"
              max="99"
              class="w-full rounded-2xl border border-stroke bg-surface px-3 py-2 text-text-primary outline-none focus:border-accent"
            />
          </label>
        </div>

        <p v-if="error" class="text-xs text-rose-500">{{ error }}</p>
      </section>

      <footer class="flex items-center justify-end gap-2 border-t border-stroke/60 p-5">
        <button
          type="button"
          class="rounded-full border border-stroke px-4 py-1.5 text-xs text-muted"
          @click="emit('close')"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="rounded-full bg-text-primary px-4 py-1.5 text-xs font-medium text-white disabled:opacity-40"
          :disabled="!canEdit || !dirty || saving"
          @click="save"
        >
          Salvar
        </button>
      </footer>
    </aside>
  </Transition>
</template>
