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
  const days = RANGES[range]

  const now = Date.now()
  const startCurrent = new Date(now - days * 24 * 60 * 60 * 1000).toISOString()
  const startPrevious = new Date(now - 2 * days * 24 * 60 * 60 * 1000).toISOString()

  const client = serverSupabaseServiceRole(event)

  async function countLeads(since: string, until?: string) {
    let q = client
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .gte('first_seen', since)
    if (until) q = q.lt('first_seen', until)
    const { count, error } = await q
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return count ?? 0
  }

  async function countConversions(since: string, until?: string) {
    let q = client
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'won')
      .gte('first_seen', since)
    if (until) q = q.lt('first_seen', until)
    const { count, error } = await q
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return count ?? 0
  }

  const [
    leadsCurrent,
    leadsPrevious,
    convCurrent,
    convPrevious
  ] = await Promise.all([
    countLeads(startCurrent),
    countLeads(startPrevious, startCurrent),
    countConversions(startCurrent),
    countConversions(startPrevious, startCurrent)
  ])

  return {
    range,
    leads: { current: leadsCurrent, previous: leadsPrevious },
    conversions: { current: convCurrent, previous: convPrevious },
    active_projects: 0,
    open_tasks: 0
  }
})
