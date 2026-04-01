<script setup lang="ts">
import { ref } from 'vue'

const isLoading = ref(true)
</script>

<template>
  <main>
    <SectionsLoadingScreen v-if="isLoading" @complete="isLoading = false" />
    <SectionsHeroSection />
    <UiFloatingNav />
    <SectionsStorySection />
    <SectionsSelectedWorksSection />
    <SectionsTestimonialsSection />
    <SectionsContactFooterSection />
  </main>
</template>
