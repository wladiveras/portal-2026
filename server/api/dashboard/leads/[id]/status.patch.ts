import type { Database } from '~/types/database.types'
import { cmdUpdateLeadStatus } from '~~/server/application/dashboard/leads/commands'

type LeadStatus = Database['public']['Enums']['lead_status']

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })

  const body = (await readBody(event)) as { status?: string } | undefined
  const { userId } = await requireEditorOrAdmin(event)
  const updated = await cmdUpdateLeadStatus(event, {
    id,
    actorId: userId,
    status: body?.status
  })
  return { status: updated.status as LeadStatus }
})
