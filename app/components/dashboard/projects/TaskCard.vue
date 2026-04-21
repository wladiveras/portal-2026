<script setup lang="ts">
import type { Database } from '~/types/database.types'
import { Icon } from '@iconify/vue'

type Task = Database['public']['Tables']['tasks']['Row']

interface Props {
  task: Task
  active?: boolean
}

defineProps<Props>()
</script>

<template>
  <article
    class="group cursor-grab rounded-2xl border border-stroke bg-bg p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
    :class="active ? 'border-accent' : ''"
    :data-task-id="task.id"
  >
    <h4 class="line-clamp-2 text-sm font-medium text-text-primary">{{ task.title }}</h4>
    <div class="mt-2 flex items-center justify-between text-[11px] text-muted">
      <span class="inline-flex items-center gap-1">
        <Icon icon="lucide:circle" class="h-3 w-3" />
        {{ task.points ?? '—' }} pts
      </span>
      <span v-if="task.assignee_id" class="inline-flex items-center gap-1">
        <Icon icon="lucide:user" class="h-3 w-3" />
      </span>
    </div>
  </article>
</template>
