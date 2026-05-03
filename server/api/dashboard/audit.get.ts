import type { Database, Json } from '~/types/database.types'
import { qryListAudit } from '~~/server/application/dashboard/access/queries'

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
  const data = await qryListAudit(event, {
    limit: Number(q.limit) || undefined,
    cursor: typeof q.cursor === 'string' ? q.cursor : undefined
  })
  const items: AuditItem[] = (data.items as Array<AuditRow & { actor_label?: string | null }>).map((r) => ({
    id: r.id,
    actor_id: r.actor_id,
    actor_label: r.actor_label ?? r.actor_id,
    action: r.action,
    target_type: r.target_type,
    target_id: r.target_id,
    meta: r.meta,
    created_at: r.created_at
  }))
  return { items, next_cursor: data.next_cursor }
})
