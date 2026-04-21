import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })

  const authClient = await serverSupabaseClient<Database>(event)
  const { data: userRes } = await authClient.auth.getUser()
  const userId = userRes.user?.id
  if (!userId) throw createError({ statusCode: 401, statusMessage: 'auth required' })

  const { data: profile } = await authClient
    .from('profiles')
    .select('role,disabled')
    .eq('id', userId)
    .maybeSingle()
  if (!profile || profile.disabled || profile.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'admin only' })
  }

  const service = serverSupabaseServiceRole(event)
  const { error } = await service.from('leads').delete().eq('id', id)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  // Audit stub — phase 09 wires the real audit_log table/triggers.
  // eslint-disable-next-line no-console
  console.info('[audit] lead.delete', { actor: userId, lead_id: id, at: new Date().toISOString() })

  setResponseStatus(event, 204)
  return null
})
