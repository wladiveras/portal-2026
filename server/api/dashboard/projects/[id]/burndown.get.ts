import type { BurndownPoint, BurndownResult } from '~~/server/domain/dashboard/burndown'
import { qryGetBurndown } from '~~/server/application/dashboard/agile/queries'

export type { BurndownPoint }

export type BurndownResponse = BurndownResult

export default defineEventHandler(async (event): Promise<BurndownResponse> => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'project id required' })

  const query = getQuery(event)
  const sprintId = typeof query.sprint === 'string' ? query.sprint : null

  return qryGetBurndown(event, id, sprintId)
})
