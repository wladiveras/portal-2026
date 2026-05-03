<script setup lang="ts">
interface Props {
  name?: string | null
  imageUrl?: string | null
  sizeClass?: string
  textClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  name: null,
  imageUrl: null,
  sizeClass: 'h-8 w-8',
  textClass: 'text-[11px]'
})

const initial = computed(() => {
  const source = props.name?.trim()
  if (!source) return 'U'
  return source.charAt(0).toUpperCase()
})

const normalizedImage = computed(() => props.imageUrl?.trim() || null)
</script>

<template>
  <span
    class="flex items-center justify-center overflow-hidden rounded-full bg-text-primary/85 font-semibold text-white"
    :class="[sizeClass, textClass]"
  >
    <img
      v-if="normalizedImage"
      :src="normalizedImage"
      alt="Avatar"
      class="h-full w-full object-cover"
    >
    <span v-else>{{ initial }}</span>
  </span>
</template>
