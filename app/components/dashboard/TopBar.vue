<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'

interface Props {
  title?: string
  eyebrow?: string
}

defineProps<Props>()

const { profile } = useRole()
const client = useSupabaseClient()

const initials = computed(() => {
  const name = profile.value?.full_name ?? ''
  if (!name) return 'WV'
  return name
    .split(/\s+/)
    .map((s) => s.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
})

const roleLabel = computed(() => {
  switch (profile.value?.role) {
    case 'admin':
      return 'Admin'
    case 'editor':
      return 'Editor'
    case 'viewer':
      return 'Viewer'
    default:
      return '—'
  }
})

const theme = ref<'light' | 'dark'>('light')

onMounted(() => {
  const stored = (localStorage.getItem('theme') as 'light' | 'dark' | null) ?? 'light'
  theme.value = stored
  document.documentElement.dataset.theme = stored
})

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = theme.value
  localStorage.setItem('theme', theme.value)
}

async function logout() {
  await client.auth.signOut()
  await navigateTo('/login')
}
</script>

<template>
  <header
    class="sticky top-0 z-30 flex items-center gap-4 border-b border-stroke bg-bg/85 px-6 py-4 backdrop-blur"
  >
    <div class="flex flex-col">
      <span v-if="eyebrow" class="text-[10px] uppercase tracking-[0.32em] text-muted">
        {{ eyebrow }}
      </span>
      <h1 class="font-display text-2xl italic leading-tight text-text-primary">
        {{ title ?? 'Dashboard' }}
      </h1>
    </div>

    <div class="ml-auto flex items-center gap-2">
      <button
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-full border border-stroke bg-surface text-text-primary transition-colors hover:bg-bg"
        :aria-label="theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'"
        @click="toggleTheme"
      >
        <Icon :icon="theme === 'dark' ? 'lucide:sun' : 'lucide:moon'" class="h-4 w-4" />
      </button>

      <div
        class="flex items-center gap-3 rounded-full border border-stroke bg-surface/70 px-2 py-1 pr-3 backdrop-blur"
      >
        <span
          class="flex h-7 w-7 items-center justify-center rounded-full bg-text-primary text-xs font-semibold text-white"
        >
          {{ initials }}
        </span>
        <div class="flex flex-col leading-tight">
          <span class="text-xs text-text-primary">{{ profile?.full_name ?? 'Convidado' }}</span>
          <span class="text-[10px] uppercase tracking-[0.2em] text-muted">{{ roleLabel }}</span>
        </div>
        <button
          type="button"
          class="ml-2 text-muted hover:text-text-primary"
          aria-label="Sair"
          @click="logout"
        >
          <Icon icon="lucide:log-out" class="h-4 w-4" />
        </button>
      </div>
    </div>
  </header>
</template>
