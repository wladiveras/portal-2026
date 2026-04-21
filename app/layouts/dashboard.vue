<script setup lang="ts">
interface Props {
  title?: string
  eyebrow?: string
}

defineProps<Props>()
</script>

<template>
  <div
    class="grid min-h-[100dvh] bg-bg text-text-primary md:grid-cols-[240px_1fr]"
  >
    <DashboardSidebarNav class="hidden md:flex" />
    <div class="flex min-h-[100dvh] flex-col">
      <DashboardTopBar :title="title" :eyebrow="eyebrow" />
      <main class="flex-1 px-6 py-8 md:px-10 md:py-10">
        <slot />
      </main>
    </div>
  </div>
</template>
