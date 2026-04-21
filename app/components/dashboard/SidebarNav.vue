<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

interface NavItem {
  label: string
  to: string
  icon: string
  adminOnly?: boolean
}

const { isAdmin } = useRole()

const items: NavItem[] = [
  { label: 'Overview', to: '/dashboard', icon: 'lucide:layout-dashboard' },
  { label: 'Leads', to: '/dashboard/leads', icon: 'lucide:users-round' },
  { label: 'Projetos', to: '/dashboard/projects', icon: 'lucide:kanban' },
  { label: 'Acessos', to: '/dashboard/access', icon: 'lucide:shield-check', adminOnly: true }
]

const visible = computed(() => items.filter((i) => !i.adminOnly || isAdmin.value))
</script>

<template>
  <aside
    class="sticky top-0 flex h-[100dvh] w-full flex-col gap-6 border-r border-stroke bg-surface px-5 py-6"
  >
    <NuxtLink
      to="/dashboard"
      class="flex items-center gap-2 font-display text-2xl italic leading-none text-text-primary"
    >
      <span class="accent-gradient bg-clip-text text-transparent">Wladi</span>
      <span class="text-sm font-sans not-italic text-muted">Admin</span>
    </NuxtLink>

    <nav class="flex flex-col gap-1 text-sm">
      <NuxtLink
        v-for="item in visible"
        :key="item.to"
        :to="item.to"
        class="group flex items-center gap-3 rounded-xl px-3 py-2 text-muted transition-colors hover:bg-bg hover:text-text-primary"
        active-class="bg-bg text-text-primary shadow-[inset_0_0_0_1px_hsl(var(--stroke))]"
      >
        <Icon :icon="item.icon" class="h-4 w-4" aria-hidden="true" />
        <span>{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <div class="mt-auto text-[11px] uppercase tracking-[0.28em] text-muted">
      Portal 2026 · Dashboard
    </div>
  </aside>
</template>
