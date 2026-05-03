import type { Database } from '~/types/database.types'
import { qryListLeads } from '~~/server/application/dashboard/leads/queries'

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

export default defineEventHandler(async (event): Promise<DashboardLeadsResponse> => {
  const q = getQuery(event)
  const data = await qryListLeads(event, {
    page: Number(q.page) || undefined,
    pageSize: Number(q.pageSize) || undefined,
    status: q.status as string[] | string | undefined,
    source: typeof q.source === 'string' ? q.source : undefined,
    utm_campaign: typeof q.utm_campaign === 'string' ? q.utm_campaign : undefined,
    search: typeof q.search === 'string' ? q.search : undefined,
    since: typeof q.since === 'string' ? q.since : undefined,
    until: typeof q.until === 'string' ? q.until : undefined
  })
  return {
    items: data.items as LeadListItem[],
    total: data.total,
    page: data.page,
    pageSize: data.pageSize
  }
})
