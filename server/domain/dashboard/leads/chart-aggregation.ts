import type { LeadChartRow, LeadStatus } from '~~/server/domain/dashboard/leads/repositories'

export interface DashboardChartsPayload {
  leadsByDay: Array<{ date: string; count: number }>
  sources: Array<{ label: string; value: number }>
  funnel: Array<{ status: string; value: number }>
}

const STATUSES: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** Aggregates chart rows (last 30d window) into dashboard chart payload. */
export function aggregateLeadChartRows(rows: LeadChartRow[], nowMs = Date.now()): DashboardChartsPayload {
  const byDay = new Map<string, number>()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(nowMs - i * 24 * 60 * 60 * 1000)
    byDay.set(isoDay(d), 0)
  }
  for (const lead of rows) {
    const day = isoDay(new Date(lead.first_seen))
    if (byDay.has(day)) byDay.set(day, (byDay.get(day) ?? 0) + 1)
  }

  const sourceCounts = new Map<string, number>()
  for (const s of rows) {
    const key = (s.utm_source ?? 'direct').toLowerCase().slice(0, 32)
    sourceCounts.set(key, (sourceCounts.get(key) ?? 0) + 1)
  }
  const topSources = Array.from(sourceCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value]) => ({ label, value }))

  const funnelMap = new Map<string, number>()
  for (const status of STATUSES) funnelMap.set(status, 0)
  for (const lead of rows) {
    funnelMap.set(lead.status, (funnelMap.get(lead.status) ?? 0) + 1)
  }
  const funnel = STATUSES.map((status) => ({ status, value: funnelMap.get(status) ?? 0 }))

  return {
    leadsByDay: Array.from(byDay.entries()).map(([date, count]) => ({ date, count })),
    sources: topSources,
    funnel
  }
}
