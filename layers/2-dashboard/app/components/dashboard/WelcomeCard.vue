<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useLiveClock } from '~/composables/useLiveClock'

const { profile } = useRole()
const user = useSupabaseUser()
const { greeting, formattedTime, formattedDate } = useLiveClock()

const firstName = computed(() => {
  const raw =
    profile.value?.full_name?.trim() ||
    (user.value?.user_metadata?.full_name as string | undefined)?.trim() ||
    user.value?.email?.split('@')[0] ||
    ''
  return raw.split(/\s+/)[0] || 'por aqui'
})

const greetingIcon = computed(() => {
  switch (greeting.value) {
    case 'bom dia':
      return 'lucide:sunrise'
    case 'boa tarde':
      return 'lucide:sun'
    default:
      return 'lucide:moon-star'
  }
})
</script>

<template>
  <article
    class="glass-surface relative flex h-full flex-col gap-6 overflow-hidden rounded-3xl p-8"
  >
    <div
      class="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full opacity-50 blur-3xl"
      style="background: radial-gradient(circle, hsl(212 50% 70% / 0.45), transparent 65%)"
      aria-hidden="true"
    />
    <header class="space-y-2">
      <div class="flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-muted">
        <Icon :icon="greetingIcon" class="h-3.5 w-3.5 text-accent" aria-hidden="true" />
        <span>{{ formattedDate }}</span>
      </div>
      <h2 class="font-display text-4xl italic leading-tight text-text-primary md:text-5xl">
        {{ greeting }},
        <span class="accent-text">{{ firstName }}</span>
      </h2>
      <p class="max-w-md text-sm leading-relaxed text-muted">
        Aqui está o resumo do que aconteceu enquanto você esteve fora. Use os
        widgets ao lado para tomar decisões rápidas.
      </p>
    </header>

    <div class="mt-auto flex items-end justify-between gap-4">
      <div>
        <p class="text-[10px] uppercase tracking-[0.32em] text-muted">Agora</p>
        <p
          class="mt-1 font-display text-5xl tabular-nums leading-none tracking-tight text-text-primary md:text-6xl"
        >
          {{ formattedTime }}
        </p>
      </div>
      <span class="text-xs text-muted">America/Sao_Paulo</span>
    </div>
  </article>
</template>
