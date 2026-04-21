import type { Database, Json } from '~/types/database.types'

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

  const client = serverSupabaseServiceRole(event)

  const [leadRes, eventsRes, notesRes] = await Promise.all([
    client.from('leads').select('*').eq('id', id).maybeSingle(),
    client
      .from('lead_events')
      .select('*')
      .eq('lead_id', id)
      .order('created_at', { ascending: false })
      .limit(200),
    client
      .from('lead_notes')
      .select('*')
      .eq('lead_id', id)
      .order('created_at', { ascending: false })
      .limit(50)
  ])

  if (leadRes.error) throw createError({ statusCode: 500, statusMessage: leadRes.error.message })
  if (!leadRes.data) throw createError({ statusCode: 404, statusMessage: 'lead not found' })
  if (eventsRes.error) {
    throw createError({ statusCode: 500, statusMessage: eventsRes.error.message })
  }
  if (notesRes.error) {
    throw createError({ statusCode: 500, statusMessage: notesRes.error.message })
  }

  return {
    lead: leadRes.data as Lead,
    events: (eventsRes.data ?? []) as LeadEvent[],
    notes: (notesRes.data ?? []) as LeadNote[]
  }
})

export type { Json }
