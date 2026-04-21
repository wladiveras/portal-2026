import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })

  const body = (await readBody(event)) as { body?: string } | undefined
  const text = body?.body?.trim() ?? ''
  if (!text || text.length > 4000) {
    throw createError({ statusCode: 400, statusMessage: 'body must be 1..4000 chars' })
  }

  const authClient = await serverSupabaseClient<Database>(event)
  const { data: userRes } = await authClient.auth.getUser()
  const userId = userRes.user?.id
  if (!userId) throw createError({ statusCode: 401, statusMessage: 'auth required' })

  const { data: profile } = await authClient
    .from('profiles')
    .select('role,disabled')
    .eq('id', userId)
    .maybeSingle()
  if (!profile || profile.disabled || !['admin', 'editor'].includes(profile.role)) {
    throw createError({ statusCode: 403, statusMessage: 'forbidden' })
  }

  const service = serverSupabaseServiceRole(event)
  const { data, error } = await service
    .from('lead_notes')
    .insert({ lead_id: id, author_id: userId, body: text })
    .select('*')
    .single()
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return data
})
