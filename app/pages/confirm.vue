<script setup lang="ts">
import { Icon } from '@iconify/vue'

definePageMeta({ layout: false })

const route = useRoute()
const client = useSupabaseClient()
const { ensureProfile, error: profileError } = useRole()

const status = ref<'waiting' | 'loading' | 'error'>('waiting')
const errorMessage = ref<string | null>(null)

const redirectTo = computed(() => {
  const q = route.query.redirect
  return typeof q === 'string' && q.startsWith('/') ? q : '/dashboard'
})

async function finish() {
  status.value = 'loading'
  errorMessage.value = null

  // Wait for the Supabase plugin to finish processing the magic-link hash.
  const sessionDeadline = Date.now() + 5000
  let session = (await client.auth.getSession()).data.session
  while (!session && Date.now() < sessionDeadline) {
    await new Promise((r) => setTimeout(r, 150))
    session = (await client.auth.getSession()).data.session
  }

  if (!session) {
    status.value = 'error'
    errorMessage.value = 'A sua sessão não chegou. Verifique se abriu o link mais recente do email.'
    return
  }

  const profile = await ensureProfile(4000)
  if (!profile) {
    status.value = 'error'
    errorMessage.value =
      profileError.value ?? 'Sessão pronta, mas não consegui carregar o seu perfil.'
    return
  }
  if (profile.disabled) {
    status.value = 'error'
    errorMessage.value = 'Sua conta está desativada. Fale com um admin.'
    return
  }

  await navigateTo(redirectTo.value, { replace: true })
}

async function backToLogin() {
  await client.auth.signOut().catch(() => {})
  await navigateTo('/login', { replace: true })
}

onMounted(() => {
  finish().catch((e) => {
    status.value = 'error'
    errorMessage.value = e instanceof Error ? e.message : 'Falha inesperada.'
  })
})
</script>

<template>
  <main class="flex min-h-[100dvh] items-center justify-center bg-bg px-6 text-text-primary">
    <section
      class="glass-surface w-full max-w-md rounded-3xl p-10 text-center"
    >
      <template v-if="status !== 'error'">
        <div
          class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-bg text-accent"
        >
          <Icon icon="lucide:loader-2" class="h-5 w-5 animate-spin" aria-hidden="true" />
        </div>
        <p class="mt-6 text-[10px] uppercase tracking-[0.38em] text-muted">Autenticando</p>
        <h1 class="mt-3 font-display text-3xl italic text-text-primary">
          Verificando acesso…
        </h1>
        <p class="mt-2 text-sm text-muted">
          Estamos confirmando sua sessão. Isto desaparece em segundos.
        </p>
      </template>

      <template v-else>
        <div
          class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-bg text-rose-500"
        >
          <Icon icon="lucide:alert-triangle" class="h-5 w-5" aria-hidden="true" />
        </div>
        <p class="mt-6 text-[10px] uppercase tracking-[0.38em] text-muted">Algo travou</p>
        <h1 class="mt-3 font-display text-3xl italic text-text-primary">
          Não consegui finalizar o login
        </h1>
        <p class="mt-3 text-sm text-muted">
          {{ errorMessage }}
        </p>

        <div class="mt-8 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full bg-text-primary px-5 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
            @click="finish"
          >
            <Icon icon="lucide:rotate-cw" class="h-3.5 w-3.5" />
            Tentar de novo
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-stroke bg-bg px-5 py-2.5 text-sm text-text-primary"
            @click="backToLogin"
          >
            Voltar ao login
          </button>
        </div>
      </template>
    </section>
  </main>
</template>
