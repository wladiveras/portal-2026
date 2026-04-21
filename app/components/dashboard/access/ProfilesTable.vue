<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { Database } from '~/types/database.types'
import type { ProfileListItem } from '~/../server/api/dashboard/profiles/index.get'

type UserRole = Database['public']['Enums']['user_role']

interface Props {
  items: ProfileListItem[]
  currentUserId?: string | null
  loading?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ updated: [profile: ProfileListItem] }>()

const ROLES: UserRole[] = ['admin', 'editor', 'viewer']

const saving = ref<string | null>(null)
const error = ref<string | null>(null)

async function patch(profile: ProfileListItem, body: { role?: UserRole; disabled?: boolean }) {
  saving.value = profile.id
  error.value = null
  try {
    const url: string = `/api/dashboard/profiles/${profile.id}`
    const updated = (await $fetch(url, { method: 'PATCH', body })) as ProfileListItem
    emit('updated', { ...profile, ...updated })
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Falha ao atualizar.'
  } finally {
    saving.value = null
  }
}
</script>

<template>
  <section class="overflow-hidden rounded-2xl border border-stroke bg-surface/80">
    <table class="w-full text-left text-sm">
      <thead class="bg-bg/60 text-[10px] uppercase tracking-[0.22em] text-muted">
        <tr>
          <th class="px-4 py-3">Pessoa</th>
          <th class="px-4 py-3">Role</th>
          <th class="px-4 py-3">Último login</th>
          <th class="px-4 py-3 text-right">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="4" class="px-4 py-8 text-center text-muted">Carregando…</td>
        </tr>
        <tr v-else-if="!items.length">
          <td colspan="4" class="px-4 py-8 text-center text-muted">Sem usuários ainda.</td>
        </tr>
        <tr
          v-for="p in items"
          v-else
          :key="p.id"
          class="border-t border-stroke/70"
        >
          <td class="px-4 py-3">
            <div class="flex flex-col">
              <span class="text-text-primary">{{ p.full_name ?? p.email ?? '—' }}</span>
              <span class="text-xs text-muted">{{ p.email ?? '—' }}</span>
            </div>
          </td>
          <td class="px-4 py-3">
            <select
              :value="p.role"
              :disabled="p.id === currentUserId || saving === p.id"
              class="rounded-full border border-stroke bg-bg px-3 py-1 text-xs text-text-primary disabled:opacity-50"
              @change="(e) => patch(p, { role: (e.target as HTMLSelectElement).value as UserRole })"
            >
              <option v-for="r in ROLES" :key="r" :value="r">{{ r }}</option>
            </select>
          </td>
          <td class="px-4 py-3 text-muted">
            {{ p.last_sign_in_at ? new Date(p.last_sign_in_at).toLocaleString('pt-BR') : '—' }}
          </td>
          <td class="px-4 py-3 text-right">
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-full border border-stroke px-2.5 py-1 text-[11px] transition-colors"
              :class="p.disabled ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'"
              :disabled="p.id === currentUserId || saving === p.id"
              @click="patch(p, { disabled: !p.disabled })"
            >
              <Icon :icon="p.disabled ? 'lucide:lock' : 'lucide:check-circle-2'" class="h-3 w-3" />
              {{ p.disabled ? 'Desativado' : 'Ativo' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-if="error" class="border-t border-stroke/60 bg-rose-500/10 px-4 py-2 text-xs text-rose-500">
      {{ error }}
    </p>
  </section>
</template>
