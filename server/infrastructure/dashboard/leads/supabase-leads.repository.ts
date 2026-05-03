import type { Service } from '~~/server/domain/dashboard/shared'
import type {
  Lead,
  LeadActivityFeedItem,
  LeadChartRow,
  LeadConversionStats,
  LeadEvent,
  LeadNote,
  LeadsRepositoryPort,
  LeadStatus,
  ListLeadsFilters,
  PaginatedLeads
} from '~~/server/domain/dashboard/leads/repositories'

const VALID_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  new: ['contacted', 'lost'],
  contacted: ['qualified', 'lost'],
  qualified: ['proposal', 'lost'],
  proposal: ['won', 'lost'],
  won: [],
  lost: []
}

export function createSupabaseLeadsRepository(service: Service): LeadsRepositoryPort {
  return {
    async list(filters: ListLeadsFilters): Promise<PaginatedLeads> {
      const page = Math.max(1, filters.page ?? 1)
      const pageSize = Math.min(100, Math.max(10, filters.pageSize ?? 25))
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      let query = service
        .from('leads')
        .select(
          'id, status, source, display_name, contact_value, first_seen, last_seen, utm_source, utm_medium, utm_campaign',
          { count: 'exact' }
        )
        .order('last_seen', { ascending: false })

      if (filters.status?.length) query = query.in('status', filters.status)
      if (filters.source?.length) query = query.in('source', filters.source)
      if (filters.utmCampaign) query = query.eq('utm_campaign', filters.utmCampaign)
      if (filters.from) query = query.gte('first_seen', filters.from)
      if (filters.to) query = query.lt('first_seen', filters.to)
      if (filters.q?.trim()) {
        const q = filters.q.trim().slice(0, 128)
        query = query.or(`display_name.ilike.%${q}%,contact_value.ilike.%${q}%,source.ilike.%${q}%`)
      }

      const { data, error, count } = await query.range(from, to)
      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      return {
        items: (data ?? []) as Lead[],
        total: count ?? 0,
        page,
        pageSize
      }
    },

    async getById(id: string) {
      const { data, error } = await service.from('leads').select('*').eq('id', id).maybeSingle()
      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      return data
    },

    async getDetailById(id: string) {
      const [leadRes, eventsRes, notesRes] = await Promise.all([
        service.from('leads').select('*').eq('id', id).maybeSingle(),
        service
          .from('lead_events')
          .select('*')
          .eq('lead_id', id)
          .order('created_at', { ascending: false })
          .limit(200),
        service
          .from('lead_notes')
          .select('*')
          .eq('lead_id', id)
          .order('created_at', { ascending: false })
          .limit(50)
      ])

      if (leadRes.error) throw createError({ statusCode: 500, statusMessage: leadRes.error.message })
      if (!leadRes.data) return null
      if (eventsRes.error) throw createError({ statusCode: 500, statusMessage: eventsRes.error.message })
      if (notesRes.error) throw createError({ statusCode: 500, statusMessage: notesRes.error.message })

      return {
        lead: leadRes.data as Lead,
        events: (eventsRes.data ?? []) as LeadEvent[],
        notes: (notesRes.data ?? []) as LeadNote[]
      }
    },

    async getLeadConversionStats(input: {
      currentSince: string
      previousSince: string
      previousUntil: string
    }): Promise<LeadConversionStats> {
      async function countLeads(since: string, until?: string) {
        let q = service.from('leads').select('id', { count: 'exact', head: true }).gte('first_seen', since)
        if (until) q = q.lt('first_seen', until)
        const { count, error } = await q
        if (error) throw createError({ statusCode: 500, statusMessage: error.message })
        return count ?? 0
      }
      async function countConversions(since: string, until?: string) {
        let q = service
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'won')
          .gte('first_seen', since)
        if (until) q = q.lt('first_seen', until)
        const { count, error } = await q
        if (error) throw createError({ statusCode: 500, statusMessage: error.message })
        return count ?? 0
      }
      const [leadsCurrent, leadsPrevious, convCurrent, convPrevious] = await Promise.all([
        countLeads(input.currentSince),
        countLeads(input.previousSince, input.previousUntil),
        countConversions(input.currentSince),
        countConversions(input.previousSince, input.previousUntil)
      ])
      return {
        leads: { current: leadsCurrent, previous: leadsPrevious },
        conversions: { current: convCurrent, previous: convPrevious }
      }
    },

    async getLeadChartRows(sinceIso: string, limit = 5000): Promise<LeadChartRow[]> {
      const { data, error } = await service
        .from('leads')
        .select('first_seen, status, utm_source')
        .gte('first_seen', sinceIso)
        .limit(limit)
      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      return (data ?? []).map((row) => ({
        first_seen: row.first_seen,
        status: row.status as LeadStatus,
        utm_source: row.utm_source
      }))
    },

    async listLeadActivityFeed(input: { limit: number; cursor: string | null }): Promise<LeadActivityFeedItem[]> {
      let q = service
        .from('lead_events')
        .select('id, type, target, path, meta, created_at')
        .order('created_at', { ascending: false })
        .limit(input.limit)
      if (input.cursor) q = q.lt('created_at', input.cursor)
      const { data, error } = await q
      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      return (data ?? []).map((row) => ({
        id: String(row.id),
        type: row.type,
        target: row.target,
        path: row.path,
        meta: row.meta,
        created_at: row.created_at
      }))
    },

    async updateStatus(input) {
      const { data: lead, error: leadError } = await service
        .from('leads')
        .select('id, status')
        .eq('id', input.id)
        .maybeSingle()
      if (leadError) throw createError({ statusCode: 500, statusMessage: leadError.message })
      if (!lead) throw createError({ statusCode: 404, statusMessage: 'lead not found' })

      if (lead.status !== input.status) {
        const { data: profile } = await service.from('profiles').select('role').eq('id', input.actorId).maybeSingle()
        const isForward = (VALID_TRANSITIONS[lead.status] ?? []).includes(input.status)
        if (!isForward && profile?.role !== 'admin') {
          throw createError({ statusCode: 409, statusMessage: 'invalid transition' })
        }
      }

      const { data, error } = await service
        .from('leads')
        .update({ status: input.status, last_seen: new Date().toISOString() })
        .eq('id', input.id)
        .select('*')
        .single()
      if (error) throw createError({ statusCode: 500, statusMessage: error.message })

      await service.from('lead_events').insert({
        lead_id: input.id,
        type: 'status_changed',
        target: input.status,
        meta: { actor: input.actorId, to: input.status }
      })
      await logAudit(service, {
        action: 'lead_status_changed',
        targetType: 'lead',
        targetId: input.id,
        meta: { actor_user_id: input.actorId, entity: 'lead', action: 'status_changed', to: input.status }
      })
      return data as Lead
    },

    async addNote(input) {
      const text = input.body.trim()
      if (!text || text.length > 4000) {
        throw createError({ statusCode: 400, statusMessage: 'body must be 1..4000 chars' })
      }
      const { data, error } = await service
        .from('lead_notes')
        .insert({ lead_id: input.leadId, author_id: input.actorId, body: text })
        .select('*')
        .single()
      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      await logAudit(service, {
        action: 'lead_note_added',
        targetType: 'lead',
        targetId: input.leadId,
        meta: { actor_user_id: input.actorId, entity: 'lead_note', action: 'insert', note_id: data.id, chars: text.length }
      })
      return data
    },

    async deleteById(input) {
      const { error } = await service.from('leads').delete().eq('id', input.id)
      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      await logAudit(service, {
        action: 'lead_deleted',
        targetType: 'lead',
        targetId: input.id,
        meta: { actor_user_id: input.actorId, entity: 'lead', action: 'delete' }
      })
    }
  }
}
