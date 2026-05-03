import type { H3Event } from '~~/server/domain/dashboard/shared'
import { aggregateLeadChartRows } from '~~/server/domain/dashboard/leads/chart-aggregation'
import type { DashboardChartsPayload } from '~~/server/domain/dashboard/leads/chart-aggregation'
import type { LeadActivityFeedItem, LeadStatus } from '~~/server/domain/dashboard/leads/repositories'
import { createLeadsRepository } from '~~/server/infrastructure/dashboard/factory'

export interface ListLeadsQueryInput {
  page?: number
  pageSize?: number
  status?: string[] | string
  source?: string
  utm_campaign?: string
  search?: string
  since?: string
  until?: string
}

const VALID_STATUS: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']

function normalizeStatusFilter(raw: ListLeadsQueryInput['status']): LeadStatus[] | undefined {
  if (Array.isArray(raw)) {
    const values = raw.filter((s): s is LeadStatus => VALID_STATUS.includes(s as LeadStatus))
    return values.length ? values : undefined
  }
  if (typeof raw === 'string' && VALID_STATUS.includes(raw as LeadStatus)) return [raw as LeadStatus]
  return undefined
}

export async function qryListLeads(event: H3Event, input: ListLeadsQueryInput) {
  const repository = createLeadsRepository(event)
  return repository.list({
    page: Math.max(1, Number(input.page) || 1),
    pageSize: Math.min(100, Math.max(10, Number(input.pageSize) || 25)),
    status: normalizeStatusFilter(input.status),
    source: typeof input.source === 'string' ? [input.source] : undefined,
    utmCampaign: typeof input.utm_campaign === 'string' ? input.utm_campaign : undefined,
    q: typeof input.search === 'string' ? input.search.trim().slice(0, 128) : undefined,
    from: typeof input.since === 'string' ? input.since : undefined,
    to: typeof input.until === 'string' ? input.until : undefined
  })
}

export async function qryGetLeadDetail(event: H3Event, id: string) {
  const repository = createLeadsRepository(event)
  const detail = await repository.getDetailById(id)
  if (!detail) {
    throw createError({ statusCode: 404, statusMessage: 'lead not found' })
  }
  return detail
}

const STATS_RANGES: Record<'7d' | '30d' | '90d', number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90
}

export interface DashboardStatsPayload {
  range: '7d' | '30d' | '90d'
  leads: { current: number; previous: number }
  conversions: { current: number; previous: number }
  active_projects: number
  open_tasks: number
}

export async function qryDashboardStats(event: H3Event, range: '7d' | '30d' | '90d'): Promise<DashboardStatsPayload> {
  const days = STATS_RANGES[range]
  const now = Date.now()
  const startCurrent = new Date(now - days * 24 * 60 * 60 * 1000).toISOString()
  const startPrevious = new Date(now - 2 * days * 24 * 60 * 60 * 1000).toISOString()
  const repository = createLeadsRepository(event)
  const stats = await repository.getLeadConversionStats({
    currentSince: startCurrent,
    previousSince: startPrevious,
    previousUntil: startCurrent
  })
  return {
    range,
    leads: stats.leads,
    conversions: stats.conversions,
    active_projects: 0,
    open_tasks: 0
  }
}

export async function qryDashboardCharts(event: H3Event): Promise<DashboardChartsPayload> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const repository = createLeadsRepository(event)
  const rows = await repository.getLeadChartRows(since)
  return aggregateLeadChartRows(rows)
}

export async function qryDashboardActivity(
  event: H3Event,
  input: { limit: number; cursor: string | null }
): Promise<{ items: LeadActivityFeedItem[]; next_cursor: string | null }> {
  const repository = createLeadsRepository(event)
  const items = await repository.listLeadActivityFeed(input)
  const next_cursor =
    items.length === input.limit ? items[items.length - 1]?.created_at ?? null : null
  return { items, next_cursor }
}
