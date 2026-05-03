import type { DashboardChartsPayload } from '~~/server/domain/dashboard/leads/chart-aggregation'
import { qryDashboardCharts } from '~~/server/application/dashboard/leads/queries'

export type DashboardChartsResponse = DashboardChartsPayload

export default defineEventHandler(async (event): Promise<DashboardChartsResponse> => {
  return qryDashboardCharts(event)
})
