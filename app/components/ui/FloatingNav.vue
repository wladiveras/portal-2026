<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { landing } from '~/data/landing'
import { onInPageHashClick } from '~/utils/inPageHashNav'

const open = ref(false)
const panelRef = ref<HTMLElement | null>(null)

function close() {
  open.value = false
}

function toggle() {
  open.value = !open.value
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

watch(open, (v) => {
  if (import.meta.client) {
    document.body.style.overflow = v ? 'hidden' : ''
  }
})

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="fixed right-4 top-4 z-[60] md:right-6 md:top-6">
    <button
      type="button"
      class="flex h-11 w-11 items-center justify-center rounded-full border border-stroke/80 bg-white/85 text-text-primary shadow-[0_8px_30px_-12px_rgba(41,67,101,0.25)] backdrop-blur-xl transition-transform duration-200 ease-out hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-primary"
      :aria-expanded="open"
      aria-controls="site-nav-panel"
      :aria-label="open ? 'Fechar menu' : 'Abrir menu'"
      @click="toggle"
    >
      <Icon :icon="open ? 'lucide:x' : 'lucide:menu'" class="h-5 w-5" aria-hidden="true" />
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-1"
    >
      <div
        v-show="open"
        id="site-nav-panel"
        ref="panelRef"
        class="absolute right-0 top-[3.25rem] w-[min(calc(100vw-2rem),280px)] overflow-hidden rounded-2xl border border-white/80 bg-white/92 py-2 shadow-[0_24px_48px_-16px_rgba(41,67,101,0.28)] backdrop-blur-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Navegação"
      >
        <div class="border-b border-stroke/60 px-4 py-3">
          <p class="font-display text-lg italic text-text-primary">{{ landing.nav.logo }}</p>
          <p class="text-[10px] uppercase tracking-[0.2em] text-muted">Navegação</p>
        </div>
        <nav class="flex flex-col p-2">
          <a
            v-for="item in landing.nav.items"
            :key="item.id"
            :href="item.href"
            class="rounded-xl px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-surface"
            @click="
              (e) => {
                onInPageHashClick(e, item.href)
                close()
              }
            "
          >
            {{ item.label }}
          </a>
          <a
            :href="landing.nav.cta.href"
            class="mx-2 mt-2 flex items-center justify-center gap-2 rounded-xl bg-text-primary py-3 text-sm font-medium text-bg transition-transform hover:scale-[1.02]"
            @click="
              (e) => {
                onInPageHashClick(e, landing.nav.cta.href)
                close()
              }
            "
          >
            <Icon :icon="landing.nav.cta.icon" class="h-4 w-4" />
            {{ landing.nav.cta.label }}
          </a>
        </nav>
      </div>
    </Transition>
  </div>

  <Transition
    enter-active-class="transition-opacity duration-150"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <button
      v-show="open"
      type="button"
      class="fixed inset-0 z-[55] bg-text-primary/15 backdrop-blur-[2px]"
      aria-label="Fechar menu"
      @click="close"
    />
  </Transition>
</template>
