<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import Sortable, { type SortableEvent } from 'sortablejs'
import TaskCard from './TaskCard.vue'
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
      class="flex min-h-[300px] flex-col gap-3 rounded-3xl border border-stroke bg-surface/80 p-4"
    >
      <header class="flex items-center justify-between">
        <h3 class="text-xs uppercase tracking-[0.28em] text-muted">{{ col.label }}</h3>
        <span class="text-xs text-muted">{{ byStatus[col.id].length }}</span>
      </header>
      <div
        :ref="(el) => setColumnRef(col.id, el as Element | null)"
        :data-column="col.id"
        class="flex flex-1 flex-col gap-2"
      >
        <TaskCard
          v-for="task in byStatus[col.id]"
          :key="task.id"
          :task="task"
          @click="emit('task-open', task.id)"
        />
      </div>
    </article>
  </section>
</template>
