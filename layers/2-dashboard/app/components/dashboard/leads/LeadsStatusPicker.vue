<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { Database } from '~/types/database.types'
import { useDashboardApi } from '~~/layers/2-dashboard/app/composables/dashboard/useDashboardApi'

type LeadStatus = Database['public']['Enums']['lead_status']

interface Props {
  value: LeadStatus
  leadId: string
  canEdit?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ updated: [status: LeadStatus] }>()
const { updateLeadStatus } = useDashboardApi()

const STATUSES: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']
const LABEL: Record<LeadStatus, string> = {
  new: 'Novo',
  contacted: 'Contactado',
  qualified: 'Qualificado',
  proposal: 'Proposta',
  won: 'Fechado',
  lost: 'Perdido'
}

const saving = ref(false)
const error = ref<string | null>(null)
const localStatus = ref<LeadStatus>(props.value)

watch(
  () => props.value,
  (v) => (localStatus.value = v)
)

async function change(next: LeadStatus) {
  if (saving.value || !props.canEdit || next === localStatus.value) return
  const previous = localStatus.value
  localStatus.value = next
  saving.value = true
  error.value = null
  try {
    await updateLeadStatus(props.leadId, next)
    emit('updated', next)
  } catch (e: unknown) {
    localStatus.value = previous
    error.value = e instanceof Error ? e.message : 'Transição inválida.'
  } finally {
    saving.value = false
  }
}

const open = ref(false)

const currentLabel = computed(() => LABEL[localStatus.value])
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="flex items-center gap-2 rounded-full border border-stroke bg-bg px-3 py-1.5 text-sm"
      :disabled="!canEdit || saving"
      @click="open = !open"
    >
      <span class="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
      {{ currentLabel }}
      <Icon icon="lucide:chevron-down" class="h-3.5 w-3.5 text-muted" />
    </button>
    <ul
      v-if="open && canEdit"
      class="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-stroke bg-surface/95 text-sm shadow-xl backdrop-blur"
      role="listbox"
      @click.stop
    >
      <li v-for="s in STATUSES" :key="s">
        <button
          type="button"
          class="flex w-full items-center justify-between px-3 py-2 text-left text-text-primary hover:bg-bg"
          @click="change(s); open = false"
        >
          <span>{{ LABEL[s] }}</span>
          <Icon v-if="s === localStatus" icon="lucide:check" class="h-4 w-4 text-accent" />
        </button>
      </li>
    </ul>
    <p v-if="error" class="mt-2 text-xs text-rose-500">{{ error }}</p>
  </div>
</template>
