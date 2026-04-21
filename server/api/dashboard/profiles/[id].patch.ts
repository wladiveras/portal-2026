import type { Database } from '~/types/database.types'

type UserRole = Database['public']['Enums']['user_role']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

const VALID: UserRole[] = ['admin', 'editor', 'viewer']

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
  if (body.role && !VALID.includes(body.role)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid role' })
  }

  // Protect self from being locked out.
  if (id === userId && (body.role && body.role !== 'admin' || body.disabled === true)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'não pode alterar seu próprio role ou desativar-se'
    })
  }

  const patch: ProfileUpdate = {}
  if (body.role !== undefined) patch.role = body.role
  if (body.disabled !== undefined) patch.disabled = body.disabled
  if (body.full_name !== undefined) patch.full_name = body.full_name

  const service = serverSupabaseServiceRole(event)
  const { data, error } = await service
    .from('profiles')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data
})
