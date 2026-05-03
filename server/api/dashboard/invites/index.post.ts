import type { Database } from '~/types/database.types'
import { cmdCreateInvite } from '~~/server/application/dashboard/access/commands'

interface Body {
  email?: string
  role?: Database['public']['Enums']['user_role']
}

export default defineEventHandler(async (event) => {
  const { userId } = await requireAdmin(event)
  const body = (await readBody(event)) as Body | undefined
  return cmdCreateInvite(event, {
    actorId: userId,
    email: body?.email,
    role: body?.role,
    origin: getRequestHeader(event, 'origin') ?? undefined,
    forwardedHost: getRequestHeader(event, 'x-forwarded-host') ?? undefined
  })
})
