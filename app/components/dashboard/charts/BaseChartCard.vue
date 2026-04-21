<script setup lang="ts">
interface Props {
  eyebrow?: string
  title: string
  hint?: string
}

defineProps<Props>()
</script>

<template>
  <article class="glass-surface flex h-full flex-col gap-3 rounded-3xl p-6">
    <header class="space-y-1">
      <p v-if="eyebrow" class="text-[10px] uppercase tracking-[0.32em] text-muted">
        {{ eyebrow }}
      </p>
      <h3 class="font-display text-xl italic leading-tight text-text-primary">{{ title }}</h3>
      <p v-if="hint" class="text-xs text-muted">{{ hint }}</p>
    </header>
    <div class="relative min-h-[180px] flex-1">
      <slot />
    </div>
  </article>
</template>
