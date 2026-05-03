<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useDashboardApi } from '~~/layers/2-dashboard/app/composables/dashboard/useDashboardApi'

interface Props {
  title?: string
  eyebrow?: string
}

defineProps<Props>()

const { profile, load } = useRole()
const client = useSupabaseClient()
const user = useSupabaseUser()
const { mode: theme, toggle: toggleTheme } = useTheme()
const { uploadAvatar } = useDashboardApi()

const displayName = computed(() => {
  const profileName = profile.value?.full_name?.trim()
  if (profileName) return profileName

  const metadataName = (user.value?.user_metadata?.full_name as string | undefined)?.trim()
  if (metadataName) return metadataName

  const email = user.value?.email?.trim() ?? ''
  if (email.includes('@')) return email.split('@')[0]
  if (email) return email
  return 'Conta'
})

const avatarUrl = computed(() => profile.value?.avatar_url?.trim() || null)

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

const avatarUploading = ref(false)
const avatarError = ref<string | null>(null)
const avatarInputRef = ref<HTMLInputElement | null>(null)

function openAvatarPicker() {
  if (avatarUploading.value) return
  avatarInputRef.value?.click()
}

async function onAvatarSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  avatarError.value = null
  avatarUploading.value = true
  try {
    await uploadAvatar(file)
    await load(true)
  } catch (error: unknown) {
    avatarError.value = error instanceof Error ? error.message : 'Falha ao enviar avatar'
  } finally {
    avatarUploading.value = false
    input.value = ''
  }
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

      <div class="flex items-center gap-3 rounded-full border border-stroke bg-surface/70 px-2 py-1 pr-3 backdrop-blur">
        <button
          type="button"
          class="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-text-primary text-xs font-semibold text-white"
          :aria-label="avatarUploading ? 'Enviando avatar' : 'Trocar avatar'"
          :disabled="avatarUploading"
          @click="openAvatarPicker"
        >
          <UiAvatarBadge
            :name="displayName"
            :image-url="avatarUrl"
            size-class="h-7 w-7"
            text-class="text-[10px]"
          />
          <span
            class="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-stroke bg-bg text-text-primary"
          >
            <Icon :icon="avatarUploading ? 'lucide:loader-2' : 'lucide:camera'" class="h-2.5 w-2.5" :class="avatarUploading ? 'animate-spin' : ''" />
          </span>
        </button>
        <input
          ref="avatarInputRef"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          class="hidden"
          @change="onAvatarSelected"
        >
        <div class="flex flex-col leading-tight">
          <span class="text-xs text-text-primary">{{ displayName }}</span>
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
  <p v-if="avatarError" class="px-6 pt-1 text-xs text-rose-500">{{ avatarError }}</p>
</template>
