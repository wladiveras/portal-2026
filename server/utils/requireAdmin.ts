import { serverSupabaseClient } from '#supabase/server'
import type { H3Event } from 'h3'
import type { Database } from '~/types/database.types'

export interface AdminContext {
  userId: string
}

/**
 * Guard for admin-only Nitro endpoints. Validates session via the auth-bound
 * Supabase client, then checks `profiles.role = 'admin'`. Throws 401/403.
 */
export async function requireAdmin(event: H3Event): Promise<AdminContext> {
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
  return { userId }
}
