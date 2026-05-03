<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { Database } from '~/types/database.types'
import type { LeadListItem } from '~~/server/api/dashboard/leads/index.get'

type LeadStatus = Database['public']['Enums']['lead_status']

interface Props {
  items: LeadListItem[]
  loading?: boolean
  total?: number
  page: number
  pageSize: number
  selectedId?: string | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  select: [id: string]
  'update:page': [page: number]
}>()

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'Novo',
  contacted: 'Contactado',
  qualified: 'Qualificado',
  proposal: 'Proposta',
  won: 'Fechado',
  lost: 'Perdido'
}

const STATUS_CLASSES: Record<LeadStatus, string> = {
  new: 'bg-stroke/60 text-muted',
  contacted: 'bg-[hsl(212_50%_76%/0.35)] text-accent',
  qualified: 'bg-accent/20 text-accent',
  proposal: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
  won: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
  lost: 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
}

const totalPages = computed(() =>
  Math.max(1, Math.ceil((props.total ?? 0) / props.pageSize))
)

function relative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.round(diff / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  const hr = Math.round(min / 60)
  if (hr < 24) return `há ${hr} h`
  const days = Math.round(hr / 24)
  return `há ${days} d`
}

function changePage(delta: number) {
  const next = Math.min(totalPages.value, Math.max(1, props.page + delta))
  emit('update:page', next)
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-stroke/80 bg-surface/80 shadow-[0_20px_44px_-34px_rgba(41,67,101,0.65)]">
    <table class="w-full text-left text-sm">
      <thead class="bg-bg/65 text-[10px] uppercase tracking-[0.22em] text-muted">
        <tr>
          <th class="px-4 py-3">Status</th>
          <th class="px-4 py-3">Contato</th>
          <th class="px-4 py-3">Source</th>
          <th class="px-4 py-3">Campanha</th>
          <th class="px-4 py-3 text-right">Último contato</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="5" class="px-4 py-10 text-center text-muted">Carregando…</td>
        </tr>
        <tr v-else-if="!items.length">
          <td colspan="5" class="px-4 py-10 text-center text-muted">
            <div class="mx-auto max-w-sm rounded-2xl border border-dashed border-stroke/70 bg-bg/40 px-4 py-6">
              Nenhum lead encontrado.
            </div>
          </td>
        </tr>
        <tr
          v-for="lead in items"
          v-else
          :key="lead.id"
          class="cursor-pointer border-t border-stroke/70 transition-colors hover:bg-bg/40"
          :class="selectedId === lead.id ? 'bg-bg/60' : ''"
          @click="emit('select', lead.id)"
        >
          <td class="px-4 py-3">
            <span
              class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
              :class="STATUS_CLASSES[lead.status]"
            >
              {{ STATUS_LABEL[lead.status] }}
            </span>
          </td>
          <td class="px-4 py-3">
            <div class="flex flex-col">
              <span class="text-text-primary">
                {{ lead.display_name ?? lead.contact_value ?? 'Anônimo' }}
              </span>
              <span class="text-xs text-muted">{{ lead.contact_value ?? '—' }}</span>
            </div>
          </td>
          <td class="px-4 py-3 text-muted">{{ lead.source ?? '—' }}</td>
          <td class="px-4 py-3 text-muted">{{ lead.utm_campaign ?? '—' }}</td>
          <td class="px-4 py-3 text-right text-muted">{{ relative(lead.last_seen) }}</td>
        </tr>
      </tbody>
    </table>

    <footer
      v-if="total && total > pageSize"
      class="flex items-center justify-between gap-4 border-t border-stroke/60 bg-bg/40 px-4 py-3 text-xs text-muted"
    >
      <span>{{ total }} leads · página {{ page }} de {{ totalPages }}</span>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-stroke bg-surface text-muted transition-colors hover:border-accent hover:text-text-primary disabled:opacity-40"
          :disabled="page <= 1"
          @click="changePage(-1)"
        >
          <Icon icon="lucide:chevron-left" class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-stroke bg-surface text-muted transition-colors hover:border-accent hover:text-text-primary disabled:opacity-40"
          :disabled="page >= totalPages"
          @click="changePage(1)"
        >
          <Icon icon="lucide:chevron-right" class="h-4 w-4" />
        </button>
      </div>
    </footer>
  </div>
</template>
