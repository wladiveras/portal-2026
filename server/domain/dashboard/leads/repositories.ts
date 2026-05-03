import type { Database, Json } from '~/types/database.types'

export type Lead = Database['public']['Tables']['leads']['Row']
export type LeadEvent = Database['public']['Tables']['lead_events']['Row']
export type LeadNote = Database['public']['Tables']['lead_notes']['Row']

export type LeadStatus = Lead['status']

export interface ListLeadsFilters {
  q?: string
  status?: LeadStatus[]
  source?: string[]
  utmCampaign?: string
  from?: string
  to?: string
  page?: number
  pageSize?: number
}

export interface PaginatedLeads {
  items: Lead[]
  total: number
  page: number
  pageSize: number
}

export interface LeadDetail {
  lead: Lead
  events: LeadEvent[]
  notes: LeadNote[]
}

export interface StatPair {
  current: number
  previous: number
}

export interface LeadConversionStats {
  leads: StatPair
  conversions: StatPair
}

export interface LeadChartRow {
  first_seen: string
  status: LeadStatus
  utm_source: string | null
}

export interface LeadActivityFeedItem {
  id: string
  type: string
  target: string | null
  path: string | null
  meta: Json
  created_at: string
}

export interface LeadsRepositoryPort {
  list(filters: ListLeadsFilters): Promise<PaginatedLeads>
  getById(id: string): Promise<Lead | null>
  getDetailById(id: string): Promise<LeadDetail | null>
  getLeadConversionStats(input: {
    currentSince: string
    previousSince: string
    previousUntil: string
  }): Promise<LeadConversionStats>
  getLeadChartRows(sinceIso: string, limit?: number): Promise<LeadChartRow[]>
  listLeadActivityFeed(input: { limit: number; cursor: string | null }): Promise<LeadActivityFeedItem[]>
  updateStatus(input: { id: string; status: LeadStatus; actorId: string }): Promise<Lead>
  addNote(input: { leadId: string; actorId: string; body: string }): Promise<LeadNote>
  deleteById(input: { id: string; actorId: string }): Promise<void>
}
