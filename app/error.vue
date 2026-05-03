<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { NuxtError } from '#app'

interface Props {
  error: NuxtError
}

const props = defineProps<Props>()

const title = computed(() => {
  if (props.error?.status === 403) return 'Sem permissão'
  if (props.error?.status === 404) return 'Página não encontrada'
  if (props.error?.status === 401) return 'Precisa entrar'
  if (props.error?.status === 503) return 'Sessão ainda sincronizando'
  return 'Algo saiu do trilho'
})

const description = computed(() => {
  if (props.error?.status === 403) {
    return props.error.statusText ?? 'O seu role atual não cobre esta área.'
  }
  if (props.error?.status === 404) {
    return 'Esta rota não existe — volte ao início ou à dashboard.'
  }
  if (props.error?.status === 401) {
    return 'Faça login para continuar.'
  }
  if (props.error?.status === 503) {
    return (
      props.error.statusText ?? 'Recarregue a página em alguns segundos ou refaça o login.'
    )
  }
  return props.error?.statusText ?? 'Tente novamente em instantes.'
})

const cta = computed(() => {
  if (props.error?.status === 401) return { label: 'Ir para login', to: '/login' }
  if (props.error?.status === 503) return { label: 'Recarregar', to: '/dashboard' }
  if (props.error?.status === 403) return { label: 'Voltar à home', to: '/dashboard' }
  return { label: 'Voltar ao início', to: '/' }
})

function reset() {
  clearError({ redirect: cta.value.to })
}
</script>

<template>
  <main
    class="relative grid min-h-[100dvh] place-items-center overflow-hidden bg-bg text-text-primary"
  >
    <div
      class="pointer-events-none absolute inset-0 opacity-60"
      style="
        background: radial-gradient(
          110% 70% at 80% 20%,
          hsla(212, 50%, 76%, 0.3) 0%,
          transparent 60%
        ),
        radial-gradient(
          90% 60% at 20% 90%,
          hsla(212, 45%, 62%, 0.28) 0%,
          transparent 60%
        );
      "
      aria-hidden="true"
    />

    <section
      class="glass-surface relative z-10 mx-6 w-full max-w-lg rounded-3xl p-10 text-center"
    >
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-bg text-accent">
        <Icon icon="lucide:alert-triangle" class="h-6 w-6" aria-hidden="true" />
      </div>

      <p class="mt-6 text-[10px] uppercase tracking-[0.38em] text-muted">
        Erro {{ error?.status ?? '—' }}
      </p>
      <h1 class="mt-3 font-display text-4xl italic leading-tight text-text-primary md:text-5xl">
        {{ title }}
      </h1>
      <p class="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-muted">
        {{ description }}
      </p>

      <button
        type="button"
        class="mt-8 inline-flex items-center gap-2 rounded-full bg-text-primary px-6 py-3 text-sm font-medium text-white transition-transform duration-200 ease-out hover:scale-[1.03]"
        @click="reset"
      >
        {{ cta.label }}
        <Icon icon="lucide:arrow-right" class="h-4 w-4" />
      </button>

      <p class="mt-6 text-[11px] text-muted">
        Precisa de ajuda?
        <a class="underline hover:text-text-primary" href="mailto:hi@wladi.com.br">
          hi@wladi.com.br
        </a>
      </p>
    </section>
  </main>
</template>
