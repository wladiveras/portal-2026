<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import type { Database } from '~/types/database.types'

type UserRole = Database['public']['Enums']['user_role']
type Invite = Database['public']['Tables']['invites']['Row']

const emit = defineEmits<{ invited: [invite: Invite] }>()

const email = ref('')
const role = ref<UserRole>('viewer')
const submitting = ref(false)
const error = ref<string | null>(null)
const notice = ref<string | null>(null)

async function submit() {
  if (submitting.value) return
  submitting.value = true
  error.value = null
  notice.value = null
  try {
    const res = (await $fetch('/api/dashboard/invites', {
      method: 'POST',
      body: { email: email.value, role: role.value }
    })) as { invite: Invite; warning?: string }
    email.value = ''
    notice.value = res.warning ? `Convite gravado (aviso: ${res.warning})` : 'Convite enviado!'
    emit('invited', res.invite)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Falha ao enviar convite.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form
    class="flex flex-col gap-3 rounded-2xl border border-stroke bg-surface/80 p-4 md:flex-row md:items-end"
    @submit.prevent="submit"
  >
    <div class="flex-1 space-y-1">
      <label class="block text-[10px] uppercase tracking-[0.28em] text-muted" for="invite-email">
        Email do convidado
      </label>
      <input
        id="invite-email"
        v-model="email"
        type="email"
        required
        placeholder="convidado@exemplo.com"
        class="w-full rounded-full border border-stroke bg-bg px-4 py-2 text-sm text-text-primary outline-none focus:border-accent"
      />
    </div>

    <div class="space-y-1">
      <label class="block text-[10px] uppercase tracking-[0.28em] text-muted" for="invite-role">Role</label>
      <select
        id="invite-role"
        v-model="role"
        class="rounded-full border border-stroke bg-bg px-3 py-2 text-sm text-text-primary"
      >
        <option value="admin">admin</option>
        <option value="editor">editor</option>
        <option value="viewer">viewer</option>
      </select>
    </div>

    <button
      type="submit"
      :disabled="submitting"
      class="inline-flex h-10 items-center gap-2 rounded-full bg-text-primary px-4 text-xs font-medium text-white disabled:opacity-40"
    >
      <Icon :icon="submitting ? 'lucide:loader-2' : 'lucide:send'" class="h-3.5 w-3.5" :class="submitting ? 'animate-spin' : ''" />
      Convidar
    </button>
  </form>

  <p v-if="notice" class="mt-2 text-xs text-emerald-600 dark:text-emerald-400">{{ notice }}</p>
  <p v-if="error" class="mt-2 text-xs text-rose-500">{{ error }}</p>
</template>
