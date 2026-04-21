<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { downloadCsv, toCsv } from '~/utils/csv'
import type { LeadListItem, DashboardLeadsResponse } from '~/../server/api/dashboard/leads/index.get'

interface Props {
  /** Current query string (filters + pagination) to replay server-side. */
  query: Record<string, unknown>
  disabled?: boolean
}

const props = defineProps<Props>()

const busy = ref(false)
const error = ref<string | null>(null)

async function exportCsv() {
  if (props.disabled || busy.value) return
  busy.value = true
  error.value = null
  try {
    const bigQuery = { ...props.query, page: 1, pageSize: 500 }
    const res = await $fetch<DashboardLeadsResponse>('/api/dashboard/leads', { query: bigQuery })
    const csv = toCsv<LeadListItem>(res.items, [
      { header: 'id', accessor: (r) => r.id },
      { header: 'status', accessor: (r) => r.status },
      { header: 'source', accessor: (r) => r.source ?? '' },
      { header: 'display_name', accessor: (r) => r.display_name ?? '' },
      { header: 'contact_value', accessor: (r) => r.contact_value ?? '' },
      { header: 'first_seen', accessor: (r) => r.first_seen },
      { header: 'last_seen', accessor: (r) => r.last_seen },
      { header: 'utm_source', accessor: (r) => r.utm_source ?? '' },
      { header: 'utm_medium', accessor: (r) => r.utm_medium ?? '' },
      { header: 'utm_campaign', accessor: (r) => r.utm_campaign ?? '' }
    ])
    const stamp = new Date().toISOString().slice(0, 10)
    downloadCsv(`leads-${stamp}.csv`, csv)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Falha ao exportar.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="flex flex-col items-end gap-1">
    <button
      type="button"
      class="inline-flex items-center gap-2 rounded-full border border-stroke bg-surface/80 px-4 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-bg disabled:opacity-40"
      :disabled="disabled || busy"
      @click="exportCsv"
    >
      <Icon :icon="busy ? 'lucide:loader-2' : 'lucide:download'" class="h-3.5 w-3.5" :class="busy ? 'animate-spin' : ''" />
      Exportar CSV
    </button>
    <p v-if="error" class="text-[11px] text-rose-500">{{ error }}</p>
  </div>
</template>
