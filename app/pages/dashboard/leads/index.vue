<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['role'],
  role: ['admin', 'editor', 'viewer']
})

const { can, isAdmin } = useRole()
const route = useRoute()
const router = useRouter()

const { page, pageSize, filters, data, pending, refresh } = useLeadsQuery()

const selectedId = ref<string | null>(
  typeof route.query.id === 'string' ? route.query.id : null
)

watch(selectedId, (id) => {
  const next = { ...route.query }
  if (id) next.id = id
  else delete next.id
  router.replace({ query: next })
})

function openDrawer(id: string) {
  selectedId.value = id
}

function closeDrawer() {
  selectedId.value = null
}

function handleStatusUpdated() {
  refresh()
}

function handleDeleted(id: string) {
  selectedId.value = null
  refresh()
  if (data.value) {
    data.value = { ...data.value, items: data.value.items.filter((l) => l.id !== id) }
  }
}

const exportQuery = computed(() => {
  const q: Record<string, unknown> = {}
  if (filters.value.status.length) q.status = filters.value.status
  if (filters.value.source) q.source = filters.value.source
  if (filters.value.utm_campaign) q.utm_campaign = filters.value.utm_campaign
  if (filters.value.search.trim()) q.search = filters.value.search.trim()
  if (filters.value.since) q.since = filters.value.since
  if (filters.value.until) q.until = filters.value.until
  return q
})
</script>

<template>
  <NuxtLayout name="dashboard" eyebrow="Leads" title="Pipeline">
    <div class="space-y-4">
      <header class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-muted">
          {{ data?.total ?? 0 }} leads no total. Clique numa linha para abrir o detalhe.
        </p>
        <DashboardLeadsExportCsvButton :query="exportQuery" :disabled="!can('edit_leads')" />
      </header>

      <DashboardLeadsFilters v-model="filters" />

      <DashboardLeadsTable
        :items="data?.items ?? []"
        :loading="pending"
        :total="data?.total ?? 0"
        :page="page"
        :page-size="pageSize"
        :selected-id="selectedId"
        @select="openDrawer"
        @update:page="(p) => (page = p)"
      />

      <DashboardLeadsDrawer
        :lead-id="selectedId"
        :can-edit="can('edit_leads')"
        :can-delete="isAdmin"
        @close="closeDrawer"
        @status-updated="handleStatusUpdated"
        @deleted="handleDeleted"
      />
    </div>
  </NuxtLayout>
</template>
