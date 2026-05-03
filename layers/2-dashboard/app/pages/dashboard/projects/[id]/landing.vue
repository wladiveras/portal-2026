<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { Json } from '~/types/database.types'
import { useDashboardApi } from '~~/layers/2-dashboard/app/composables/dashboard/useDashboardApi'
import { useDashboardProjectsStore } from '~~/layers/2-dashboard/app/stores/dashboard/projects'

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  role: ['admin', 'editor', 'viewer'],
  dashboardEyebrow: 'Projeto',
  dashboardTitle: 'Landing pública'
})

const route = useRoute()
const projectId = computed(() => String(route.params.id))
const { can } = useRole()
const dashboardApi = useDashboardApi()
const projectsStore = useDashboardProjectsStore()

const saving = ref(false)
const publishing = ref(false)
const feedback = ref<string | null>(null)
const errorMsg = ref<string | null>(null)

const form = reactive({
  slug: '',
  title: '',
  subtitle: ''
})

const { data, pending, refresh } = await useAsyncData(
  () => `dashboard-landing-${projectId.value}`,
  async () => {
    await projectsStore.fetchProjectDetail(projectId.value)
    return dashboardApi.fetchProjectLanding(projectId.value)
  },
  { watch: [projectId] }
)

function applyFromServer() {
  const b = data.value
  if (!b) return
  const p = projectsStore.detailById(projectId.value)?.project
  const L = b.landing
  const doc =
    L?.draft_json && typeof L.draft_json === 'object' && !Array.isArray(L.draft_json)
      ? (L.draft_json as Record<string, unknown>)
      : {}
  form.slug = L?.slug ?? b.defaultSlug
  form.title = typeof doc.title === 'string' ? doc.title : (p?.name ?? '')
  form.subtitle = typeof doc.subtitle === 'string' ? doc.subtitle : ''
}

watch(data, () => applyFromServer(), { immediate: true })

const statusLabel = computed(() => data.value?.landing?.status ?? '—')
const publishedAt = computed(() => data.value?.landing?.published_at ?? null)

const publicPath = computed(() => `/p/${encodeURIComponent(form.slug || data.value?.defaultSlug || '')}`)

const previewPath = computed(() => `${publicPath.value}?preview=draft`)

function buildDraftJson(): Json {
  const b = data.value
  const base =
    b?.landing?.draft_json &&
    typeof b.landing.draft_json === 'object' &&
    !Array.isArray(b.landing.draft_json)
      ? { ...(b.landing.draft_json as Record<string, unknown>) }
      : {}
  return { ...base, title: form.title, subtitle: form.subtitle } as Json
}

async function saveDraft() {
  if (!can('manage_projects') || saving.value) return
  saving.value = true
  errorMsg.value = null
  feedback.value = null
  try {
    await dashboardApi.saveProjectLandingDraft(projectId.value, {
      draft_json: buildDraftJson(),
      slug: form.slug.trim() || null
    })
    feedback.value = 'Rascunho guardado.'
    await refresh()
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : 'Falha ao guardar'
  } finally {
    saving.value = false
  }
}

