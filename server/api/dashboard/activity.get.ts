import type { Json } from '~/types/database.types'
import { qryDashboardActivity } from '~~/server/application/dashboard/leads/queries'

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

  const data = await qryDashboardActivity(event, { limit, cursor })
  return {
    items: data.items as ActivityItem[],
    next_cursor: data.next_cursor
  }
})
