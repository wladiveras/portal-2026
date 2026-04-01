<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { landing } from '~/data/landing'

const emit = defineEmits<{ complete: [] }>()
const words = [...landing.loading.words]
const activeWord = ref(words[0])
const count = ref(0)

let rafId = 0
let wordInterval = 0

onMounted(() => {
  const start = performance.now()
  const duration = 2700

  const tick = (time: number) => {
    const progress = Math.min((time - start) / duration, 1)
    count.value = Math.round(progress * 100)
    if (progress < 1) {
      rafId = requestAnimationFrame(tick)
    } else {
      setTimeout(() => emit('complete'), 400)
    }
  }

  rafId = requestAnimationFrame(tick)
  let index = 0
  wordInterval = window.setInterval(() => {
    index = (index + 1) % words.length
    activeWord.value = words[index]
  }, 900)
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  clearInterval(wordInterval)
})
</script>

<template>
  <div class="fixed inset-0 z-[9999] bg-bg">
    <div class="flex h-full flex-col justify-between p-8 md:p-12">
      <p class="text-xs uppercase tracking-[0.3em] text-muted">{{ landing.loading.eyebrow }}</p>
      <div class="text-center">
        <h2 class="font-display text-4xl italic text-text-primary/80 md:text-6xl lg:text-7xl">
          {{ activeWord }}
        </h2>
      </div>
      <div class="text-right font-display text-6xl tabular-nums text-text-primary md:text-8xl lg:text-9xl">
        {{ String(count).padStart(3, '0') }}
      </div>
      <div class="h-[3px] bg-stroke/50">
        <div
          class="accent-gradient h-full origin-left shadow-[0_0_8px_rgba(137,170,204,0.35)]"
          :style="{ transform: `scaleX(${count / 100})` }"
        />
      </div>
    </div>
  </div>
</template>
