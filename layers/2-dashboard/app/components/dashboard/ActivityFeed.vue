<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { DashboardActivityResponse } from '~~/server/api/dashboard/activity.get'

const { data, pending } = await useFetch<DashboardActivityResponse>('/api/dashboard/activity', {
  default: () => ({ items: [], next_cursor: null })
})

const ICONS: Record<string, string> = {
  page_view: 'lucide:eye',
  hash_nav: 'lucide:link',
  click_whatsapp: 'lucide:message-circle',
  click_email: 'lucide:mail',
  click_social: 'lucide:share-2',
  section_in_view: 'lucide:square-dashed',
  lead_whatsapp: 'lucide:phone',
  lead_email: 'lucide:mail-check'
}

function relative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.round(diff / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `${min} min`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr} h`
  const days = Math.round(hr / 24)
  return `${days} d`
}

const items = computed(() => data.value?.items ?? [])
</script>

<template>
  <article class="flex h-full flex-col rounded-3xl border border-stroke/80 bg-surface/80 p-6 shadow-[0_20px_44px_-34px_rgba(41,67,101,0.7)]">
    <header class="mb-4 space-y-1">
      <p class="text-[10px] uppercase tracking-[0.32em] text-muted">Atividade</p>
      <h3 class="font-display text-2xl italic leading-tight text-text-primary">Recentes</h3>
    </header>
    <ul class="flex-1 space-y-3 overflow-y-auto pr-1">
      <li
        v-for="item in items"
        :key="item.id"
        class="flex items-start gap-3 text-sm text-text-primary"
      >
        <span
          class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-stroke bg-bg text-muted"
        >
          <Icon :icon="ICONS[item.type] ?? 'lucide:activity'" class="h-3.5 w-3.5" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate">
            <span class="font-medium">{{ item.type }}</span>
            <span v-if="item.target" class="ml-1 text-muted">→ {{ item.target }}</span>
          </p>
          <p class="text-[11px] text-muted">{{ item.path ?? '/' }} · há {{ relative(item.created_at) }}</p>
        </div>
      </li>
      <li
        v-if="!pending && items.length === 0"
        class="rounded-2xl border border-dashed border-stroke/70 bg-bg/35 px-4 py-6 text-center text-xs text-muted"
      >
        Sem atividade ainda. Quando alguém visitar a landing aparece aqui.
      </li>
      <li v-if="pending" class="text-xs text-muted">Carregando…</li>
    </ul>
  </article>
</template>
