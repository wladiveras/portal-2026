import { requireDashboardUserId } from '~~/server/application/dashboard/require-user'
import { qryLandingForDashboard } from '~~/server/application/dashboard/landing/queries'

export default defineEventHandler(async (event) => {
  await requireDashboardUserId(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })
  return qryLandingForDashboard(event, id)
})
