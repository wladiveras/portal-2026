<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { landing } from '~/data/landing'
import type { Testimonial } from '~/types/portfolio'

defineProps<{
  t: Testimonial
}>()
</script>

<template>
  <article
    tabindex="0"
    class="t-marquee-card group relative flex w-[278px] shrink-0 flex-col overflow-hidden rounded-2xl border border-white/90 bg-white/50 ring-1 ring-[#89aacc]/18 backdrop-blur-lg sm:w-[292px] md:w-[304px]"
  >
    <div class="relative z-[1] flex flex-col p-3.5 md:p-4">
      <div class="flex gap-2.5">
        <div
          class="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/85 bg-bg ring-1 ring-stroke/25 transition-[transform,box-shadow] duration-500 ease-out group-hover:scale-105 group-hover:ring-2 group-hover:ring-[#89aacc]/35"
        >
          <img
            v-if="t.avatar"
            :src="t.avatar"
            :alt="''"
            class="h-full w-full object-cover"
            loading="lazy"
          />
          <div
            v-else
            class="flex h-full w-full items-center justify-center font-display text-sm italic text-muted"
          >
            {{ t.name.charAt(0) }}
          </div>
        </div>
        <div class="min-w-0 flex-1 pt-0.5">
          <p class="truncate text-xs font-semibold leading-tight text-text-primary">
            {{ t.name }}
          </p>
          <p class="line-clamp-2 text-[10px] leading-snug text-muted">
            {{ t.role }} · {{ t.company }}
          </p>
        </div>
      </div>

      <Icon
        icon="mdi:format-quote-open"
        class="pointer-events-none absolute right-3 top-3 h-8 w-8 text-[#89aacc]/22 transition-all duration-500 ease-out group-hover:scale-110 group-hover:text-[#4e85bf]/35"
        aria-hidden="true"
      />

      <div
        class="quote-shell mt-3 overflow-hidden transition-[max-height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] max-h-[4.35rem] group-hover:max-h-[min(28rem,56vh)] group-focus-within:max-h-[min(28rem,56vh)]"
      >
        <p
          class="text-[11px] leading-[1.68] text-muted transition-[color] duration-300 md:text-xs group-hover:text-text-primary/92 group-focus-within:text-text-primary/92"
        >
          “{{ t.quote }}”
        </p>
      </div>

      <p
        class="expand-hint mt-2 text-[9px] font-medium uppercase tracking-[0.12em] text-[#4e85bf]/80 transition-all duration-300 ease-out group-hover:invisible group-hover:mt-0 group-hover:h-0 group-hover:opacity-0 group-hover:translate-y-1 group-focus-within:invisible group-focus-within:mt-0 group-focus-within:h-0 group-focus-within:opacity-0"
      >
        {{ landing.testimonials.hoverExpandHint }}
      </p>

      <a
        v-if="t.linkedinUrl"
        :href="t.linkedinUrl"
        target="_blank"
        rel="noreferrer"
        class="mt-2 inline-flex translate-y-1.5 items-center gap-1.5 text-[11px] font-medium text-[#4e85bf] opacity-0 pointer-events-none transition-all duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100"
        @click.stop
      >
        <Icon icon="ri:linkedin-fill" class="h-3.5 w-3.5 shrink-0" />
        {{ landing.testimonials.linkedinLabel }}
      </a>
    </div>
  </article>
</template>

<style scoped>
.t-marquee-card {
  transition-property: transform, box-shadow, border-color, background-color, ring-color;
  transition-duration: 0.35s;
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.t-marquee-card:hover,
.t-marquee-card:focus-within {
  z-index: 30;
  transform: scale(1.055) translateY(-0.45rem);
  border-color: rgb(255 255 255 / 0.95);
  background-color: rgb(255 255 255 / 0.9);
  box-shadow:
    0 28px 70px -28px rgba(78, 133, 191, 0.38),
    0 0 0 1px rgba(137, 170, 204, 0.14);
}

.t-marquee-card:focus-visible {
  outline: 2px solid rgb(78 133 191);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .t-marquee-card {
    transition-duration: 0.12s;
  }

  .t-marquee-card:hover,
  .t-marquee-card:focus-within {
    transform: none;
  }

  .quote-shell {
    transition-duration: 0.15s;
  }
}
</style>
