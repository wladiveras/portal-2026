<script setup lang="ts">
import type { ProfileListItem } from '~~/server/api/dashboard/profiles/index.get'
import type { Database } from '~/types/database.types'

type Invite = Database['public']['Tables']['invites']['Row']

definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  role: 'admin'
})

const user = useSupabaseUser()

const { data: profiles, pending, refresh } = await useFetch<ProfileListItem[]>(
  '/api/dashboard/profiles',
  { default: () => [] as ProfileListItem[] }
)

const { data: invites, refresh: refreshInvites } = await useFetch<Invite[]>(
  '/api/dashboard/invites',
  { default: () => [] as Invite[] }
)

function onProfileUpdated(updated: ProfileListItem) {
  if (!profiles.value) return
  const idx = profiles.value.findIndex((p) => p.id === updated.id)
  if (idx >= 0) profiles.value[idx] = { ...profiles.value[idx], ...updated }
}

async function revokeInvite(token: string) {
  const url: string = `/api/dashboard/invites/${token}`
  await $fetch(url, { method: 'DELETE' })
  refreshInvites()
}
</script>

<template>
  <NuxtLayout name="dashboard" eyebrow="Acessos" title="Quem pode entrar">
    <div class="space-y-6">
      <DashboardAccessInviteUserForm @invited="() => refreshInvites()" />

      <section
        v-if="invites && invites.length"
        class="rounded-2xl border border-stroke bg-surface/70 p-4"
      >
        <h3 class="text-[10px] uppercase tracking-[0.32em] text-muted">Convites pendentes</h3>
        <ul class="mt-3 space-y-2 text-sm">
          <li
            v-for="inv in invites"
            :key="inv.token"
            class="flex items-center justify-between gap-3 rounded-xl border border-stroke bg-bg p-3"
          >
            <div class="flex flex-col">
              <span class="text-text-primary">{{ inv.email }}</span>
              <span class="text-xs text-muted">
                role <strong>{{ inv.role }}</strong> · expira em {{ new Date(inv.expires_at).toLocaleDateString('pt-BR') }}
              </span>
            </div>
            <button
              type="button"
              class="text-xs text-rose-500 hover:underline"
              @click="revokeInvite(inv.token)"
            >
              Revogar
            </button>
          </li>
        </ul>
      </section>

      <DashboardAccessProfilesTable
        :items="profiles ?? []"
        :current-user-id="user?.id ?? null"
        :loading="pending"
        @updated="(p) => { onProfileUpdated(p); refresh() }"
      />

      <DashboardAccessAuditLogTable />
    </div>
  </NuxtLayout>
</template>
