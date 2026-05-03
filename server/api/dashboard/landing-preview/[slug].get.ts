import { requireDashboardUserId } from '~~/server/application/dashboard/require-user'
import { qryLandingDraftPreviewBySlug } from '~~/server/application/dashboard/landing/queries'

export default defineEventHandler(async (event) => {
  await requireDashboardUserId(event)
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug required' })
  return qryLandingDraftPreviewBySlug(event, slug)
})
