<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({ layout: false })

const client = useSupabaseClient()
const user = useSupabaseUser()
const route = useRoute()

const initialMode = route.query.mode === 'password' ? 'password' : 'magic'
const mode = ref<'magic' | 'password'>(initialMode)
const email = ref('')
const password = ref('')
const submitting = ref(false)
const message = ref<string | null>(null)
const error = ref<string | null>(null)

watch(
  user,
  async (value) => {
    if (value) {
      const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
      await navigateTo(redirect)
    }
  },
  { immediate: true }
)

async function submit() {
  error.value = null
  message.value = null
  submitting.value = true
  try {
    if (mode.value === 'magic') {
      const { error: err } = await client.auth.signInWithOtp({
        email: email.value,
        options: {
          emailRedirectTo: `${window.location.origin}/confirm`
        }
      })
      if (err) throw err
      message.value = 'Link de acesso enviado. Verifica o teu email.'
    } else {
      const { error: err } = await client.auth.signInWithPassword({
        email: email.value,
        password: password.value
      })
      if (err) throw err
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Falha ao autenticar.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main
    class="grid min-h-[100dvh] bg-bg text-text-primary md:grid-cols-2"
  >
    <section
      class="relative hidden overflow-hidden border-r border-stroke bg-surface md:flex"
    >
      <div
        class="absolute inset-0 opacity-80"
        style="
          background: radial-gradient(
            120% 80% at 80% 20%,
            hsla(212, 50%, 76%, 0.35) 0%,
            transparent 60%
          ),
          radial-gradient(
            80% 60% at 20% 90%,
            hsla(212, 45%, 62%, 0.35) 0%,
            transparent 60%
          );
        "
        aria-hidden="true"
      />
      <div class="relative z-10 flex flex-col justify-between p-10">
        <div class="font-display text-3xl italic leading-tight text-text-primary">
          Portal 2026
          <span class="block text-lg not-italic text-muted">admin area</span>
        </div>
        <p class="max-w-sm font-display text-2xl italic leading-snug text-text-primary/80">
          “Clareza começa pela porta de entrada. Entre para acompanhar leads,
          projetos e conversas reais.”
        </p>
      </div>
    </section>

    <section class="flex items-center justify-center px-6 py-16 md:px-12">
      <form
        class="w-full max-w-sm space-y-6 rounded-3xl border border-stroke bg-surface/70 p-8 shadow-[0_30px_60px_-30px_rgba(41,67,101,0.4)] backdrop-blur"
        @submit.prevent="submit"
      >
        <header class="space-y-2">
          <p class="text-[10px] uppercase tracking-[0.38em] text-muted">Acesso</p>
          <h2 class="font-display text-3xl italic leading-tight text-text-primary">
            Entre na sua dashboard
          </h2>
        </header>

        <div class="flex gap-2 text-xs">
          <button
            type="button"
            class="flex-1 rounded-full border border-stroke px-3 py-2 transition-colors"
            :class="mode === 'magic' ? 'bg-text-primary text-white' : 'bg-bg text-muted hover:text-text-primary'"
            @click="mode = 'magic'"
          >
            Magic link
          </button>
          <button
            type="button"
            class="flex-1 rounded-full border border-stroke px-3 py-2 transition-colors"
            :class="mode === 'password' ? 'bg-text-primary text-white' : 'bg-bg text-muted hover:text-text-primary'"
            @click="mode = 'password'"
          >
            Email + senha
          </button>
        </div>

        <div class="space-y-3">
          <label class="block text-xs text-muted" for="login-email">Email</label>
          <input
            id="login-email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="w-full rounded-xl border border-stroke bg-bg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
          />

          <template v-if="mode === 'password'">
            <label class="block text-xs text-muted" for="login-password">Senha</label>
            <input
              id="login-password"
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              class="w-full rounded-xl border border-stroke bg-bg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
            />
          </template>
        </div>

        <button
          type="submit"
          :disabled="submitting"
          class="flex w-full items-center justify-center rounded-full bg-text-primary px-4 py-3 text-sm font-medium text-white transition-transform duration-200 ease-out hover:scale-[1.02] disabled:opacity-50"
        >
          {{ submitting ? 'A entrar…' : mode === 'magic' ? 'Enviar magic link' : 'Entrar' }}
        </button>

        <p v-if="message" class="text-xs text-accent">{{ message }}</p>
        <p v-if="error" class="text-xs text-red-500">{{ error }}</p>

        <p class="text-center text-xs text-muted">
          Problemas para entrar? Fale comigo em
          <a class="underline" href="mailto:hi@wladi.com.br">hi@wladi.com.br</a>
        </p>
      </form>
    </section>
  </main>
</template>
