import type { Database } from '~/types/database.types'

type LeadStatus = Database['public']['Enums']['lead_status']

export interface LeadListItem {
  id: string
  status: LeadStatus
  source: string | null
  display_name: string | null
  contact_value: string | null
  first_seen: string
  last_seen: string
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
}

export interface DashboardLeadsResponse {
  items: LeadListItem[]
  total: number
  page: number
  pageSize: number
}

const VALID_STATUS: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']

export default defineEventHandler(async (event): Promise<DashboardLeadsResponse> => {
  const q = getQuery(event)
  const page = Math.max(1, Number(q.page) || 1)
  const pageSize = Math.min(100, Math.max(10, Number(q.pageSize) || 25))

  const statusFilter = Array.isArray(q.status)
    ? (q.status as string[]).filter((s): s is LeadStatus => VALID_STATUS.includes(s as LeadStatus))
    : typeof q.status === 'string' && VALID_STATUS.includes(q.status as LeadStatus)
      ? [q.status as LeadStatus]
      : null

  const source = typeof q.source === 'string' ? q.source : null
  const utm_campaign = typeof q.utm_campaign === 'string' ? q.utm_campaign : null
  const search = typeof q.search === 'string' ? q.search.trim().slice(0, 128) : null
  const since = typeof q.since === 'string' ? q.since : null
  const until = typeof q.until === 'string' ? q.until : null

  const client = serverSupabaseServiceRole(event)

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = client
    .from('leads')
    .select(
      'id, status, source, display_name, contact_value, first_seen, last_seen, utm_source, utm_medium, utm_campaign',
      { count: 'exact' }
    )
    .order('last_seen', { ascending: false })

  if (statusFilter?.length) query = query.in('status', statusFilter)
  if (source) query = query.eq('source', source)
  if (utm_campaign) query = query.eq('utm_campaign', utm_campaign)
  if (since) query = query.gte('first_seen', since)
  if (until) query = query.lt('first_seen', until)
  if (search) {
    query = query.or(
      `display_name.ilike.%${search}%,contact_value.ilike.%${search}%,source.ilike.%${search}%`
    )
  }

  const { data, error, count } = await query.range(from, to)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return {
    items: (data ?? []) as LeadListItem[],
    total: count ?? 0,
    page,
    pageSize
  }
})
