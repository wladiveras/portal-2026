<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { AuditItem, DashboardAuditResponse } from '~/../server/api/dashboard/audit.get'

const { data, pending } = await useFetch<DashboardAuditResponse>('/api/dashboard/audit', {
  default: () => ({ items: [] as AuditItem[], next_cursor: null })
})

const ICON: Record<string, string> = {
  role_changed: 'lucide:shield-check',
  profile_disabled: 'lucide:lock',
  profile_enabled: 'lucide:unlock',
  profile_deleted: 'lucide:user-x',
  invite_created: 'lucide:send',
  invite_consumed: 'lucide:user-check',
  invite_revoked: 'lucide:trash-2'
}

function relative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.round(diff / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `${min} min`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr} h`
  return `${Math.round(hr / 24)} d`
}
</script>

<template>
  <section class="rounded-2xl border border-stroke bg-surface/80">
    <header class="flex items-center justify-between border-b border-stroke/70 px-5 py-3">
      <h3 class="text-[10px] uppercase tracking-[0.32em] text-muted">Auditoria</h3>
      <span class="text-xs text-muted">{{ data?.items.length ?? 0 }} eventos</span>
    </header>
    <ul class="max-h-[360px] space-y-2 overflow-y-auto p-4 text-sm">
      <li v-if="pending" class="text-xs text-muted">Carregando…</li>
      <li v-else-if="!data?.items.length" class="text-xs text-muted">Sem eventos ainda.</li>
      <li
        v-for="item in data?.items ?? []"
        v-else
        :key="item.id"
        class="flex items-start gap-3"
      >
        <span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-stroke bg-bg text-muted">
          <Icon :icon="ICON[item.action] ?? 'lucide:history'" class="h-3.5 w-3.5" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="text-text-primary">
            <span class="font-medium">{{ item.action }}</span>
            <span class="text-muted"> · {{ item.target_type }}</span>
            <span v-if="item.target_id" class="ml-1 text-muted">#{{ item.target_id.slice(0, 8) }}</span>
          </p>
          <p class="text-[11px] text-muted">
            {{ item.actor_label ?? 'sistema' }} · há {{ relative(item.created_at) }}
          </p>
        </div>
      </li>
    </ul>
  </section>
</template>
