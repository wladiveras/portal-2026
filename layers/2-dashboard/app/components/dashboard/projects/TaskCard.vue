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
    class="group cursor-grab rounded-2xl border border-stroke/80 bg-bg/80 p-3 shadow-[0_12px_24px_-22px_rgba(41,67,101,0.8)] transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-[0_22px_42px_-28px_rgba(78,133,191,0.75)] active:cursor-grabbing"
    :class="active ? 'border-accent shadow-[0_22px_42px_-28px_rgba(78,133,191,0.75)]' : ''"
    :data-task-id="task.id"
  >
    <h4 class="line-clamp-2 text-sm font-medium text-text-primary">{{ task.title }}</h4>
    <div class="mt-2 flex items-center justify-between text-[11px] text-muted">
      <span class="inline-flex items-center gap-1 rounded-full border border-stroke/70 bg-surface/70 px-2 py-0.5">
        <Icon icon="lucide:sparkles" class="h-3 w-3 text-accent" />
        {{ task.points ?? '—' }} pts
      </span>
      <span v-if="task.assignee_id" class="inline-flex items-center gap-1 rounded-full border border-stroke/70 bg-surface/70 px-2 py-0.5">
        <Icon icon="lucide:user" class="h-3 w-3 text-accent" />
        Alocado
      </span>
    </div>
  </article>
</template>
