<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { Database } from '~/types/database.types'
import type { DashboardLeadDetailResponse } from '~~/server/api/dashboard/leads/[id]/index.get'
import { useDashboardApi } from '~~/layers/2-dashboard/app/composables/dashboard/useDashboardApi'

type LeadStatus = Database['public']['Enums']['lead_status']
interface Props {
  leadId: string | null
  canEdit?: boolean
  canDelete?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  'status-updated': [id: string, status: LeadStatus]
  deleted: [id: string]
}>()
const { fetchLeadDetail, addLeadNote: addLeadNoteApi, deleteLead: deleteLeadApi } = useDashboardApi()

const detail = ref<DashboardLeadDetailResponse | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const tab = ref<'timeline' | 'notes' | 'meta'>('timeline')
const draftNote = ref('')
const savingNote = ref(false)

async function load() {
  if (!props.leadId) {
    detail.value = null
    return
  }
  loading.value = true
  error.value = null
  try {
    detail.value = await fetchLeadDetail(props.leadId)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Falha ao carregar lead.'
  } finally {
    loading.value = false
  }
}

watch(() => props.leadId, load, { immediate: true })

const lead = computed(() => detail.value?.lead ?? null)

async function addNote() {
  if (!lead.value || !draftNote.value.trim()) return
  savingNote.value = true
  error.value = null
  try {
    const note = await addLeadNoteApi(lead.value.id, draftNote.value.trim())
    if (detail.value) {
      detail.value.notes.unshift(note)
    }
    draftNote.value = ''
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Falha ao salvar nota.'
  } finally {
    savingNote.value = false
  }
}

function onStatusUpdated(status: LeadStatus) {
  if (!lead.value || !detail.value) return
  detail.value.lead.status = status
  emit('status-updated', lead.value.id, status)
}

async function removeLead() {
  if (!lead.value || !props.canDelete) return
  if (typeof window !== 'undefined' && !window.confirm('Apagar este lead?')) return
  try {
    await deleteLeadApi(lead.value.id)
    emit('deleted', lead.value.id)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Falha ao apagar.'
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
      v-if="leadId"
      class="fixed inset-y-0 right-0 z-40 flex w-full max-w-lg flex-col border-l border-stroke bg-bg/95 shadow-[0_40px_80px_-32px_rgba(41,67,101,0.45)] backdrop-blur"
    >
      <header class="flex items-start justify-between gap-4 border-b border-stroke/70 p-6">
        <div class="min-w-0">
          <p class="text-[10px] uppercase tracking-[0.32em] text-muted">Lead</p>
          <h2 class="truncate font-display text-2xl italic text-text-primary">
            {{ lead?.display_name ?? lead?.contact_value ?? 'Anônimo' }}
          </h2>
          <p class="text-xs text-muted">{{ lead?.source ?? '—' }} · {{ lead?.contact_value ?? '—' }}</p>
        </div>
        <div class="flex items-start gap-2">
          <DashboardLeadsStatusPicker
            v-if="lead"
            :value="lead.status"
            :lead-id="lead.id"
            :can-edit="canEdit"
            @updated="onStatusUpdated"
          />
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full border border-stroke text-muted hover:text-text-primary"
            aria-label="Fechar"
            @click="emit('close')"
          >
            <Icon icon="lucide:x" class="h-4 w-4" />
          </button>
        </div>
      </header>

      <nav class="flex gap-1 border-b border-stroke/50 px-6 py-2 text-xs uppercase tracking-[0.22em]">
        <button
          v-for="t in (['timeline','notes','meta'] as const)"
          :key="t"
          type="button"
          class="rounded-full px-3 py-1 transition-colors"
          :class="tab === t ? 'bg-text-primary text-white' : 'text-muted hover:text-text-primary'"
          @click="tab = t"
        >
          {{ t }}
        </button>
      </nav>

      <section class="flex-1 overflow-y-auto px-6 py-5 text-sm">
        <p v-if="loading" class="text-muted">Carregando…</p>
        <p v-else-if="error" class="text-rose-500">{{ error }}</p>
        <template v-else-if="detail">
          <DashboardLeadsTimeline v-if="tab === 'timeline'" :events="detail.events" />

          <div v-else-if="tab === 'notes'" class="space-y-4">
            <form class="space-y-2" @submit.prevent="addNote">
              <textarea
                v-model="draftNote"
                rows="3"
                maxlength="4000"
                :disabled="!canEdit || savingNote"
                placeholder="Adicionar nota"
                class="w-full resize-none rounded-2xl border border-stroke bg-surface px-3 py-2 text-text-primary outline-none focus:border-accent"
              />
              <div class="flex justify-end">
                <button
                  type="submit"
                  :disabled="!canEdit || savingNote || !draftNote.trim()"
                  class="rounded-full bg-text-primary px-4 py-1.5 text-xs font-medium text-white disabled:opacity-40"
                >
                  Salvar nota
                </button>
              </div>
            </form>
            <ul class="space-y-2">
              <li
                v-for="note in detail.notes"
                :key="note.id"
                class="rounded-2xl border border-stroke/60 bg-surface/70 p-3 text-sm"
              >
                <p class="whitespace-pre-line text-text-primary">{{ note.body }}</p>
                <p class="mt-2 text-[11px] text-muted">
                  {{ new Date(note.created_at).toLocaleString('pt-BR') }}
                </p>
              </li>
              <li v-if="!detail.notes.length" class="text-xs text-muted">Sem notas ainda.</li>
            </ul>
          </div>

          <dl v-else class="grid grid-cols-[160px_1fr] gap-y-2 text-xs text-muted">
            <dt>ID</dt><dd class="truncate text-text-primary">{{ detail.lead.id }}</dd>
            <dt>Primeira visita</dt>
            <dd class="text-text-primary">{{ new Date(detail.lead.first_seen).toLocaleString('pt-BR') }}</dd>
            <dt>Última atividade</dt>
            <dd class="text-text-primary">{{ new Date(detail.lead.last_seen).toLocaleString('pt-BR') }}</dd>
            <dt>utm_source</dt><dd class="text-text-primary">{{ detail.lead.utm_source ?? '—' }}</dd>
            <dt>utm_medium</dt><dd class="text-text-primary">{{ detail.lead.utm_medium ?? '—' }}</dd>
            <dt>utm_campaign</dt>
            <dd class="text-text-primary">{{ detail.lead.utm_campaign ?? '—' }}</dd>
          </dl>
        </template>
      </section>

      <footer v-if="canDelete && lead" class="border-t border-stroke/60 px-6 py-3">
        <button
          type="button"
          class="text-xs text-rose-500 hover:underline"
          @click="removeLead"
        >
          Apagar lead
        </button>
      </footer>
    </aside>
  </Transition>
</template>
