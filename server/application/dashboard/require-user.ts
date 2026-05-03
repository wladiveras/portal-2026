import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import type { H3Event } from 'h3'

export async function requireDashboardUserId(event: H3Event): Promise<string> {
  const client = await serverSupabaseClient<Database>(event)
  const { data: auth } = await client.auth.getUser()
  const id = auth.user?.id
  if (!id) throw createError({ statusCode: 401, statusMessage: 'auth required' })
  return id
}
