<script setup lang="ts">
import { onInPageHashClick } from '~/utils/inPageHashNav'

const props = defineProps<{
  label: string
  href?: string
  solid?: boolean
}>()

function handleClick(e: MouseEvent) {
  const h = props.href
  if (h?.startsWith('#') && h.length > 1) {
    onInPageHashClick(e, h)
  }
}
</script>

<template>
  <a
    :href="href || '#'"
    class="gradient-border inline-flex items-center rounded-full p-[2px] text-sm transition-transform duration-200 ease-out hover:scale-[1.06] active:scale-[0.98]"
    @click="handleClick"
  >
    <span
      class="inline-flex items-center gap-2 rounded-full px-7 py-3.5"
      :class="
        solid
          ? 'bg-slate-950 text-white shadow-[0_8px_24px_rgba(15,23,42,0.22)]'
          : 'bg-white/95 text-slate-900 border-2 border-slate-300'
      "
    >
      {{ label }}
      <span aria-hidden="true">↗</span>
    </span>
  </a>
</template>
