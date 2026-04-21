import type { Database, Json } from '~/types/database.types'

type AuditRow = Database['public']['Tables']['audit_log']['Row']

export interface AuditItem {
  id: number
  actor_id: string | null
  actor_label: string | null
  action: string
  target_type: string
  target_id: string | null
  meta: Json
  created_at: string
}

export interface DashboardAuditResponse {
  items: AuditItem[]
  next_cursor: string | null
}

export default defineEventHandler(async (event): Promise<DashboardAuditResponse> => {
  await requireAdmin(event)
  const q = getQuery(event)
  const limit = Math.min(100, Math.max(10, Number(q.limit) || 50))
  const cursor = typeof q.cursor === 'string' ? q.cursor : null

  const service = serverSupabaseServiceRole(event)
  let query = service
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (cursor) query = query.lt('created_at', cursor)

  const { data, error } = await query
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  const rows = (data ?? []) as AuditRow[]
  const actors = Array.from(new Set(rows.map((r) => r.actor_id).filter((v): v is string => !!v)))
  const actorLabels = new Map<string, string>()
  if (actors.length) {
    const { data: profiles } = await service
      .from('profiles')
      .select('id, full_name')
      .in('id', actors)
    for (const p of profiles ?? []) actorLabels.set(p.id, p.full_name ?? p.id)
  }

  const items: AuditItem[] = rows.map((r) => ({
    id: r.id,
    actor_id: r.actor_id,
    actor_label: r.actor_id ? actorLabels.get(r.actor_id) ?? r.actor_id : null,
    action: r.action,
    target_type: r.target_type,
    target_id: r.target_id,
    meta: r.meta,
    created_at: r.created_at
  }))

  const next_cursor = items.length === limit ? items[items.length - 1]?.created_at ?? null : null
  return { items, next_cursor }
})
