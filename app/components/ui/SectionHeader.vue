<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  highlight: string
  description: string
}>()
</script>

<template>
  <header class="mb-12 flex items-end justify-between gap-6">
    <div class="space-y-4">
      <div class="flex items-center gap-3">
        <span class="h-px w-8 bg-stroke" />
        <span class="text-xs uppercase tracking-[0.3em] text-muted">{{ eyebrow }}</span>
      </div>
      <h2 class="text-3xl font-medium text-text-primary md:text-5xl">
        {{ title }} <span class="font-display italic">{{ highlight }}</span>
      </h2>
      <p class="max-w-2xl text-sm text-muted md:text-base">{{ description }}</p>
    </div>
    <slot />
  </header>
</template>
