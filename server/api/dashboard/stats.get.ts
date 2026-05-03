import { qryDashboardStats } from '~~/server/application/dashboard/leads/queries'

interface StatPair {
  current: number
  previous: number
}

export interface DashboardStatsResponse {
  range: '7d' | '30d' | '90d'
  leads: StatPair
  conversions: StatPair
  active_projects: number
  open_tasks: number
}

const RANGES: Record<DashboardStatsResponse['range'], number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90
}

export default defineEventHandler(async (event): Promise<DashboardStatsResponse> => {
  const query = getQuery(event)
  const range = (typeof query.range === 'string' && query.range in RANGES
    ? query.range
    : '7d') as DashboardStatsResponse['range']

  return qryDashboardStats(event, range)
})