async function publish() {
  if (!can('manage_projects') || publishing.value) return
  publishing.value = true
  errorMsg.value = null
  feedback.value = null
  try {
    await dashboardApi.saveProjectLandingDraft(projectId.value, {
      draft_json: buildDraftJson(),
      slug: form.slug.trim() || null
    })
    await dashboardApi.publishProjectLanding(projectId.value)
    feedback.value = 'Landing publicada.'
    await refresh()
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : 'Falha ao publicar'
  } finally {
    publishing.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <NuxtLink
          :to="`/dashboard/projects/${projectId}`"
          class="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.28em] text-muted transition-colors hover:text-text-primary"
        >
          <Icon icon="lucide:arrow-left" class="h-3.5 w-3.5" />
          Projeto
        </NuxtLink>
        <h2 class="mt-2 font-display text-2xl italic text-text-primary">Landing pública</h2>
        <p class="mt-1 max-w-xl text-sm text-muted">
          Edite o rascunho e publique quando estiver pronto. A URL pública usa o slug abaixo.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <span
          class="rounded-full border border-stroke bg-surface/80 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-muted"
        >
          {{ statusLabel }}
        </span>
        <a
          v-if="data?.landing?.status === 'published'"
          :href="publicPath"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 rounded-full border border-stroke bg-bg/70 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:border-accent hover:text-text-primary"
        >
          <Icon icon="lucide:external-link" class="h-3.5 w-3.5" />
          Ver público
        </a>
        <a
          :href="previewPath"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 rounded-full border border-stroke bg-bg/70 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:border-accent hover:text-text-primary"
        >
          <Icon icon="lucide:eye" class="h-3.5 w-3.5" />
          Pré-visualizar rascunho
        </a>
      </div>
    </header>

    <p v-if="pending" class="text-sm text-muted">A carregar…</p>

    <section v-else class="glass-surface max-w-2xl space-y-5 rounded-2xl border border-stroke/80 p-6 md:p-8">
      <p v-if="publishedAt" class="text-xs text-muted">Última publicação: {{ publishedAt }}</p>

      <label class="block">
        <span class="text-[10px] uppercase tracking-[0.22em] text-muted">Slug (URL)</span>
        <input
          v-model="form.slug"
          type="text"
          :disabled="!can('manage_projects')"
          class="mt-1 w-full rounded-xl border border-stroke bg-bg/80 px-4 py-3 text-sm text-text-primary outline-none ring-accent/30 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="meu-projeto"
        />
        <span class="mt-1 block text-xs text-muted">{{ publicPath }}</span>
      </label>

      <label class="block">
        <span class="text-[10px] uppercase tracking-[0.22em] text-muted">Título</span>
        <input
          v-model="form.title"
          type="text"
          :disabled="!can('manage_projects')"
          class="mt-1 w-full rounded-xl border border-stroke bg-bg/80 px-4 py-3 text-sm text-text-primary outline-none ring-accent/30 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </label>

      <label class="block">
        <span class="text-[10px] uppercase tracking-[0.22em] text-muted">Subtítulo</span>
        <textarea
          v-model="form.subtitle"
          rows="3"
          :disabled="!can('manage_projects')"
          class="mt-1 w-full rounded-xl border border-stroke bg-bg/80 px-4 py-3 text-sm text-text-primary outline-none ring-accent/30 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </label>

      <p v-if="!can('manage_projects')" class="text-xs text-muted">
        Apenas editores e administradores podem alterar esta landing.
      </p>

      <p v-if="feedback" class="text-sm text-text-primary/88">{{ feedback }}</p>
      <p v-if="errorMsg" class="text-sm text-rose-500">{{ errorMsg }}</p>

      <div v-if="can('manage_projects')" class="flex flex-wrap gap-2 pt-2">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-stroke bg-bg/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-text-primary transition-colors hover:border-accent disabled:opacity-50"
          :disabled="saving"
          @click="saveDraft"
        >
          <Icon :icon="saving ? 'lucide:loader-2' : 'lucide:save'" class="h-3.5 w-3.5" :class="saving ? 'animate-spin' : ''" />
          {{ saving ? 'A guardar…' : 'Guardar rascunho' }}
        </button>
        <button
          type="button"
          class="gradient-border inline-flex items-center gap-2 rounded-full border border-stroke bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-text-primary transition-colors hover:bg-bg disabled:opacity-50"
          :disabled="publishing"
          @click="publish"
        >
          <Icon :icon="publishing ? 'lucide:loader-2' : 'lucide:rocket'" class="h-3.5 w-3.5" :class="publishing ? 'animate-spin' : ''" />
          {{ publishing ? 'A publicar…' : 'Publicar' }}
        </button>
      </div>
    </section>
  </div>
</template>
