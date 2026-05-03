<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import type { Database } from '~/types/database.types'
import { useDashboardApi } from '~~/layers/2-dashboard/app/composables/dashboard/useDashboardApi'

type NoteRow = Database['public']['Tables']['notes']['Row']

const user = useSupabaseUser()
const { listNotes, createNote, updateNotePinned, deleteNote } = useDashboardApi()

const notes = ref<NoteRow[]>([])
const draft = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const saving = ref(false)

const canSubmit = computed(() => draft.value.trim().length > 0 && !!user.value && !saving.value)

async function load() {
  if (!user.value) {
    notes.value = []
    return
  }
  loading.value = true
  error.value = null
  try {
    notes.value = await listNotes()
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Falha ao carregar notas.'
  } finally {
    loading.value = false
  }
}

async function add() {
  if (!canSubmit.value || !user.value) return
  saving.value = true
  error.value = null
  try {
    const body = draft.value.trim()
    const data = await createNote(body)
    if (data) notes.value = [data, ...notes.value]
    draft.value = ''
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Não consegui salvar.'
  } finally {
    saving.value = false
  }
}

async function togglePin(note: NoteRow) {
  try {
    const data = await updateNotePinned(note.id, !note.pinned)
    if (data) {
      notes.value = notes.value.map((n) => (n.id === note.id ? data : n))
      notes.value.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Falha ao atualizar.'
  }
}

async function remove(note: NoteRow) {
  try {
    await deleteNote(note.id)
    notes.value = notes.value.filter((n) => n.id !== note.id)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Falha ao remover.'
  }
}

onMounted(load)

watch(user, load)
</script>

<template>
  <article class="flex h-full flex-col rounded-3xl border border-stroke bg-surface/80 p-6">
    <header class="mb-4 flex items-center justify-between">
      <div>
        <p class="text-[10px] uppercase tracking-[0.32em] text-muted">Notas</p>
        <h3 class="font-display text-2xl italic leading-tight text-text-primary">Quick notes</h3>
      </div>
      <span class="text-xs text-muted">{{ notes.length }}/20</span>
    </header>

    <form class="space-y-2" @submit.prevent="add">
      <textarea
        v-model="draft"
        rows="2"
        maxlength="4000"
        placeholder="Anote uma ideia rápida…"
        class="w-full resize-none rounded-2xl border border-stroke bg-bg px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent"
      />
      <div class="flex items-center justify-between text-xs text-muted">
        <span>Apenas você vê. RLS por <code>auth.uid()</code>.</span>
        <button
          type="submit"
          :disabled="!canSubmit"
          class="inline-flex items-center gap-1 rounded-full bg-text-primary px-3 py-1.5 text-xs font-medium text-white transition-transform hover:scale-[1.02] disabled:opacity-40"
        >
          <Icon icon="lucide:plus" class="h-3 w-3" /> Adicionar
        </button>
      </div>
    </form>

    <p v-if="error" class="mt-3 text-xs text-rose-500">{{ error }}</p>

    <ul class="mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
      <li
        v-for="note in notes"
        :key="note.id"
        class="group rounded-2xl border border-stroke/70 bg-bg/80 p-3 text-sm leading-relaxed text-text-primary"
        :class="note.pinned ? 'border-accent/40 shadow-[inset_0_0_0_1px_hsl(var(--accent)/0.12)]' : ''"
      >
        <div class="flex items-start gap-2">
          <Icon
            v-if="note.pinned"
            icon="lucide:pin"
            class="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent"
            aria-hidden="true"
          />
          <p class="flex-1 whitespace-pre-line">{{ note.body }}</p>
          <div class="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              class="rounded-full p-1 text-muted hover:bg-surface hover:text-text-primary"
              :aria-label="note.pinned ? 'Desafixar' : 'Fixar'"
              @click="togglePin(note)"
            >
              <Icon :icon="note.pinned ? 'lucide:pin-off' : 'lucide:pin'" class="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              class="rounded-full p-1 text-muted hover:bg-surface hover:text-rose-500"
              aria-label="Remover"
              @click="remove(note)"
            >
              <Icon icon="lucide:trash-2" class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </li>
      <li v-if="!loading && notes.length === 0" class="text-xs text-muted">
        Sem notas ainda. Comece pela primeira.
      </li>
      <li v-if="loading" class="text-xs text-muted">Carregando…</li>
    </ul>
  </article>
</template>
