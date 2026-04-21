<script setup lang="ts">
definePageMeta({ layout: false })

const user = useSupabaseUser()

watch(
  user,
  async (value) => {
    if (value) {
      await navigateTo('/dashboard')
    }
  },
  { immediate: true }
)
</script>

<template>
  <main class="flex min-h-[100dvh] items-center justify-center bg-bg text-text-primary">
    <div class="text-center">
      <p class="text-[10px] uppercase tracking-[0.38em] text-muted">Autenticando</p>
      <h1 class="mt-3 font-display text-3xl italic text-text-primary">
        Verificando acesso…
      </h1>
      <p class="mt-2 text-sm text-muted">Este passo desaparece automaticamente.</p>
    </div>
  </main>
</template>
