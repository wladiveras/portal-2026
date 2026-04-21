import { computed, ref, watch } from 'vue'
import type { Database } from '~/types/database.types'
import type { DashboardLeadsResponse } from '~~/server/api/dashboard/leads/index.get'

type LeadStatus = Database['public']['Enums']['lead_status']

export interface LeadsFilters {
  status: LeadStatus[]
  source: string | null
  utm_campaign: string | null
  search: string
  since: string | null
  until: string | null
}

export const EMPTY_FILTERS: LeadsFilters = {
  status: [],
  source: null,
  utm_campaign: null,
  search: '',
  since: null,
  until: null
}

export function useLeadsQuery() {
  const page = ref(1)
  const pageSize = ref(25)
  const filters = ref<LeadsFilters>({ ...EMPTY_FILTERS })

  const query = computed<Record<string, string | string[] | number>>(() => {
    const q: Record<string, string | string[] | number> = {
      page: page.value,
      pageSize: pageSize.value
    }
    if (filters.value.status.length) q.status = filters.value.status
    if (filters.value.source) q.source = filters.value.source
    if (filters.value.utm_campaign) q.utm_campaign = filters.value.utm_campaign
    if (filters.value.search.trim()) q.search = filters.value.search.trim()
    if (filters.value.since) q.since = filters.value.since
    if (filters.value.until) q.until = filters.value.until
    return q
  })

  const { data, pending, error, refresh } = useFetch<DashboardLeadsResponse>(
    '/api/dashboard/leads',
    {
      query,
      watch: [query],
      default: () => ({ items: [], total: 0, page: 1, pageSize: 25 })
    }
  )

  watch(filters, () => (page.value = 1), { deep: true })

  return { page, pageSize, filters, data, pending, error, refresh }
}
