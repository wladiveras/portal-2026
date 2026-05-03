<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'default'
})

const isLoading = ref(true)
</script>

<template>
  <main>
    <SectionsLoadingScreen v-if="isLoading" @complete="isLoading = false" />
    <template v-if="!isLoading">
      <SectionsHeroSection />
      <UiFloatingNav />
      <SectionsStorySection />
      <SectionsSelectedWorksSection />
      <SectionsTestimonialsSection />
      <SectionsContactFooterSection />
    </template>
  </main>
</template>
