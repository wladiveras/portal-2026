export interface DashboardChartsResponse {
  leadsByDay: Array<{ date: string; count: number }>
  sources: Array<{ label: string; value: number }>
  funnel: Array<{ status: string; value: number }>
}

const STATUSES: Array<'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'> = [
  'new',
  'contacted',
  'qualified',
  'proposal',
  'won',
  'lost'
]

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export default defineEventHandler(async (event): Promise<DashboardChartsResponse> => {
  const client = serverSupabaseServiceRole(event)
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [{ data: leads, error: lErr }, { data: sources, error: sErr }] = await Promise.all([
    client
      .from('leads')
      .select('first_seen, status, utm_source')
      .gte('first_seen', since)
      .limit(5000),
    client
      .from('leads')
      .select('utm_source')
      .gte('first_seen', since)
      .limit(5000)
  ])

  if (lErr) throw createError({ statusCode: 500, statusMessage: lErr.message })
  if (sErr) throw createError({ statusCode: 500, statusMessage: sErr.message })

  const byDay = new Map<string, number>()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    byDay.set(isoDay(d), 0)
  }
  for (const lead of leads ?? []) {
    const day = isoDay(new Date(lead.first_seen))
    if (byDay.has(day)) byDay.set(day, (byDay.get(day) ?? 0) + 1)
  }

  const sourceCounts = new Map<string, number>()
  for (const s of sources ?? []) {
    const key = (s.utm_source ?? 'direct').toLowerCase().slice(0, 32)
    sourceCounts.set(key, (sourceCounts.get(key) ?? 0) + 1)
  }
  const topSources = Array.from(sourceCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value]) => ({ label, value }))

  const funnelMap = new Map<string, number>()
  for (const status of STATUSES) funnelMap.set(status, 0)
  for (const lead of leads ?? []) {
    funnelMap.set(lead.status, (funnelMap.get(lead.status) ?? 0) + 1)
  }
  const funnel = STATUSES.map((status) => ({ status, value: funnelMap.get(status) ?? 0 }))

  return {
    leadsByDay: Array.from(byDay.entries()).map(([date, count]) => ({ date, count })),
    sources: topSources,
    funnel
  }
})
