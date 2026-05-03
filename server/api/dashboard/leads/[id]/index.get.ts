import type { Database, Json } from '~/types/database.types'
import { qryGetLeadDetail } from '~~/server/application/dashboard/leads/queries'

type Lead = Database['public']['Tables']['leads']['Row']
type LeadEvent = Database['public']['Tables']['lead_events']['Row']
type LeadNote = Database['public']['Tables']['lead_notes']['Row']

export interface DashboardLeadDetailResponse {
  lead: Lead
  events: LeadEvent[]
  notes: LeadNote[]
}

export default defineEventHandler(async (event): Promise<DashboardLeadDetailResponse> => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })

  const detail = await qryGetLeadDetail(event, id)
  return {
    lead: detail.lead as Lead,
    events: detail.events as LeadEvent[],
    notes: detail.notes as LeadNote[]
  }
})

export type { Json }
