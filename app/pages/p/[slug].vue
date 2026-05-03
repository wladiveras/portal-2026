<script setup lang="ts">
import type { Json } from '~/types/database.types'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))
const isDraftPreview = computed(() => route.query.preview === 'draft')

type LandingFetchShape = {
  projectId: string
  slug: string
  payload: Json
  preview?: boolean
  status?: string
}

const { data, error, pending } = await useAsyncData(
  () => `public-landing-${slug.value}-${isDraftPreview.value ? 'draft' : 'pub'}`,
  () => {
    const enc = encodeURIComponent(slug.value)
    if (isDraftPreview.value) {
      return $fetch<LandingFetchShape>(`/api/dashboard/landing-preview/${enc}`)
    }
    return $fetch<LandingFetchShape>(`/api/public/landing/${enc}`)
  },
  { watch: [slug, isDraftPreview] }
)

const isPreviewMode = computed(() => data.value?.preview === true)

const doc = computed(() => {
  const p = data.value?.payload
  return p && typeof p === 'object' && !Array.isArray(p) ? (p as Record<string, unknown>) : {}
})

const title = computed(() => {
  const t = doc.value.title
  return typeof t === 'string' && t.trim() ? t.trim() : 'Projeto'
})

const subtitle = computed(() => {
  const t = doc.value.subtitle
  return typeof t === 'string' ? t : ''
})

const email = ref('')
const name = ref('')
const sending = ref(false)
const sent = ref(false)

const { trackLead } = useTracker()

async function submitLead() {
  const pid = data.value?.projectId
  const addr = email.value.trim()
  if (!pid || !addr) return
  sending.value = true
  try {
    await trackLead({
      source: 'project_landing',
      displayName: name.value.trim() || null,
      contactValue: addr,
      projectId: pid
    })
    sent.value = true
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <main class="min-h-screen bg-bg px-4 py-16 font-sans text-text-primary">
    <div
      v-if="!pending && isPreviewMode"
      class="mx-auto mb-8 max-w-xl rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-center text-sm text-text-primary"
    >
      Pré-visualização do rascunho — só visível para membros do projeto.
      <span v-if="data?.status" class="ml-1 text-muted">({{ data.status }})</span>
    </div>

    <div v-if="pending" class="mx-auto max-w-xl text-center text-muted">A carregar…</div>

    <div v-else-if="error" class="mx-auto max-w-xl text-center">
      <p class="font-display text-2xl italic text-text-primary/88">
        {{ isDraftPreview ? 'Não foi possível pré-visualizar' : 'Página não encontrada' }}
      </p>
      <p class="mt-3 text-sm text-muted">
        {{
          isDraftPreview
            ? 'Inicie sessão com uma conta que tenha acesso a este projeto, ou verifique o slug.'
            : 'Esta landing não está publicada ou o link está incorreto.'
        }}
      </p>
      <NuxtLink
        to="/"
        class="mt-8 inline-flex rounded-full border border-stroke bg-surface/90 px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-text-primary transition-colors hover:border-accent"
      >
        Início
      </NuxtLink>
    </div>

    <article v-else-if="data" class="mx-auto max-w-xl">
      <header class="text-center">
        <h1 class="font-display text-[clamp(1.75rem,5vw,2.75rem)] font-normal italic leading-tight text-text-primary/88">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="mt-4 text-muted">{{ subtitle }}</p>
      </header>

      <section class="glass-surface mt-12 rounded-2xl border border-stroke/80 p-6 md:p-8">
        <p class="text-[10px] uppercase tracking-[0.28em] text-muted">Contacto</p>
        <form class="mt-4 space-y-4" @submit.prevent="submitLead">
          <label class="block">
            <span class="text-[10px] uppercase tracking-[0.22em] text-muted">Nome</span>
            <input
              v-model="name"
              type="text"
              name="name"
              autocomplete="name"
              class="mt-1 w-full rounded-xl border border-stroke bg-bg/80 px-4 py-3 text-sm text-text-primary outline-none ring-accent/30 placeholder:text-muted focus:ring-2"
              placeholder="Opcional"
            />
          </label>
          <label class="block">
            <span class="text-[10px] uppercase tracking-[0.22em] text-muted">Email</span>
            <input
              v-model="email"
              type="email"
              name="email"
              required
              autocomplete="email"
              class="mt-1 w-full rounded-xl border border-stroke bg-bg/80 px-4 py-3 text-sm text-text-primary outline-none ring-accent/30 placeholder:text-muted focus:ring-2"
              placeholder="voce@empresa.com"
            />
          </label>
          <button
            type="submit"
            class="gradient-border w-full rounded-full border border-stroke bg-surface px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-text-primary transition-colors hover:bg-bg disabled:opacity-40"
            :disabled="sending || sent"
          >
            {{ sent ? 'Enviado' : sending ? 'A enviar…' : 'Pedir contacto' }}
          </button>
          <p v-if="sent" class="text-center text-sm text-muted">Obrigado — entraremos em contacto.</p>
        </form>
      </section>
    </article>
  </main>
</template>
