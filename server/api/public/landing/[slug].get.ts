import { qryPublicLandingBySlug } from '~~/server/application/dashboard/landing/queries'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug required' })
  return qryPublicLandingBySlug(event, slug)
})
