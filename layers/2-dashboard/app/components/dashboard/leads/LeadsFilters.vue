<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { Database } from '~/types/database.types'
import type { LeadsFilters } from '~/composables/useLeadsQuery'

type LeadStatus = Database['public']['Enums']['lead_status']

const modelValue = defineModel<LeadsFilters>({ required: true })

const STATUSES: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']
const STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'Novo',
  contacted: 'Contactado',
  qualified: 'Qualificado',
  proposal: 'Proposta',
  won: 'Fechado',
  lost: 'Perdido'
}

function toggleStatus(status: LeadStatus) {
  const set = new Set(modelValue.value.status)
  if (set.has(status)) set.delete(status)
  else set.add(status)
  modelValue.value = { ...modelValue.value, status: Array.from(set) }
}

function reset() {
  modelValue.value = {
    status: [],
    source: null,
    utm_campaign: null,
    search: '',
    since: null,
    until: null
  }
}
</script>

<template>
  <section class="flex flex-col gap-3 rounded-2xl border border-stroke bg-surface/80 p-4 md:flex-row md:items-end md:gap-4">
    <div class="flex-1 space-y-1">
      <label class="block text-[10px] uppercase tracking-[0.28em] text-muted" for="leads-search">
        Procurar
      </label>
      <div class="flex items-center gap-2 rounded-full border border-stroke bg-bg px-3">
        <Icon icon="lucide:search" class="h-4 w-4 text-muted" aria-hidden="true" />
        <input
          id="leads-search"
          v-model="modelValue.search"
          type="search"
          placeholder="nome, contato, source"
          class="h-9 w-full bg-transparent text-sm text-text-primary outline-none"
        />
      </div>
    </div>

    <div class="flex flex-col gap-1">
      <label class="text-[10px] uppercase tracking-[0.28em] text-muted">De</label>
      <input
        v-model="modelValue.since"
        type="date"
        class="h-10 rounded-full border border-stroke bg-bg px-3 py-1.5 text-sm text-text-primary [color-scheme:dark]"
      />
    </div>
    <div class="flex flex-col gap-1">
      <label class="text-[10px] uppercase tracking-[0.28em] text-muted">Até</label>
      <input
        v-model="modelValue.until"
        type="date"
        class="h-10 rounded-full border border-stroke bg-bg px-3 py-1.5 text-sm text-text-primary [color-scheme:dark]"
      />
    </div>

    <div class="flex flex-col gap-1 md:flex-1">
      <span class="text-[10px] uppercase tracking-[0.28em] text-muted">Status</span>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="s in STATUSES"
          :key="s"
          type="button"
          class="rounded-full border px-3 py-1 text-xs transition-colors"
          :class="
            modelValue.status.includes(s)
              ? 'border-accent bg-accent text-white'
              : 'border-stroke bg-bg text-muted hover:text-text-primary'
          "
          @click="toggleStatus(s)"
        >
          {{ STATUS_LABEL[s] }}
        </button>
      </div>
    </div>

    <button
      type="button"
      class="self-start rounded-full border border-stroke bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted transition-colors hover:border-accent hover:text-text-primary md:self-end"
      @click="reset"
    >
      Limpar
    </button>
  </section>
</template>
