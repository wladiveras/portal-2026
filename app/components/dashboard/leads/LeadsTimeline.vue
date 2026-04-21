<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { Database } from '~/types/database.types'

type LeadEvent = Database['public']['Tables']['lead_events']['Row']

interface Props {
  events: LeadEvent[]
}

const props = defineProps<Props>()

const ICONS: Record<string, string> = {
  page_view: 'lucide:eye',
  hash_nav: 'lucide:link',
  click_whatsapp: 'lucide:message-circle',
  click_email: 'lucide:mail',
  click_social: 'lucide:share-2',
  section_in_view: 'lucide:square-dashed',
  lead_whatsapp: 'lucide:phone',
  lead_email: 'lucide:mail-check',
  status_changed: 'lucide:git-branch'
}

interface Group {
  day: string
  label: string
  items: LeadEvent[]
}

const grouped = computed<Group[]>(() => {
  const buckets = new Map<string, LeadEvent[]>()
  for (const e of props.events) {
    const key = new Date(e.created_at).toISOString().slice(0, 10)
    const list = buckets.get(key) ?? []
    list.push(e)
    buckets.set(key, list)
  }
  return Array.from(buckets.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([day, items]) => ({
      day,
      label: new Intl.DateTimeFormat('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
      }).format(new Date(day)),
      items
    }))
})

function time(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso)
  )
}
</script>

<template>
  <ol class="space-y-5">
    <li v-for="group in grouped" :key="group.day">
      <p class="mb-2 text-[10px] uppercase tracking-[0.28em] text-muted">{{ group.label }}</p>
      <ul class="relative space-y-3 border-l border-stroke/70 pl-4">
        <li
          v-for="ev in group.items"
          :key="ev.id"
          class="relative flex gap-3 text-sm text-text-primary"
        >
          <span
            class="absolute -left-[18px] flex h-6 w-6 items-center justify-center rounded-full border border-stroke bg-surface text-muted"
          >
            <Icon :icon="ICONS[ev.type] ?? 'lucide:activity'" class="h-3 w-3" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate font-medium">
              {{ ev.type }}
              <span v-if="ev.target" class="text-muted"> → {{ ev.target }}</span>
            </p>
            <p class="text-[11px] text-muted">{{ time(ev.created_at) }} · {{ ev.path ?? '/' }}</p>
          </div>
        </li>
      </ul>
    </li>
    <li v-if="!events.length" class="text-xs text-muted">Sem eventos registados ainda.</li>
  </ol>
</template>
