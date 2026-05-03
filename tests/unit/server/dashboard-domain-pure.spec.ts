import { describe, expect, it } from 'vitest'

import { buildBurndownResult } from '~~/server/domain/dashboard/burndown'
import { aggregateLeadChartRows } from '~~/server/domain/dashboard/leads/chart-aggregation'

describe('aggregateLeadChartRows', () => {
  const anchor = new Date('2026-04-30T12:00:00.000Z').getTime()

  it('fills last 30 calendar days and buckets leads by day', () => {
    const rows = [
      { first_seen: '2026-04-30T08:00:00.000Z', status: 'new' as const, utm_source: null },
      { first_seen: '2026-04-29T08:00:00.000Z', status: 'contacted' as const, utm_source: 'Google' },
      { first_seen: '2026-04-28T08:00:00.000Z', status: 'new' as const, utm_source: 'google' }
    ]
    const out = aggregateLeadChartRows(rows, anchor)
    expect(out.leadsByDay).toHaveLength(30)
    const apr30 = out.leadsByDay.find((d) => d.date === '2026-04-30')
    const apr29 = out.leadsByDay.find((d) => d.date === '2026-04-29')
    expect(apr30?.count).toBe(1)
    expect(apr29?.count).toBe(1)
    expect(out.sources.find((s) => s.label === 'google')?.value).toBe(2)
    expect(out.funnel.find((f) => f.status === 'new')?.value).toBe(2)
    expect(out.funnel.find((f) => f.status === 'contacted')?.value).toBe(1)
  })
})

describe('buildBurndownResult', () => {
  it('returns empty when no sprint', () => {
    expect(buildBurndownResult(null, [])).toEqual({
      sprint_id: null,
      total_points: 0,
      points: []
    })
  })

  it('builds ideal and actual series for sprint window', () => {
    const sprint = {
      id: 's1',
      starts_at: '2026-04-01T00:00:00.000Z',
      ends_at: '2026-04-03T23:59:59.999Z'
    }
    const tasks = [
      { points: 3, done_at: '2026-04-02T15:00:00.000Z' },
      { points: 2, done_at: null }
    ]
    const out = buildBurndownResult(sprint, tasks)
    expect(out.sprint_id).toBe('s1')
    expect(out.total_points).toBe(5)
    expect(out.points).toHaveLength(3)
    expect(out.points[0].date).toBe('2026-04-01')
    expect(out.points[2].ideal).toBe(0)
  })

  it('handles single-day sprint without throwing', () => {
    const sprint = {
      id: 's2',
      starts_at: '2026-05-01T00:00:00.000Z',
      ends_at: '2026-05-01T23:59:59.999Z'
    }
    const out = buildBurndownResult(sprint, [{ points: 1, done_at: '2026-05-01T12:00:00.000Z' }])
    expect(out.points).toHaveLength(1)
    expect(out.total_points).toBe(1)
  })
})
