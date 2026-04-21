import type { Json } from '~/types/database.types'

export interface ActivityItem {
  id: string
  type: string
  target: string | null
  path: string | null
  meta: Json
  created_at: string
}

export interface DashboardActivityResponse {
  items: ActivityItem[]
  next_cursor: string | null
}

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

export default defineEventHandler(async (event): Promise<DashboardActivityResponse> => {
  const query = getQuery(event)
  const limit = Math.min(MAX_LIMIT, Number(query.limit) || DEFAULT_LIMIT)
  const cursor = typeof query.cursor === 'string' ? query.cursor : null

  const client = serverSupabaseServiceRole(event)
  let q = client
    .from('lead_events')
    .select('id, type, target, path, meta, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (cursor) q = q.lt('created_at', cursor)

  const { data, error } = await q
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  const items: ActivityItem[] = (data ?? []).map((row) => ({
    id: String(row.id),
    type: row.type,
    target: row.target,
    path: row.path,
    meta: row.meta,
    created_at: row.created_at
  }))

  const next_cursor = items.length === limit ? items[items.length - 1]?.created_at ?? null : null

  return { items, next_cursor }
})
