<script setup lang="ts">
import Sortable, { type SortableEvent } from 'sortablejs'
import type { Database } from '~/types/database.types'

type Task = Database['public']['Tables']['tasks']['Row']
type Status = Database['public']['Enums']['task_status']

interface Props {
  tasks: Task[]
  canEdit?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'task-open': [id: string]
  'task-moved': [id: string, next: Partial<Task>]
}>()

const COLUMNS: { id: Status; label: string }[] = [
  { id: 'todo', label: 'Todo' },
  { id: 'doing', label: 'Doing' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' }
]

const localTasks = ref<Task[]>([])
const columnRefs = ref<Record<Status, HTMLElement | null>>({
  todo: null,
  doing: null,
  review: null,
  done: null
})
const sortables: Sortable[] = []

function setColumnRef(status: Status, el: Element | null) {
  columnRefs.value[status] = el as HTMLElement | null
}

watch(
  () => props.tasks,
  (next) => {
    localTasks.value = [...next]
  },
  { immediate: true }
)

const byStatus = computed(() => {
  const groups: Record<Status, Task[]> = { todo: [], doing: [], review: [], done: [] }
  for (const t of localTasks.value) groups[t.status].push(t)
  for (const s of COLUMNS.map((c) => c.id)) {
    groups[s].sort((a, b) => a.position - b.position)
  }
  return groups
})

function computePosition(
  sameColumnTasks: Task[],
  newIndex: number,
  movedTask: Task
): number {
  const without = sameColumnTasks.filter((t) => t.id !== movedTask.id)
  const prev = without[newIndex - 1]
  const next = without[newIndex]
  if (!prev && !next) return 1024
  if (!prev && next) return next.position - 512
  if (prev && !next) return prev.position + 1024
  return Math.round((prev!.position + next!.position) / 2)
}

function handleEnd(ev: SortableEvent) {
  const taskId = ev.item.getAttribute('data-task-id')
  const fromStatus = ev.from.getAttribute('data-column') as Status | null
  const toStatus = ev.to.getAttribute('data-column') as Status | null
  if (!taskId || !toStatus) return

  const moved = localTasks.value.find((t) => t.id === taskId)
  if (!moved) return

  const previous: Partial<Task> = { status: moved.status, position: moved.position }
  const targetColumn = [
    ...localTasks.value.filter((t) => t.status === toStatus && t.id !== taskId)
  ].sort((a, b) => a.position - b.position)
  const newIndex = ev.newIndex ?? targetColumn.length
  const newPos = computePosition(targetColumn, newIndex, moved)

  moved.status = toStatus
  moved.position = newPos
  if (fromStatus !== toStatus || Math.abs(newPos - (previous.position ?? 0)) > 0) {
    emit('task-moved', taskId, { status: toStatus, position: newPos })
  }
}

function mountSortable() {
  if (!props.canEdit) return
  destroySortables()
  for (const col of COLUMNS) {
    const el = columnRefs.value[col.id]
    if (!el) continue
    sortables.push(
      Sortable.create(el, {
        group: 'tasks',
        animation: 150,
        ghostClass: 'opacity-50',
        dataIdAttr: 'data-task-id',
        onEnd: handleEnd
      })
    )
  }
}

function destroySortables() {
  while (sortables.length) sortables.pop()?.destroy()
}

watch(
  () => props.canEdit,
  async () => {
    await nextTick()
    mountSortable()
  },
  { immediate: true }
)

onBeforeUnmount(destroySortables)
</script>

<template>
  <section class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
    <article
      v-for="col in COLUMNS"
      :key="col.id"
      class="relative flex min-h-[300px] flex-col gap-3 overflow-hidden rounded-3xl border border-stroke/80 bg-surface/75 p-4 shadow-[0_24px_60px_-42px_rgba(41,67,101,0.65)]"
    >
      <span
        class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(212_50%_70%)] to-transparent opacity-60"
        aria-hidden="true"
      />
      <header class="flex items-center justify-between">
        <h3 class="text-xs uppercase tracking-[0.28em] text-muted">{{ col.label }}</h3>
        <span class="rounded-full border border-stroke/70 bg-bg/70 px-2 py-0.5 text-[11px] text-muted">
          {{ byStatus[col.id].length }}
        </span>
      </header>
      <div
        :ref="(el) => setColumnRef(col.id, el as Element | null)"
        :data-column="col.id"
        class="flex flex-1 flex-col gap-2"
      >
        <DashboardProjectsTaskCard
          v-for="task in byStatus[col.id]"
          :key="task.id"
          :task="task"
          @click="emit('task-open', task.id)"
        />
        <div
          v-if="!byStatus[col.id].length"
          class="flex min-h-20 items-center justify-center rounded-2xl border border-dashed border-stroke/70 bg-bg/35 text-xs text-muted"
        >
          Sem tasks nesta coluna
        </div>
      </div>
    </article>
  </section>
</template>
