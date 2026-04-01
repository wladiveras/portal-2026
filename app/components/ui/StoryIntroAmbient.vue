<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useReducedMotion } from '~/composables/useReducedMotion'

defineProps<{
  src: string
  /** Rótulo acessível do vídeo em loop */
  ariaLabel?: string
}>()

const { prefersReducedMotion } = useReducedMotion()
</script>

<template>
  <div class="contents">
    <div
      v-if="!prefersReducedMotion"
      class="relative z-[1] flex w-full min-h-[min(42dvh,300px)] items-center justify-center sm:min-h-[min(44dvh,340px)] md:min-h-[min(46dvh,380px)] lg:min-h-[min(64vh,520px)]"
    >
      <video
        :src="src"
        class="h-auto w-full max-w-none object-contain object-center [transform:translateZ(0)] scale-[1.08] sm:scale-[1.14] md:scale-[1.2] lg:max-h-[min(70vh,560px)] lg:scale-[1.28]"
        autoplay
        loop
        muted
        playsinline
        preload="auto"
        disablepictureinpicture
        tabindex="-1"
        :aria-label="ariaLabel ?? 'Vídeo em loop na seção Sobre'"
      />
    </div>
    <div
      v-else
      class="relative z-[1] flex w-full min-h-[min(38dvh,260px)] flex-col items-center justify-center gap-2 px-4 text-center sm:min-h-[min(40dvh,300px)] lg:min-h-[min(52vh,440px)]"
    >
      <Icon icon="lucide:clapperboard" class="h-10 w-10 text-accent/55" />
      <p class="text-xs font-medium uppercase tracking-[0.28em] text-muted">Vídeo pausado</p>
      <p class="max-w-[12rem] text-[11px] leading-relaxed text-muted/90">
        Animação desativada nas suas preferências de acessibilidade.
      </p>
    </div>
  </div>
</template>
