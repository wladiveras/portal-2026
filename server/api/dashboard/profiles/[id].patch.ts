import type { Database } from '~/types/database.types'
import { cmdUpdateProfile } from '~~/server/application/dashboard/access/commands'

type UserRole = Database['public']['Enums']['user_role']
interface Body {
  role?: UserRole
  disabled?: boolean
  full_name?: string | null
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })

  const { userId } = await requireAdmin(event)
  const body = (await readBody(event)) as Body | undefined
  if (!body) throw createError({ statusCode: 400, statusMessage: 'body required' })
  return cmdUpdateProfile(event, {
    profileId: id,
    actorId: userId,
    role: body.role,
    disabled: body.disabled,
    full_name: body.full_name
  })
})
